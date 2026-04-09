import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { accountApi } from '@/api/rest';
import { AvatarEditModal } from '@/components/Modal/AvatarEditModal';

// ── Sub-view type ────────────────────────────────────────────────────────────
type View = 'main' | 'password';

// ── Toggle Switch ────────────────────────────────────────────────────────────
function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        on ? 'bg-gradient-to-r from-[#3a7fff] to-[#4adfff]' : 'bg-white/15'
      }`}
    >
      <motion.div
        animate={{ x: on ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow"
      />
    </button>
  );
}

// ── Password validation ──────────────────────────────────────────────────────
const PW_RULES = [
  { label: 'At least 8 characters', test: (pw: string) => pw.length >= 8 },
  { label: 'Lower case letters (a-z)', test: (pw: string) => /[a-z]/.test(pw) },
  { label: 'Upper case letters (A-Z)', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'Numbers (0-9)', test: (pw: string) => /\d/.test(pw) },
];

// ── Icons ────────────────────────────────────────────────────────────────────
function IconBack() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}
function IconChevron() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
    </svg>
  );
}
function IconEye({ show }: { show: boolean }) {
  return show ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.8 11.8 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
    </svg>
  );
}

// ── Password Input ───────────────────────────────────────────────────────────
function PasswordInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <p className="mb-1.5 text-xs font-bold text-white/50">{label}</p>
      <div className="flex items-center gap-2 rounded-xl bg-[#04092a] px-4 py-3 ring-1 ring-white/10">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
          placeholder={label}
        />
        <button onClick={() => setShow(!show)} className="text-white/40 active:opacity-60">
          <IconEye show={show} />
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SettingPage
// ═════════════════════════════════════════════════════════════════════════════
export function SettingPage() {
  const navigate = useNavigate();
  const userInfo = useAuthStore((s) => s.userInfo);
  const logout = useAuthStore((s) => s.logout);

  const [view, setView] = useState<View>('main');

  // ── Setting toggles ──
  const [notification, setNotification] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibrate, setVibrate] = useState(true);

  // ── Password state ──
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  // ── Avatar edit modal ──
  const [showAvatarEdit, setShowAvatarEdit] = useState(false);

  // ── Delete account ──
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ── Logout confirm ──
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const allPwRulesPass = PW_RULES.every((r) => r.test(newPw));
  const pwMatch = newPw === confirmPw && confirmPw.length > 0;
  const canUpdatePw = currentPw.length > 0 && allPwRulesPass && pwMatch;

  const handleUpdatePassword = useCallback(async () => {
    if (!canUpdatePw || pwLoading) return;
    setPwLoading(true);
    setPwError('');
    try {
      await accountApi.changePassword(currentPw, newPw);
      setPwSuccess(true);
      setTimeout(() => setView('main'), 1500);
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  }, [canUpdatePw, pwLoading, currentPw, newPw]);

  const handleAvatarSaved = (profileUrl: string, nickname: string) => {
    useAuthStore.getState().setUserInfo({ ...userInfo!, profileUrl, nickname });
    setShowAvatarEdit(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleDeleteAccount = async () => {
    try {
      await accountApi.deleteAccount('User requested deletion');
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Delete account error:', err);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PASSWORD VIEW
  // ─────────────────────────────────────────────────────────────────────────
  if (view === 'password') {
    return (
      <div className="flex h-full flex-col bg-gradient-to-b from-[#050d35] to-[#030820]">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5">
          <button onClick={() => setView('main')} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a1a6a]/80 text-white ring-1 ring-white/20 active:opacity-70">
            <IconBack />
          </button>
          <h2 className="flex-1 text-base font-bold italic text-white">Password</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <div className="flex flex-col gap-4">
            <PasswordInput label="Current Password" value={currentPw} onChange={setCurrentPw} />
            <PasswordInput label="New Password" value={newPw} onChange={setNewPw} />
            <PasswordInput label="Confirm New Password" value={confirmPw} onChange={setConfirmPw} />

            {/* Validation rules */}
            <div className="rounded-xl bg-[#0a1a6a]/50 px-4 py-3 ring-1 ring-white/8">
              <p className="mb-2 text-xs font-bold text-white/60">Your password must contain:</p>
              {PW_RULES.map((rule) => {
                const pass = rule.test(newPw);
                return (
                  <div key={rule.label} className="flex items-center gap-2 py-1">
                    <div className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${pass ? 'bg-green-500 text-white' : 'bg-white/10 text-white/30'}`}>
                      ✓
                    </div>
                    <p className={`text-xs ${pass ? 'text-green-400' : 'text-white/40'}`}>{rule.label}</p>
                  </div>
                );
              })}
              {/* Confirm match */}
              {confirmPw.length > 0 && (
                <div className="flex items-center gap-2 py-1">
                  <div className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${pwMatch ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {pwMatch ? '✓' : '✕'}
                  </div>
                  <p className={`text-xs ${pwMatch ? 'text-green-400' : 'text-red-400'}`}>
                    {pwMatch ? 'Passwords match' : 'Passwords do not match'}
                  </p>
                </div>
              )}
            </div>

            {pwError && <p className="text-center text-xs text-red-400">{pwError}</p>}
            {pwSuccess && <p className="text-center text-xs text-green-400">Password updated successfully!</p>}

            {/* Update button */}
            <motion.button
              whileTap={canUpdatePw ? { scale: 0.97 } : undefined}
              onClick={handleUpdatePassword}
              disabled={!canUpdatePw || pwLoading}
              className={`rounded-xl py-3.5 text-sm font-black tracking-wider text-white ${
                canUpdatePw
                  ? 'bg-gradient-to-b from-[#5adc5a] to-[#28a028] shadow shadow-green-900/50'
                  : 'bg-white/10 text-white/30'
              }`}
            >
              {pwLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN SETTING VIEW
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative flex h-full flex-col bg-gradient-to-b from-[#050d35] to-[#030820]">

      {/* ── Avatar Edit Modal ── */}
      <AnimatePresence>
        {showAvatarEdit && (
          <AvatarEditModal
            onClose={() => setShowAvatarEdit(false)}
            onSaved={handleAvatarSaved}
          />
        )}
      </AnimatePresence>

      {/* ── Logout Confirm Popup ── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 px-8"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="w-full max-w-[320px] overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-2xl shadow-black/70"
            >
              <div className="bg-gradient-to-b from-[#3a7fff] to-[#1a50e0] px-6 py-4 text-center">
                <p className="text-lg font-black tracking-widest text-white">LOG OUT</p>
              </div>
              <div className="bg-[#0a1230] px-6 py-7 text-center">
                <p className="text-base font-semibold text-white">Are you sure you want to leave?</p>
                <div className="mt-6 flex gap-3">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleLogout} className="flex-1 rounded-xl bg-gradient-to-b from-[#5adc5a] to-[#28a028] py-3 text-sm font-black tracking-widest text-white shadow shadow-green-900/50">
                    LOGOUT
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowLogoutConfirm(false)} className="flex-1 rounded-xl bg-gradient-to-b from-[#ff5a5a] to-[#d02020] py-3 text-sm font-black tracking-widest text-white shadow shadow-red-900/50">
                    CANCEL
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Account Confirm ── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 px-8"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="w-full max-w-[320px] overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-2xl shadow-black/70"
            >
              <div className="bg-gradient-to-b from-[#ff5a5a] to-[#d02020] px-6 py-4 text-center">
                <p className="text-lg font-black tracking-widest text-white">DELETE ACCOUNT</p>
              </div>
              <div className="bg-[#0a1230] px-6 py-7 text-center">
                <p className="text-sm font-semibold text-white">This action cannot be undone. Are you sure?</p>
                <div className="mt-6 flex gap-3">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleDeleteAccount} className="flex-1 rounded-xl bg-gradient-to-b from-[#ff5a5a] to-[#d02020] py-3 text-sm font-black tracking-widest text-white shadow shadow-red-900/50">
                    DELETE
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-xl bg-gradient-to-b from-[#3a7fff] to-[#1a50e0] py-3 text-sm font-black tracking-widest text-white shadow shadow-blue-900/50">
                    CANCEL
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3.5">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a1a6a]/80 text-white ring-1 ring-white/20 active:opacity-70"
        >
          <IconBack />
        </button>
        <h2 className="text-base font-bold italic text-white">Setting</h2>
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a1a6a]/80 text-white ring-1 ring-white/20 active:opacity-70"
        >
          <IconClose />
        </button>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="flex flex-col gap-3">

          {/* ── Account Section ── */}
          <div className="rounded-2xl bg-[#0a1a6a]/70 ring-1 ring-white/10">
            <p className="px-4 pt-4 pb-2 text-xs font-bold tracking-widest text-[#4adfff]">Account</p>

            {/* Profile */}
            <button
              onClick={() => setShowAvatarEdit(true)}
              className="flex w-full items-center gap-3 px-4 py-3 active:bg-white/5"
            >
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#0d2280] ring-2 ring-[#4a9fff]/40">
                {userInfo?.profileUrl ? (
                  <img src={userInfo.profileUrl} alt="profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl">👤</span>
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-white">{userInfo?.nickname || 'Guest'}</p>
                <p className="text-[11px] text-white/40">{userInfo?.email || ''}</p>
              </div>
              <span className="text-white/30"><IconChevron /></span>
            </button>

            <div className="mx-4 h-px bg-white/8" />

            {/* Password */}
            <button
              onClick={() => {
                setCurrentPw('');
                setNewPw('');
                setConfirmPw('');
                setPwError('');
                setPwSuccess(false);
                setView('password');
              }}
              className="flex w-full items-center gap-3 px-4 py-3.5 active:bg-white/5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#04092a] text-[#4a9fff] ring-1 ring-white/10">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
              </div>
              <p className="flex-1 text-left text-sm font-semibold text-white">Password</p>
              <span className="text-white/30"><IconChevron /></span>
            </button>
          </div>

          {/* ── Toggle Section ── */}
          <div className="rounded-2xl bg-[#0a1a6a]/70 ring-1 ring-white/10">
            {/* Notification */}
            <div className="flex items-center justify-between px-4 py-3.5">
              <p className="text-sm font-semibold text-white">Notification</p>
              <ToggleSwitch on={notification} onToggle={() => setNotification(!notification)} />
            </div>
            <div className="mx-4 h-px bg-white/8" />
            {/* Sound */}
            <div className="flex items-center justify-between px-4 py-3.5">
              <p className="text-sm font-semibold text-white">Sound</p>
              <ToggleSwitch on={sound} onToggle={() => setSound(!sound)} />
            </div>
            <div className="mx-4 h-px bg-white/8" />
            {/* Vibrate */}
            <div className="flex items-center justify-between px-4 py-3.5">
              <p className="text-sm font-semibold text-white">Vibrate</p>
              <ToggleSwitch on={vibrate} onToggle={() => setVibrate(!vibrate)} />
            </div>
          </div>

          {/* ── Information Section ── */}
          <div className="rounded-2xl bg-[#0a1a6a]/70 ring-1 ring-white/10">
            <button className="flex w-full items-center justify-between px-4 py-3.5 active:bg-white/5">
              <p className="text-sm font-semibold text-white">Help Center</p>
              <span className="text-white/30"><IconChevron /></span>
            </button>
            <div className="mx-4 h-px bg-white/8" />
            <button className="flex w-full items-center justify-between px-4 py-3.5 active:bg-white/5">
              <p className="text-sm font-semibold text-white">Terms and Conditions</p>
              <span className="text-white/30"><IconChevron /></span>
            </button>
            <div className="mx-4 h-px bg-white/8" />
            <button className="flex w-full items-center justify-between px-4 py-3.5 active:bg-white/5">
              <p className="text-sm font-semibold text-white">Privacy Policy</p>
              <span className="text-white/30"><IconChevron /></span>
            </button>
          </div>

          {/* ── Danger Zone ── */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-2xl bg-[#0a1a6a]/70 px-4 py-3.5 text-left text-sm font-semibold text-red-400 ring-1 ring-white/10 active:bg-white/5"
          >
            Delete Account
          </button>

          {/* ── Logout ── */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowLogoutConfirm(true)}
            className="rounded-2xl bg-gradient-to-b from-[#ff5a5a] to-[#d02020] py-3.5 text-center text-sm font-black tracking-widest text-white shadow shadow-red-900/50"
          >
            LOGOUT
          </motion.button>

        </div>
      </div>
    </div>
  );
}
