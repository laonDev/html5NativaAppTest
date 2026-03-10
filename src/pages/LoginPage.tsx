import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

export function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appVersion, setAppVersion] = useState('');

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

  useEffect(() => {
    CapApp.getInfo()
      .then((info) => setAppVersion(info.version))
      .catch(() => setAppVersion('1.0.0'));

    // Auto-login check
    const savedAuth = localStorage.getItem('authInfo');
    if (savedAuth) {
      try {
        const authInfo: AuthInfo = JSON.parse(savedAuth);
        handleLogin(authInfo);
      } catch {
        // Invalid cached data
      }
    }
  }, []);

  const handleLogin = async (authInfo: AuthInfo) => {
    setLoading(true);
    setError('');
    try {
      // Login
      const loginRes = await accountApi.login({ authid: authInfo.authid });
      setLoginResult(loginRes.login_result);

      // Enter Lobby
      const lobbyData = await gameApi.enterLobby(0, 100);
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

      // Load categories and games
      try {
        const [catRes, gamesRes] = await Promise.all([
          suprApi.gamesCategories(),
          suprApi.games(),
        ]);
        setCategories(catRes.categories);
        setGames(gamesRes.games);
      } catch {
        // Non-critical, lobby can still show
      }

      navigate('/lobby', { replace: true });
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // Server Info
      const serverInfo = await accountApi.serverInfo();
      setServerInfo(serverInfo);

      // Create Guest
      const guestRes = await accountApi.createGuest({});
      const authInfo = guestRes.create_result;
      setAuthInfo(authInfo);

      // Login flow
      await handleLogin(authInfo);
    } catch (err) {
      setError('Failed to connect. Please try again.');
      console.error('Guest login error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#1a1a2e] px-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h1 className="mb-2 text-4xl font-bold text-[#e94560]">iGaming</h1>
        <p className="text-sm text-gray-400">HTML5 Native App</p>
      </motion.div>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={handleGuestLogin}
        disabled={loading}
        className="w-full max-w-xs rounded-xl bg-[#e94560] py-4 text-lg font-bold text-white transition-transform active:scale-95 disabled:opacity-50"
      >
        {loading ? 'Connecting...' : 'Play as Guest'}
      </motion.button>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}

      <p className="absolute bottom-8 text-xs text-gray-600">
        Version {appVersion}
      </p>
    </div>
  );
}
