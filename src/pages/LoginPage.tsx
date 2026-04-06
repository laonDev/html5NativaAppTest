import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { App as CapApp } from '@capacitor/app';
import { accountApi, gameApi, suprApi } from '@/api/rest';
import { useAuthStore } from '@/stores/authStore';
import { useBalanceStore } from '@/stores/balanceStore';
import { useVoltStore } from '@/stores/voltStore';
import { useTicketStore } from '@/stores/ticketStore';
import { useBingoStore } from '@/stores/bingoStore';
import { useMissionStore } from '@/stores/missionStore';
import { useTournamentStore } from '@/stores/tournamentStore';
import { useGameStore } from '@/stores/gameStore';
import type { AuthInfo } from '@/types';
import { StorageBridge } from '../native/storage/index'

// ─── SVG Icons ───────────────────────────────────────────────────────────────
function EyeOpenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

// ─── Loading Overlay (Root_Loading) ──────────────────────────────────────────
function LoadingOverlay({ version }: { version: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70"
    >
      {/* Progress spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="mb-4 h-12 w-12 rounded-full border-4 border-white/20 border-t-white"
      />
      {/* TXT_Loading */}
      <p className="text-lg font-bold tracking-widest text-white">LOADING...</p>
      {/* version */}
      <p className="absolute bottom-6 right-6 text-xs text-white/50">{version}</p>
    </motion.div>
  );
}

