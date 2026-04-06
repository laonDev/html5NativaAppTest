import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useBalanceStore, formatBalance } from '@/stores/balanceStore';
import { accountApi } from '@/api/rest';

// ── Tab type ──────────────────────────────────────────────────────────────────
type Tab = 'profile' | 'earned';

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconSetting() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 15.5A3.5 3.5 0 018.5 12 3.5 3.5 0 0112 8.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5m7.43-2.92c.04-.34.07-.69.07-1.08s-.03-.73-.07-1.08l2.32-1.81c.21-.16.27-.45.13-.69l-2.2-3.81c-.13-.24-.42-.32-.65-.24l-2.74 1.1c-.57-.44-1.18-.8-1.86-1.08L14.2 2.42C14.15 2.18 13.93 2 13.68 2H10.32c-.25 0-.47.18-.51.42L9.42 5.39c-.68.28-1.3.64-1.86 1.08L4.82 5.37c-.24-.08-.52 0-.65.24L1.97 9.42c-.14.23-.08.53.13.69L4.42 11.92c-.04.35-.07.7-.07 1.08s.03.73.07 1.08L2.1 15.89c-.21.16-.27.45-.13.69l2.2 3.81c.13.24.42.32.65.24l2.74-1.1c.57.44 1.18.8 1.86 1.08l.39 2.96c.04.24.26.43.51.43h3.36c.25 0 .47-.19.51-.43l.39-2.96c.68-.28 1.3-.64 1.86-1.08l2.74 1.1c.24.08.52 0 .65-.24l2.2-3.81c.14-.24.08-.53-.13-.69l-2.32-1.81z" />
    </svg>
  );
}
function IconHistory() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M13 3a9 9 0 11-9 9H2a11 11 0 1011-11v2zm-1 5v5.5l4.25 2.52.77-1.3L13 12.23V8h-1z" />
    </svg>
  );
}
function IconResponsible() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93C9.33 17.79 7 14.5 7 11V7.18L12 5z" />
    </svg>
  );
}
function IconHelp() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
    </svg>
  );
}
function IconLanguage() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 00-1.38-3.56A8.03 8.03 0 0118.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 015.08 16zm2.95-8H5.08a7.987 7.987 0 014.33-3.56A15.65 15.65 0 008.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 01-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
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
function IconNotification() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}

