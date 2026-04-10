import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMissionStore } from '@/stores/missionStore';
import { useBingoStore } from '@/stores/bingoStore';

const ASSETS = '/assets/images/main_hud';

// ── Countdown hook ─────────────────────────────────────────────────────────────
function useCountdown(endTime: string | null): string {
  const calcRemaining = () => {
    if (!endTime) return '00:00:00';
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return '00:00:00';
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1_000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const [display, setDisplay] = useState(calcRemaining);

  useEffect(() => {
    if (!endTime) { setDisplay('00:00:00'); return; }
    setDisplay(calcRemaining());
    const id = setInterval(() => setDisplay(calcRemaining()), 1_000);
    return () => clearInterval(id);
  }, [endTime]);

  return display;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasCompletable = useMissionStore((s) => s.hasCompletable);
  const bingoEndTime = useBingoStore((s) => s.endTime);
  const countdown = useCountdown(bingoEndTime);

  const isVicconActive  = location.pathname.startsWith('/viccon');
  const isBingoActive   = location.pathname.startsWith('/bingo');
  const isMissionActive = location.pathname.startsWith('/mission') || location.pathname.startsWith('/figma-mission');
  const hasBingo = !!bingoEndTime;

  return (
    <nav
      className="relative z-30 overflow-visible"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      {/* ── Background layers ────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[100px]">
        {/* IMG_Bingo_Background */}
        <img
          src={`${ASSETS}/bottom_bg.png`}
          alt=""
          className="absolute inset-0 h-full w-full"
          style={{ objectFit: 'fill' }}
        />
        {/* IMG_Bottom_Black — gradient shadow */}
        <img
          src={`${ASSETS}/bottom_shadow.png`}
          alt=""
          className="absolute inset-0 h-full w-full opacity-60"
          style={{ objectFit: 'fill' }}
        />
        {/* bottom_ui_light — glow around bingo center */}
        <img
          src={`${ASSETS}/bottom_ui_light.png`}
          alt=""
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[50%] opacity-50"
          style={{ filter: 'blur(3px)' }}
        />
      </div>

      {/* ── Tray decorations (mirrored L/R) ──────────────────────────────────── */}
      <TrayDecoration side="left" />
      <TrayDecoration side="right" />

      {/* ── 3-button row ─────────────────────────────────────────────────────── */}
      <div className="relative flex items-end justify-around" style={{ height: 76 }}>

        {/* BTN_Viccon ───────────────────────────────────────────────────────── */}
        <button
          onClick={() => navigate('/viccon')}
          className="relative flex flex-col items-center gap-0.5 flex-1 pb-2"
          style={{ paddingTop: 8 }}
        >
          <img
            src={`${ASSETS}/icon_viccon.png`}
            alt="Viccon"
            className="object-contain"
            style={{
              width: 56,
              height: 42,
              filter: isVicconActive
                ? 'brightness(1.2) drop-shadow(0 0 8px rgba(0,200,255,0.9))'
                : 'brightness(0.85)',
            }}
          />
          <span
            className="text-[11px] font-bold tracking-widest"
            style={{ color: isVicconActive ? '#00c8ff' : '#6b7280' }}
          >
            VICCON
          </span>
        </button>

        {/* BTN_Bingo — center elevated ──────────────────────────────────────── */}
        <div className="relative flex flex-col items-center" style={{ flex: 1.4 }}>
          {/* Elevated icon */}
          <button
            onClick={() => navigate('/bingo')}
            className="relative flex items-center justify-center"
            style={{
              width: 100,
              height: 100,
              transform: 'translateY(-20px)',
              filter: isBingoActive
                ? 'drop-shadow(0 0 14px rgba(168,85,247,1))'
                : 'drop-shadow(0 6px 10px rgba(100,60,180,0.7))',
              transition: 'filter 0.2s',
            }}
          >
            {isBingoActive && (
              <span
                className="pointer-events-none absolute inset-0 animate-pulse rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 65%)',
                  transform: 'scale(1.4)',
                }}
              />
            )}
            {/* icon_bingo_bottom — 빙고볼 아이콘 */}
            <img
              src={`${ASSETS}/icon_bingo_bottom.png`}
              alt="Bingo"
              className="h-full w-full object-contain"
            />
            {/* icon_bingo_glass — 글라스 돔 오버레이 (동일 너비, 하단 기준 정렬) */}
            <img
              src={`${ASSETS}/icon_bingo_glass.png`}
              alt=""
              className="pointer-events-none absolute left-0 right-0"
              style={{
                bottom: 0,
                width: '100%',
                height: 'auto',
              }}
            />
            {/* Time red dot */}
            {hasBingo && !isBingoActive && (
              <span className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-[#080614] bg-red-500" />
            )}
          </button>

          {/* BTN_Bingo_Time — timer display */}
          <div
            className="relative flex items-center justify-center gap-1"
            style={{ marginTop: -16 }}
          >
            <img
              src={`${ASSETS}/btn_bingo_time.png`}
              alt=""
              className="absolute inset-0 h-full w-full object-fill opacity-90"
            />
            <img src={`${ASSETS}/img_clock.png`} alt="" className="relative z-10 h-4 w-4 object-contain" />
            <span
              className="relative z-10 font-mono text-[11px] font-bold tracking-wider"
              style={{ color: '#d4f0ff', textShadow: '0 0 6px rgba(0,180,255,0.8)' }}
            >
              {countdown}
            </span>
            {hasBingo && (
              <span className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                !
              </span>
            )}
          </div>
        </div>

        {/* BTN_Mission ─────────────────────────────────────────────────────── */}
        <button
          onClick={() => navigate('/figma-mission')}
          className="relative flex flex-col items-center gap-0.5 flex-1 pb-2"
          style={{ paddingTop: 8 }}
        >
          <div className="relative">
            <img
              src={`${ASSETS}/btn_mission.png`}
              alt="Mission"
              className="object-contain"
              style={{
                width: 42,
                height: 48,
                filter: isMissionActive
                  ? 'brightness(1.2) drop-shadow(0 0 8px rgba(0,200,255,0.9))'
                  : 'brightness(0.85)',
              }}
            />
            {/* BTN_Reddot */}
            {hasCompletable && (
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#080614] bg-red-500" />
            )}
          </div>
          <span
            className="text-[11px] font-bold tracking-widest"
            style={{ color: isMissionActive ? '#00c8ff' : '#6b7280' }}
          >
            MISSION
          </span>
        </button>
      </div>
    </nav>
  );
}

// ── Tray decoration ────────────────────────────────────────────────────────────
function TrayDecoration({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      className="pointer-events-none absolute bottom-0 h-[56px] w-[72px]"
      style={{
        [side]: 0,
        transform: side === 'right' ? 'scaleX(-1)' : undefined,
      }}
    >
      <img
        src={`${ASSETS}/bottom_tray.png`}
        alt=""
        className="absolute inset-0 h-full w-full object-contain"
        style={{ objectPosition: 'left bottom' }}
      />
      <img
        src={`${ASSETS}/bottom_tray_light.png`}
        alt=""
        className="absolute inset-0 h-full w-full object-contain opacity-75"
        style={{ objectPosition: 'left bottom', filter: 'blur(1px)' }}
      />
    </div>
  );
}