// ─── LoginPage ────────────────────────────────────────────────────────────────
export function LoginPage() {
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [appVersion, setAppVersion] = useState('1.0.0');

  // Stores
  const setServerInfo = useAuthStore((s) => s.setServerInfo);
  const setAuthInfo = useAuthStore((s) => s.setAuthInfo);
  const setLoginResult = useAuthStore((s) => s.setLoginResult);
  const setUserInfo = useAuthStore((s) => s.setUserInfo);
  const setBalance = useBalanceStore((s) => s.setBalance);
  const setCoinData = useBalanceStore((s) => s.setCoinData);
  const setVoltList = useVoltStore((s) => s.setVoltList);
  const setTicketData = useTicketStore((s) => s.setTicketData);
  const setEndTime = useBingoStore((s) => s.setEndTime);
  const setMissions = useMissionStore((s) => s.setMissions);
  const setTournament = useTournamentStore((s) => s.setTournament);
  const setCategories = useGameStore((s) => s.setCategories);
  const setGames = useGameStore((s) => s.setGames);

  // ── Error categorization helpers ─────────────────────────────────────────
  const isNetworkError = (err: unknown): boolean => {
    if (typeof err === 'string') {
      const lower = err.toLowerCase();
      return lower.includes('network') || lower.includes('timeout') || lower.includes('connect');
    }
    if (err && typeof err === 'object') {
      const e = err as Record<string, unknown>;
      return e.code === 'ERR_NETWORK' || e.code === 'ECONNABORTED' || e.message === 'Network Error';
    }
    return false;
  };

  const isAuthError = (err: unknown): boolean => {
    if (err && typeof err === 'object') {
      const e = err as Record<string, unknown>;
      const authCodes = ['INVALID_PASSWORD', 'WRONG_PASSWORD', 'INVALID_CREDENTIALS', 'AUTH_FAILED'];
      return typeof e.code === 'string' && authCodes.includes(e.code);
    }
    return false;
  };

  useEffect(() => {
    CapApp.getInfo()
      .then((info) => setAppVersion(info.version))
      .catch(() => setAppVersion('1.0.0'));
  }, []);

  // ── Core login flow (shared by all entry points) ──────────────────────────
  const handleLogin = async (authInfo: AuthInfo) => {
    setLoading(true);
    try {
      const loginRes = await accountApi.login({ authid: authInfo.authid });
      setLoginResult(loginRes.login_result);

      try {
        const lobbyData = await gameApi.enterLobby(1, 3);
        setUserInfo(lobbyData.userInfo);
        setBalance(lobbyData.balanceInfo);
        setCoinData(lobbyData.gameBalanceInfo.coinInfo);
        setVoltList(lobbyData.gameBalanceInfo.voltInfo);
        setTicketData(lobbyData.gameBalanceInfo.ticketInfo);
        setEndTime(lobbyData.houseyEndDate);

        if (lobbyData.dailyMissionInfo) {
          setMissions(
            lobbyData.dailyMissionInfo.dailyMissionInfos,
            lobbyData.dailyMissionInfo.endDate,
            lobbyData.dailyMissionInfo.status,
          );
        }

        if (lobbyData.Tournament) {
          setTournament(lobbyData.Tournament.tournamentData, lobbyData.Tournament.currentUserData);
        }

        const [catRes, gamesRes] = await Promise.all([
          suprApi.gamesCategories(),
          suprApi.games(),
        ]).catch(() => [null, null]);
        if (catRes) setCategories(catRes.categories);
        if (gamesRes) setGames(gamesRes.games);
      } catch (err) {
        // TODO: server_error 임시 bypass — 서버 정상화 후 제거
        console.warn('enterLobby failed, bypassing:', err);
      }

      navigate('/lobby', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      if (isNetworkError(err)) {
        setGeneralError('Network error. Please check your connection.');
      } else if (isAuthError(err)) {
        setEmailError('Invalid email or password.');
      } else {
        setGeneralError('Server error. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Validate form fields ──────────────────────────────────────────────────
  const validate = (): boolean => {
    let valid = true;
    setGeneralError('');

    if (!email.trim()) {
      setEmailError('Email is Required');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Invalid email format');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is Required');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  };

  // ── REGISTER / LOG IN button handler ─────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    setGeneralError('');
    setLoading(true);
    try {
      const serverInfo = await accountApi.serverInfo();
      setServerInfo(serverInfo);

      const devRes = await accountApi.createDev({ dev_id: email, password });
      const authInfo = devRes.create_result;
      setAuthInfo(authInfo);

      await handleLogin(authInfo);
    } catch (err) {
      console.error('Register/Login error:', err);
      if (isNetworkError(err)) {
        setGeneralError('Network error. Please check your connection.');
      } else if (isAuthError(err)) {
        setEmailError('Invalid email or password.');
      } else {
        setGeneralError('Server error. Please try again later.');
      }
      setLoading(false);
    }
  };

  const handleForgotEmail = () => {
    // TODO: navigate to forgot email page or open modal
  };

  const handleForgotPassword = () => {
    // TODO: navigate to forgot password page or open modal
  };

  return (
    <div className="relative h-full overflow-hidden">

      {/* ── Background ── */}
      <div className="absolute inset-0 bg-[#0b0c2a]">
        <img src="/assets/images/bg/IMG_Homemain_Background.png" alt="" className="h-full w-full object-cover" />
      </div>

      {/* ── IMG_Logo ── */}
      <div className="absolute left-1/2 top-[18%] z-10 -translate-x-1/2">
        <img
          src="/assets/images/ui/IMG_Login_Logo_Glow.png"
          alt="SUPRVIC CASINO"
          className="h-36 w-auto drop-shadow-[0_0_24px_rgba(0,200,255,0.45)]"
        />
      </div>

      {/* ── Login_Box ── */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="absolute left-1/2 top-[52%] z-10 w-[82%] max-w-[340px] -translate-x-1/2 rounded-2xl border border-[#1a2a5a]/60 bg-[#06091a]/80 px-6 py-8 shadow-2xl shadow-black/60 backdrop-blur-sm"
      >
        {/* ── Input_Group ── */}
        <div className="flex flex-col gap-3">

          {/* Input_Box_Email */}
          <div className="rounded-xl border border-[#1e3a7a]/80 bg-[#08102a]/90 px-4 py-14">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
              className="w-full bg-transparent text-sm text-white placeholder-white/35 outline-none"
            />
          </div>

          {/* LB_Email_Required */}
          <AnimatePresence>
            {emailError && (
              <motion.p
                key="emailError"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-1 text-xs text-red-500"
              >
                {emailError}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Input_Box_Password */}
          <div className="flex items-center rounded-xl border border-[#1e3a7a]/80 bg-[#08102a]/90 px-4 py-14">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
            />
            {/* BTN_Eye_Open / BTN_Eye_Closed */}
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="ml-2 text-white/40 transition-colors hover:text-white/80"
            >
              {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
            </button>
          </div>

          {/* LB_Password_Required */}
          <AnimatePresence>
            {passwordError && (
              <motion.p
                key="passwordError"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-1 text-xs text-red-500"
              >
                {passwordError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* LB_General_Error */}
        <AnimatePresence>
          {generalError && (
            <motion.p
              key="generalError"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 px-1 text-xs text-red-500"
            >
              {generalError}
            </motion.p>
          )}
        </AnimatePresence>

        {/* ── IMG_Blue_Btn (REGISTER / LOG IN) ── */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={loading}
          className="mt-7 w-full rounded-xl bg-gradient-to-b from-[#3a7fff] to-[#1a50e0] py-14 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-blue-900/60 disabled:opacity-50"
        >
          {/* TXT_Connect */}
          REGISTER / LOG IN
        </motion.button>

        {/* ── LB_Forgot / BTN_Forgot_Email / LB_Or / BTN_Forgot_Password ── */}
        <div className="mt-6 flex items-center justify-center gap-1 text-sm text-white/50">
          <span>Forgot</span>
          <button
            type="button"
            onClick={handleForgotEmail}
            className="underline text-white/70 transition-colors hover:text-white"
          >
            Email
          </button>
          <span>or</span>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="underline text-white/70 transition-colors hover:text-white"
          >
            Password?
          </button>
        </div>
      </motion.div>

      {/* ── Root_Loading overlay ── */}
      <AnimatePresence>
        {loading && <LoadingOverlay version={appVersion} />}
      </AnimatePresence>

      {/* version (비로딩 시 하단 고정) */}
      {!loading && (
        <p className="absolute bottom-6 right-6 z-10 text-xs text-white/30">
          {appVersion}
        </p>
      )}
    </div>
  );
}