// ── MenuItem ──────────────────────────────────────────────────────────────────
function MenuItem({
  icon,
  title,
  subtitle,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl bg-[#0a1a6a]/60 px-4 py-3.5 ring-1 ring-white/8 active:opacity-70"
    >
      <span className={danger ? 'text-red-400' : 'text-[#4a9fff]'}>{icon}</span>
      <div className="flex-1 text-left">
        <p className={`text-sm font-semibold ${danger ? 'text-red-400' : 'text-white'}`}>{title}</p>
        <p className="mt-0.5 text-[11px] text-white/45">{subtitle}</p>
      </div>
      <span className="text-white/30"><IconChevron /></span>
    </button>
  );
}

// ── AccountPage ───────────────────────────────────────────────────────────────
export function AccountPage() {
  const navigate = useNavigate();
  const userInfo = useAuthStore((s) => s.userInfo);
  const logout = useAuthStore((s) => s.logout);
  const cash = useBalanceStore((s) => s.cash);
  const bonus = useBalanceStore((s) => s.bonus);
  const balance = useBalanceStore((s) => s.balance);

  const [tab, setTab] = useState<Tab>('profile');
  const [nickname, setNickname] = useState(userInfo?.nickname || '');
  const [editing, setEditing] = useState(false);

  const handleSaveNickname = async () => {
    try {
      await accountApi.checkNicknameDuplication(nickname);
      await accountApi.changeNickname(nickname);
      useAuthStore.getState().setUserInfo({ ...userInfo!, nickname });
      setEditing(false);
    } catch (err) {
      console.error('Nickname change error:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#050d35] to-[#030820]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3.5">
        <button
          onClick={() => {}}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a1a6a]/80 text-[#4a9fff] ring-1 ring-[#4a9fff]/40 active:opacity-70"
        >
          <IconNotification />
        </button>
        <h2 className="text-base font-bold italic text-white">My Account</h2>
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a1a6a]/80 text-white ring-1 ring-white/20 active:opacity-70"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>

      {/* ── Tab Toggles ── */}
      <div className="mx-4 mb-3 flex rounded-xl bg-[#06103a] p-1 ring-1 ring-white/10">
        <button
          onClick={() => setTab('profile')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${
            tab === 'profile'
              ? 'bg-gradient-to-b from-[#3a7fff] to-[#1a50e0] text-white shadow-lg shadow-blue-900/50'
              : 'text-white/40'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setTab('earned')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${
            tab === 'earned'
              ? 'bg-gradient-to-b from-[#3a7fff] to-[#1a50e0] text-white shadow-lg shadow-blue-900/50'
              : 'text-white/40'
          }`}
        >
          Earned
        </button>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">

        {tab === 'profile' && (
          <div className="flex flex-col gap-3">

            {/* ── Profile Card ── */}
            <div className="rounded-2xl bg-[#0a1a6a]/70 px-5 py-5 ring-1 ring-white/10">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#0d2280] ring-2 ring-[#4a9fff]/60">
                    {userInfo?.profileUrl ? (
                      <img src={userInfo.profileUrl} alt="profile" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl">👤</span>
                    )}
                  </div>
                  <button className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#4a9fff] text-white shadow">
                    <IconEdit />
                  </button>
                </div>

                {/* ID / Email */}
                <div className="flex-1 min-w-0">
                  {editing ? (
                    <div className="flex flex-col gap-1.5">
                      <input
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="rounded-lg bg-[#06103a] px-3 py-1.5 text-sm font-bold text-white outline-none ring-1 ring-[#4a9fff]/50"
                        maxLength={20}
                      />
                      <div className="flex gap-2">
                        <button onClick={handleSaveNickname} className="rounded-md bg-[#4a9fff] px-3 py-1 text-xs font-bold text-white">Save</button>
                        <button onClick={() => setEditing(false)} className="rounded-md bg-white/10 px-3 py-1 text-xs font-bold text-white">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setEditing(true)} className="text-left">
                      <p className="truncate text-base font-bold text-white">
                        {userInfo?.nickname || 'Guest'}
                      </p>
                      <p className="truncate text-xs text-white/50">{userInfo?.email || ''}</p>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Balance Panel ── */}
            <div className="rounded-2xl bg-[#0a1a6a]/70 px-4 py-4 ring-1 ring-white/10">
              <div className="flex items-start gap-3">
                {/* Left: BALANCE + amount */}
                <div className="flex-1 rounded-xl bg-[#04092a] px-3 py-2.5 ring-1 ring-white/8">
                  <p className="text-xs font-bold tracking-widest text-[#4adfff]">BALANCE</p>
                  <p className="mt-1 text-lg font-black text-white">{formatBalance(balance)}</p>
                </div>
                {/* Right: DEPOSIT + WITHDRAW */}
                <div className="flex flex-col gap-2">
                  <button className="rounded-lg bg-gradient-to-b from-[#5adc5a] to-[#28a028] px-5 py-2 text-xs font-black tracking-wider text-white shadow shadow-green-900/50 active:opacity-80">
                    DEPOSIT
                  </button>
                  <button className="rounded-lg bg-gradient-to-b from-[#3a7fff] to-[#1a50e0] px-5 py-2 text-xs font-black tracking-wider text-white shadow shadow-blue-900/50 active:opacity-80">
                    WITHDRAW
                  </button>
                </div>
              </div>

              {/* CASH + BONUS */}
              <div className="mt-3 flex gap-2">
                <div className="flex-1 rounded-lg bg-[#04092a] px-3 py-2 ring-1 ring-white/8">
                  <p className="text-[10px] font-bold tracking-widest text-[#4adfff]">CASH</p>
                  <p className="mt-0.5 text-sm font-bold text-white">{formatBalance(cash)}</p>
                </div>
                <div className="flex-1 rounded-lg bg-[#04092a] px-3 py-2 ring-1 ring-white/8">
                  <p className="text-[10px] font-bold tracking-widest text-[#4adfff]">BONUS</p>
                  <p className="mt-0.5 text-sm font-bold text-white">{formatBalance(bonus)}</p>
                </div>
              </div>

              {/* HISTORY */}
              <button
                onClick={() => navigate('/history')}
                className="mt-3 flex w-full items-center justify-end gap-1 text-xs font-bold text-white/60 active:opacity-70"
              >
                HISTORY <IconChevron />
              </button>
            </div>

            {/* ── Menu List ── */}
            <div className="flex flex-col gap-2">
              <MenuItem
                icon={<IconSetting />}
                title="Setting"
                subtitle="Password / Notification / Sound / Vibration"
              />
              <MenuItem
                icon={<IconHistory />}
                title="Game History"
                subtitle="Session Report / Game Activity"
                onClick={() => navigate('/history')}
              />
              <MenuItem
                icon={<IconResponsible />}
                title="Responsible Gambling"
                subtitle="Deposit limits / Player limitation / Game Status Reminder"
              />
              <MenuItem
                icon={<IconHelp />}
                title="Help Center"
                subtitle="FAQ / 1:1"
              />
              <MenuItem
                icon={<IconLanguage />}
                title="Languages"
                subtitle="English / French Creole / Haitian Creole ..."
              />
              <MenuItem
                icon={<IconLogout />}
                title="Logout"
                subtitle="Logout"
                onClick={handleLogout}
                danger
              />
            </div>

          </div>
        )}

        {tab === 'earned' && (
          <div className="flex flex-col items-center justify-center py-16 text-white/30">
            <p className="text-sm">Earned content coming soon</p>
          </div>
        )}

      </div>
    </div>
  );
}
