import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { accountApi } from '@/api/rest';
import { useAuthStore } from '@/stores/authStore';
import { useDebounce } from '@/hooks/useDebounce';

// ── Avatar list (Unity AvatarListData.json 기반, 로컬 이미지) ────────────────
const BASE_URL = '/assets/images/avatar';

const AVATAR_LIST: { key: string; url: string }[] = [
  { key: '0',  url: `${BASE_URL}/IMG_Profile_Character_00.png` },
  { key: '1',  url: `${BASE_URL}/IMG_Profile_Character_01.png` },
  { key: '2',  url: `${BASE_URL}/IMG_Profile_Character_02.png` },
  { key: '3',  url: `${BASE_URL}/IMG_Profile_Character_03.png` },
  { key: '4',  url: `${BASE_URL}/IMG_Profile_Character_04.png` },
  { key: '5',  url: `${BASE_URL}/IMG_Profile_Character_05.png` },
  { key: '6',  url: `${BASE_URL}/IMG_Profile_Character_06.png` },
  { key: '7',  url: `${BASE_URL}/IMG_Profile_Character_07.png` },
  { key: '8',  url: `${BASE_URL}/IMG_Profile_Character_08.png` },
  { key: '9',  url: `${BASE_URL}/IMG_Profile_Character_09.png` },
  { key: '10', url: `${BASE_URL}/IMG_Profile_Character_10.png` },
  { key: '11', url: `${BASE_URL}/IMG_Profile_Character_11.png` },
  { key: '12', url: `${BASE_URL}/IMG_Profile_Character_12.png` },
  { key: '13', url: `${BASE_URL}/IMG_Profile_Character_13.png` },
  { key: '14', url: `${BASE_URL}/IMG_Profile_Character_14.png` },
  { key: '15', url: `${BASE_URL}/IMG_Profile_Character_15.png` },
];

// ── Nickname validation ───────────────────────────────────────────────────────
type NicknameState = 'idle' | 'checking' | 'valid' | 'invalid' | 'duplicate';

function validateNicknameLocal(name: string): boolean {
  return name.length >= 2 && name.length <= 15 && /^[a-zA-Z0-9]+$/.test(name);
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconPencil() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}
function IconX() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface AvatarEditModalProps {
  onClose: () => void;
  onSaved: (profileUrl: string, nickname: string) => void;
}

