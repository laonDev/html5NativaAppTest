import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useBalanceStore } from '@/stores/balanceStore';
import { useTicketStore } from '@/stores/ticketStore';
import { useVoltStore } from '@/stores/voltStore';
import { useMissionStore } from '@/stores/missionStore';
import { useTournamentStore } from '@/stores/tournamentStore';
type TabKey = 'profile' | 'earned';

interface MyAccountPageProps {
  onClose?: () => void;
}

function joinClassName(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ');
}

function formatViccon(amount: number) {
  return (amount / 1000).toFixed(2);
}

function getTicketValueRange(values: number[]) {
  if (values.length === 0) return { min: 0, max: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  return { min: sorted[0], max: sorted[sorted.length - 1] };
}

function formatBalancePlain(amount: number): string {
  return (amount / 1000).toFixed(2);
}

export function MyAccountPage({ onClose }: MyAccountPageProps) {
  const navigate = useNavigate();
  const handleClose = onClose ?? (() => navigate(-1));
  const [tab, setTab] = useState<TabKey>('profile');
  const userInfo = useAuthStore((s) => s.userInfo);
  const logout = useAuthStore((s) => s.logout);
  const { balance, cash, bonus, viccon, bingoCoin } = useBalanceStore();
  const { gauge, maxGauge, level, ticketList } = useTicketStore();
  const totalVolt = useVoltStore((s) => s.totalCount);
  const missions = useMissionStore((s) => s.missions);
  const currentUser = useTournamentStore((s) => s.currentUser);

  const ticketValues = useMemo(() => ticketList.map((t) => t.value), [ticketList]);
  const ticketValueRange = useMemo(() => getTicketValueRange(ticketValues), [ticketValues]);
  const ticketItems = ticketList.slice(0, 6);

  const missionTotal = missions.length;
  const missionDone = missions.filter((m) => m.status >= 2 || m.minValue >= m.maxValue).length;

  const tournamentRank = currentUser?.rankingData?.rank ?? 0;

  const go = (path: string) => {
    navigate(path);
  };
  const noop = () => {};

  return (
    <div
      className="relative flex h-[100svh] w-screen flex-col items-center overflow-y-auto bg-[#020717] px-4 pb-10 pt-5"
      style={{
        backgroundImage:
          tab === 'earned'
            ? "url('/assets/images/myaccount/Earned_ticket/bg.png')"
            : "url('/assets/images/myaccount/profile/Background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }}
    >
      <div className="relative z-10 mx-auto flex w-full max-w-[420px] items-center justify-between px-1 pt-1">
        <button type="button" onClick={handleClose} className="h-8 w-8">
          <img
            src={
              tab === 'earned'
                ? '/assets/images/myaccount/Earned_ticket/Bold_Close.png'
                : '/assets/images/myaccount/profile/Back.png'
            }
            alt="close"
            className="h-full w-full"
          />
        </button>
        <img
          src={
            tab === 'earned'
              ? '/assets/images/myaccount/Earned_ticket/My_Account.png'
              : '/assets/images/myaccount/profile/My Account.png'
          }
          alt="My Account"
          className="h-4.5 object-contain"
        />
        <button type="button" onClick={handleClose} className="h-8 w-8">
          <img
            src={
              tab === 'earned'
                ? '/assets/images/myaccount/Earned_ticket/Notifications.png'
                : '/assets/images/myaccount/profile/Notifications.png'
            }
            alt="notifications"
            className="h-full w-full"
          />
        </button>
      </div>

      <div className="relative z-10 mx-auto mt-3 flex w-full max-w-[420px] items-end justify-center gap-3">
        <button type="button" onClick={() => setTab('profile')} className="h-9 w-[46%]">
          <img
            src={
              tab === 'profile'
                ? '/assets/images/myaccount/Earned_ticket/txt_profile_active.png'
                : '/assets/images/myaccount/Earned_ticket/txt_profile_inactive.png'
            }
            alt="Profile"
            className="h-full w-full object-contain"
          />
        </button>
        <button type="button" onClick={() => setTab('earned')} className="h-9 w-[46%]">
          <img
            src={
              tab === 'earned'
                ? '/assets/images/myaccount/Earned_ticket/txt_Earned_active.png'
                : '/assets/images/myaccount/Earned_ticket/txt_Earned_inactive.png'
            }
            alt="Earned"
            className="h-full w-full object-contain"
          />
        </button>
      </div>

      {tab === 'profile' ? (
        <div
          className="relative z-10 mx-auto mt-2 w-full max-w-[420px] overflow-hidden rounded-2xl px-4 pb-6 pt-4"
          style={{
            backgroundImage: "url('/assets/images/myaccount/profile/popup.png')",
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%',
          }}
        >
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#1b3c8c] ring-2 ring-[#76c0ff]/60">
                  {userInfo?.profileUrl ? (
                    <img src={userInfo.profileUrl} alt="profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-base font-bold text-white">P</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={noop}
                  className="absolute -bottom-1 -right-1 h-6 w-6"
                >
                  <img src="/assets/images/myaccount/profile/profile_edit.png" alt="edit" className="h-full w-full" />
                </button>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{userInfo?.nickname || 'Guest'}</p>
                <p className="truncate text-xs text-blue-200/70">{userInfo?.email || '-'}</p>
              </div>
            </div>
            <button type="button" onClick={() => go('/history')} className="h-6 w-16">
              <img src="/assets/images/myaccount/profile/History.png" alt="history" className="h-full w-full object-contain" />
            </button>
          </div>

          <div className="mt-4 rounded-xl bg-[#0b1b46]/90 p-3.5 shadow-[inset_0_0_0_1px_rgba(80,140,255,0.3)]">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 flex-1 items-center justify-center rounded-lg"
                style={{
                  backgroundImage: "url('/assets/images/myaccount/profile/Bluebox.png')",
                  backgroundSize: '100% 100%',
                }}
              >
                <span className="text-xs font-bold text-[#7fe5ff]">BALANCE</span>
              </div>
              <button type="button" onClick={noop} className="h-9 w-28">
                <img src="/assets/images/myaccount/profile/deposit.png" alt="deposit" className="h-full w-full" />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div
                className="flex h-10 flex-1 items-center justify-center rounded-lg"
                style={{
                  backgroundImage: "url('/assets/images/myaccount/profile/Bluebox.png')",
                  backgroundSize: '100% 100%',
                }}
              >
                <span className="text-[11px] font-bold text-[#7fe5ff]">&nbsp;</span>
              </div>
              <button type="button" onClick={noop} className="h-9 w-28">
                <img src="/assets/images/myaccount/profile/with_draw.png" alt="withdraw" className="h-full w-full" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div
                className="flex h-9 items-center justify-between rounded-lg px-3"
                style={{
                  backgroundImage: "url('/assets/images/myaccount/profile/square.png')",
                  backgroundSize: '100% 100%',
                }}
              >
                <span className="text-[11px] font-bold text-[#7fe5ff]">CASH</span>
                <span className="text-[11px] font-semibold text-white">{formatBalancePlain(cash)}</span>
              </div>
              <div
                className="flex h-9 items-center justify-between rounded-lg px-3"
                style={{
                  backgroundImage: "url('/assets/images/myaccount/profile/square.png')",
                  backgroundSize: '100% 100%',
                }}
              >
                <span className="text-[11px] font-bold text-[#7fe5ff]">BONUS</span>
                <span className="text-[11px] font-semibold text-white">{formatBalancePlain(bonus)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-[#0b1b46]/90 p-3.5 shadow-[inset_0_0_0_1px_rgba(80,140,255,0.3)]">
            <div
              className="flex h-9 items-center justify-between rounded-lg px-3"
              style={{
                backgroundImage: "url('/assets/images/myaccount/profile/bluebox2.png')",
                backgroundSize: '100% 100%',
              }}
            >
              <span className="text-[11px] font-bold text-[#7fe5ff]">VICCON</span>
              <img src="/assets/images/myaccount/profile/arrow.png" alt="" className="h-3 w-3" />
            </div>
            <div className="mt-2 flex items-center justify-center">
              <button type="button" onClick={() => go('/viccon')} className="h-10 w-32">
                <img src="/assets/images/myaccount/profile/btn_play.png" alt="play" className="h-full w-full" />
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2.5 pb-2">
            {[
              { title: 'Game History', subtitle: 'Session Report / Game Activity', onClick: () => go('/history') },
              { title: 'Responsible Gambling', subtitle: 'Deposit limits / Player Limitation / Game Reminder', onClick: noop },
              { title: 'Help Center', subtitle: 'FAQ / 1:1', onClick: noop },
              { title: 'Languages', subtitle: 'English / French Creole / Haitian Creole ...', onClick: noop },
            ].map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={item.onClick}
                className="flex w-full items-center justify-between rounded-lg bg-[#0b1738] px-3 py-2 text-left ring-1 ring-white/10"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-[11px] text-blue-200/70">{item.subtitle}</p>
                </div>
                <img src="/assets/images/myaccount/profile/설정작은창.png" alt="" className="h-5 w-5" />
              </button>
            ))}
          </div>

          <div className="mt-3 flex justify-center pb-2">
            <button
              type="button"
              onClick={() => {
                logout();
                go('/login');
              }}
              className="h-10 w-36"
            >
              <img src="/assets/images/myaccount/profile/logout.png" alt="logout" className="h-full w-full" />
            </button>
          </div>
        </div>
      ) : (
        <div
          className="relative z-10 mx-auto mt-1 w-full max-w-[420px] overflow-hidden rounded-2xl px-4 pb-6 pt-4"
          style={{
            backgroundImage: "url('/assets/images/myaccount/Earned_ticket/popup_2.png')",
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%',
          }}
        >
          <div className="rounded-xl bg-[#0b1b46]/85 p-3 shadow-[inset_0_0_0_1px_rgba(80,140,255,0.3)]">
            <div className="flex items-center justify-between">
              <div
                className="flex h-9 flex-1 items-center justify-center rounded-lg"
                style={{
                  backgroundImage: "url('/assets/images/myaccount/Earned_ticket/Bluebox.png')",
                  backgroundSize: '100% 100%',
                }}
              >
                <span className="text-[11px] font-bold text-[#7fe5ff]">VICCON</span>
              </div>
              <button type="button" onClick={() => go('/viccon')} className="ml-3 h-9 w-24">
                <img src="/assets/images/myaccount/Earned_ticket/btn_play.png" alt="play" className="h-full w-full" />
              </button>
            </div>
            <div className="mt-2 flex h-9 items-center justify-center rounded-lg bg-[#0b1738] text-sm font-semibold text-white">
              {formatViccon(viccon)}
            </div>
          </div>

          <div
            className="mt-4 rounded-2xl p-3"
            style={{
              backgroundImage: "url('/assets/images/myaccount/Earned_ticket/popup_ticket.png')",
              backgroundRepeat: 'no-repeat',
              backgroundSize: '100% 100%',
            }}
          >
            <div className="relative mx-auto mt-1 h-52 w-44">
              <img src="/assets/images/myaccount/Earned_ticket/ticket.png" alt="ticket" className="h-full w-full object-contain" />
              <div className="absolute left-3 top-3 h-6 w-10">
                <img src="/assets/images/myaccount/Earned_ticket/bar_play_number.png" alt="" className="h-full w-full" />
              </div>
              <div className="absolute right-4 top-16 text-[11px] font-bold text-white">
                {maxGauge > 0 ? `${Math.round((gauge / maxGauge) * 100)}%` : '0%'}
              </div>
              <div className="absolute left-0 right-0 top-[54%] text-center text-base font-bold text-white">
                £{formatBalancePlain(gauge)}
              </div>
              <div className="absolute left-0 right-0 top-[62%] text-center text-[11px] text-white/80">
                £{formatBalancePlain(maxGauge)}
              </div>
              <div className="absolute left-0 right-0 top-[71%] text-center text-[10px] text-[#7fe5ff]">
                MAX £{formatBalancePlain(ticketValueRange.max)} TO MIN £{formatBalancePlain(ticketValueRange.min)}
              </div>
            </div>

            <div
              className="mt-3 grid grid-cols-3 gap-2 px-1 py-2"
              style={{
                backgroundImage: "url('/assets/images/myaccount/Earned_ticket/mini_ticket_area.png')",
                backgroundRepeat: 'no-repeat',
                backgroundSize: '100% 100%',
              }}
            >
              {ticketItems.map((ticket) => (
                <div key={ticket.ticketIdx} className="relative h-16 w-full">
                  <img src="/assets/images/myaccount/Earned_ticket/mini_ticket_bg.png" alt="" className="h-full w-full" />
                </div>
              ))}
              {ticketItems.length < 6 &&
                Array.from({ length: 6 - ticketItems.length }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="relative h-16 w-full">
                    <img src="/assets/images/myaccount/Earned_ticket/mini_ticket_bg.png" alt="" className="h-full w-full opacity-60" />
                  </div>
                ))}
            </div>

            <div className="mt-2 flex items-center justify-center">
              <button type="button" onClick={() => go('/history')} className="h-7 w-24">
                <img src="/assets/images/myaccount/Earned_ticket/BTN_History.png" alt="history" className="h-full w-full" />
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {[
              { key: 'tournament', label: 'Tournament', value: tournamentRank || 0, icon: '/assets/images/myaccount/Earned_ticket/icon_gold.png' },
              { key: 'volt', label: 'Volt', value: totalVolt, icon: '/assets/images/myaccount/Earned_ticket/icon_volt.png' },
              { key: 'mission', label: 'Mission', value: missionTotal > 0 ? `${missionDone}/${missionTotal}` : '0/0', icon: '/assets/images/myaccount/Earned_ticket/icon_mission.png' },
              { key: 'bingo', label: 'Bingo', value: bingoCoin, icon: '/assets/images/myaccount/Earned_ticket/IMG_Bingo_Mainicon.png' },
            ].map((item, idx) => (
              <div
                key={item.key}
                className="flex h-10 items-center justify-between rounded-lg px-3"
                style={{
                  backgroundImage: "url('/assets/images/myaccount/Earned_ticket/bar_reward.png')",
                  backgroundSize: '100% 100%',
                }}
              >
                <div className="flex items-center gap-2">
                  <img src={item.icon} alt="" className="h-6 w-6" />
                  <span className="text-xs font-semibold text-white">{item.label}</span>
                </div>
                {idx === 0 ? (
                  <button type="button" onClick={() => go('/tournament')} className="h-6 w-16">
                    <img src="/assets/images/myaccount/Earned_ticket/btn_join.png" alt="join" className="h-full w-full" />
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-white">{item.value}</span>
                )}
                <img src="/assets/images/myaccount/Earned_ticket/tab_arrow.png" alt="" className="h-4 w-4" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-center text-[10px] text-blue-200/60">
        Total Balance: £{formatBalancePlain(balance)}
      </div>
    </div>
  );
}