// ── AvatarEditModal ───────────────────────────────────────────────────────────
export function AvatarEditModal({ onClose, onSaved }: AvatarEditModalProps) {
  const userInfo = useAuthStore((s) => s.userInfo);

  // Avatar state
  const [selectedUrl, setSelectedUrl] = useState<string>(userInfo?.profileUrl ?? '');
  const avatarChanged = selectedUrl !== (userInfo?.profileUrl ?? '');

  // Nickname state
  const [nickname, setNickname] = useState(userInfo?.nickname ?? '');
  const [isEditingNick, setIsEditingNick] = useState(false);
  const [nickState, setNickState] = useState<NicknameState>('idle');
  const debouncedNick = useDebounce(nickname, 800);
  const nicknameChanged = nickname !== (userInfo?.nickname ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Misc state
  const [isLoading, setIsLoading] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canSave = (avatarChanged || (nicknameChanged && nickState === 'valid')) && !isLoading;

  // ── Nickname duplicate check (debounced) ──────────────────────────────────
  useEffect(() => {
    if (!isEditingNick) return;
    const name = debouncedNick.trim();

    if (name === (userInfo?.nickname ?? '')) {
      setNickState('idle');
      return;
    }
    if (!validateNicknameLocal(name)) {
      setNickState('invalid');
      return;
    }

    setNickState('checking');
    accountApi.checkNicknameDuplication(name)
      .then(() => setNickState('valid'))
      .catch(() => setNickState('duplicate'));
  }, [debouncedNick, isEditingNick, userInfo?.nickname]);

  const handleNicknameChange = (value: string) => {
    // 영문자/숫자만 허용
    const filtered = value.replace(/[^a-zA-Z0-9]/g, '');
    setNickname(filtered);
    setNickState('idle');
  };

  const handleEditNick = () => {
    setIsEditingNick(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!canSave) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const tasks: Promise<void>[] = [];
      if (avatarChanged) tasks.push(accountApi.changeProfile(selectedUrl));
      if (nicknameChanged && nickState === 'valid') tasks.push(accountApi.changeNickname(nickname));
      await Promise.all(tasks);
      onSaved(selectedUrl, nickname);
    } catch (err: any) {
      // action:2 (expired_token) 는 client.ts에서 자동 리다이렉트
      if (err?.action !== 2) {
        setErrorMsg(err?.message ?? 'Failed to save. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Close guard ───────────────────────────────────────────────────────────
  const handleClose = () => {
    if (avatarChanged || nicknameChanged) {
      setShowLeaveConfirm(true);
    } else {
      onClose();
    }
  };

  const previewUrl = selectedUrl || userInfo?.profileUrl || '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col bg-[#030c2e]/95"
    >
      {/* ── Leave Confirm ── */}
      <AnimatePresence>
        {showLeaveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 px-8"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="w-full max-w-[300px] overflow-hidden rounded-2xl shadow-2xl"
            >
              <div className="bg-gradient-to-b from-[#3a7fff] to-[#1a50e0] px-6 py-4 text-center">
                <p className="text-base font-black tracking-widest text-white">PROFILE</p>
              </div>
              <div className="bg-[#0a1230] px-6 py-6 text-center">
                <p className="text-sm font-semibold leading-relaxed text-white">
                  Are you sure you want to leave?
                </p>
                <p className="mt-1 text-xs text-white/50">Changes will not be saved.</p>
                <div className="mt-5 flex gap-3">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={onClose}
                    className="flex-1 rounded-xl bg-gradient-to-b from-[#5adc5a] to-[#28a028] py-3 text-sm font-black tracking-widest text-white">
                    CONFIRM
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowLeaveConfirm(false)}
                    className="flex-1 rounded-xl bg-gradient-to-b from-[#ff5a5a] to-[#d02020] py-3 text-sm font-black tracking-widest text-white">
                    CANCEL
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header bar ── */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3.5">
        <div className="w-9" />
        <h2 className="text-base font-bold italic text-white">Profile Setting</h2>
        <button
          onClick={handleClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white active:opacity-70"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="rounded-2xl bg-[#0a1a6a]/80 px-5 py-5 ring-1 ring-white/10">

          {/* Avatar Preview */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-[#1a3aaa] ring-2 ring-[#4a9fff]/60">
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-5xl">👤</span>
              )}
            </div>
          </div>

          {/* Email */}
          <p className="mb-4 text-center text-xs text-white/50">
            {userInfo?.email || ''}
          </p>

          {/* ── Nickname field ── */}
          <div className="mb-1">
            <div className={`flex items-center gap-2 rounded-xl px-4 py-3 ring-1 transition-all ${
              isEditingNick ? 'bg-[#06103a] ring-[#4a9fff]/60' : 'bg-[#0d2280]/60 ring-white/10'
            }`}>
              <input
                ref={inputRef}
                value={nickname}
                onChange={(e) => handleNicknameChange(e.target.value)}
                readOnly={!isEditingNick}
                maxLength={15}
                placeholder="User Name"
                className="flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder-white/30"
              />
              {!isEditingNick ? (
                <button onClick={handleEditNick} className="text-white/60 active:opacity-70">
                  <IconPencil />
                </button>
              ) : (
                <button onClick={() => setIsEditingNick(false)} className="text-white/40 active:opacity-70">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Nickname validation feedback */}
          <div className="mb-4 h-5 px-1">
            {nickState === 'checking' && (
              <span className="flex items-center gap-1 text-xs text-white/50">
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Checking...
              </span>
            )}
            {nickState === 'valid' && nicknameChanged && (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-400">
                <IconCheck /> {nickname}
              </span>
            )}
            {nickState === 'invalid' && nicknameChanged && (
              <span className="flex items-center gap-1 text-xs font-semibold text-red-400">
                <IconX /> 2–15 alphanumeric characters only
              </span>
            )}
            {nickState === 'duplicate' && (
              <span className="flex items-center gap-1 text-xs font-semibold text-red-400">
                <IconX /> Already taken
              </span>
            )}
          </div>

          {/* ── Select Avatar section ── */}
          <p className="mb-3 text-sm font-black text-white">Select Your Avatar</p>

          <div
            className="mb-5 overflow-y-auto rounded-xl"
            style={{ maxHeight: '260px' }}
          >
            <div className="grid grid-cols-3 gap-2.5">
              {AVATAR_LIST.map((avatar) => {
                const isSelected = selectedUrl === avatar.url;
                return (
                  <motion.button
                    key={avatar.key}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setSelectedUrl(isSelected ? (userInfo?.profileUrl ?? '') : avatar.url)}
                    className={`relative aspect-square overflow-hidden rounded-2xl ring-2 transition-all ${
                      isSelected ? 'ring-[#4a9fff]' : 'ring-white/10'
                    }`}
                  >
                    <div className="flex h-full w-full items-center justify-center bg-[#1a3aaa]">
                      <img
                        src={avatar.url}
                        alt={`avatar ${avatar.key}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    {isSelected && (
                      <>
                        <div className="absolute inset-0 bg-[#4a9fff]/20" />
                        <div className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#4a9fff] shadow">
                          <IconCheck />
                        </div>
                      </>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ── Error Message ── */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-3 flex items-center gap-2 rounded-xl bg-red-500/15 px-4 py-2.5 ring-1 ring-red-500/30"
              >
                <IconX />
                <p className="flex-1 text-xs font-semibold text-red-400">{errorMsg}</p>
                <button onClick={() => setErrorMsg(null)} className="text-red-400/60 active:opacity-70">
                  <IconX />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Save Button ── */}
          <motion.button
            whileTap={{ scale: canSave ? 0.97 : 1 }}
            onClick={handleSave}
            disabled={!canSave}
            className={`w-full rounded-2xl py-4 text-sm font-black tracking-widest text-white transition-all ${
              canSave
                ? 'bg-gradient-to-b from-[#5adc5a] to-[#28a028] shadow shadow-green-900/50 active:opacity-80'
                : 'bg-[#1a2060]/60 text-white/25 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                SAVING...
              </span>
            ) : 'SAVE'}
          </motion.button>

        </div>
      </div>
    </motion.div>
  );
}
