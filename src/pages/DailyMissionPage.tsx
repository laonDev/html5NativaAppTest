import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { missionApi } from '@/api/rest';
import { mockDailyMissions } from '@/api/mock/mockData';
import { useMissionStore } from '@/stores/missionStore';
import { MISSION_STATUS, MISSION_TYPES } from '@/types';
import type { DailyMissionInfo } from '@/types';

// ── Countdown helper ──────────────────────────────────────────────────────────
function useCountdownParts(endTime: string | null) {
  const [parts, setParts] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!endTime) return;
    const update = () => {
      const diff = Math.max(0, new Date(endTime).getTime() - Date.now());
      setParts({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return parts;
}

// ── Mission type → icon mapping ───────────────────────────────────────────────
const MISSION_ICONS: Record<number, string> = {
  1: '/assets/images/mission/icon_slot.png',
  2: '/assets/images/mission/icon_bingo.png',
  3: '/assets/images/mission/icon_viccon.png',
  4: '/assets/images/mission/icon_volt.png',
  5: '/assets/images/mission/icon_crash.png',
  6: '/assets/images/mission/icon_ticket.png',
  7: '/assets/images/mission/icon_tournament.png',
  8: '/assets/images/mission/icon_friend.png',
};

// ── Component ─────────────────────────────────────────────────────────────────
export function DailyMissionPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState<number | null>(null);

  const missions = useMissionStore((s) => s.missions);
  const endDate = useMissionStore((s) => s.endDate);
  const overallStatus = useMissionStore((s) => s.overallStatus);
  const setMissions = useMissionStore((s) => s.setMissions);
  const { days, hours, minutes, seconds } = useCountdownParts(endDate);

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const res = await missionApi.list();
      setMissions(res.dailyMissionInfos, res.endDate, res.status);
    } catch (err) {
      console.warn('Mission list error, falling back to mock:', err);
      const mock = mockDailyMissions;
      if (mock) {
        setMissions(mock.dailyMissionInfos, mock.endDate, mock.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = async (missionIndex: number) => {
    setCollecting(missionIndex);
    try {
      await missionApi.collect(missionIndex);
      await loadMissions();
    } catch (err) {
      console.error('Collect error:', err);
    } finally {
      setCollecting(null);
    }
  };

  const handleCollectAll = async () => {
    setCollecting(-1);
    try {
      await missionApi.collectAll();
      await loadMissions();
    } catch (err) {
      console.error('Collect all error:', err);
    } finally {
      setCollecting(null);
    }
  };

  const handleComplete = async () => {
    setCollecting(-2);
    try {
      await missionApi.complete();
      await loadMissions();
    } catch (err) {
      console.error('Complete error:', err);
    } finally {
      setCollecting(null);
    }
  };

  const collectedCount = missions.filter((m) => m.status === MISSION_STATUS.COLLECTED).length;
  const hasCollectable = missions.some((m) => m.status === MISSION_STATUS.ACHIEVED);
  const allCollected = collectedCount === missions.length && missions.length > 0;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#080620]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00c8ff] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#080620]">

      {/* ── 1. Title Banner with decorative gems ── */}
      <div className="relative overflow-hidden">
        <img
          src="/assets/images/mission/banner_title.png"
          alt=""
          className="h-44 w-full object-cover"
        />
        {/* Decorative gems */}
        <img src="/assets/images/mission/gem_yellow.png" alt="" className="absolute left-[12%] top-[18%] h-10 w-10 drop-shadow-[0_0_8px_rgba(255,210,40,0.6)]" />
        <img src="/assets/images/mission/gem_blue.png" alt="" className="absolute right-[18%] top-[12%] h-8 w-8 drop-shadow-[0_0_8px_rgba(50,140,255,0.6)]" />
        <img src="/assets/images/mission/gem_pink.png" alt="" className="absolute right-[8%] top-[35%] h-9 w-9 drop-shadow-[0_0_8px_rgba(230,80,200,0.6)]" />
        <img src="/assets/images/mission/gem_green.png" alt="" className="absolute right-[25%] bottom-[25%] h-7 w-7 drop-shadow-[0_0_8px_rgba(50,220,100,0.6)]" />
        {/* Title text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black tracking-wider text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            AREA
          </span>
          <span className="text-xl font-black tracking-widest text-[#ffd700] drop-shadow-[0_2px_6px_rgba(255,180,0,0.5)]">
            FIFTY-FUN
          </span>
        </div>
        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#080620] to-transparent" />
      </div>

      {/* ── 2. Daily Mission Status panel ── */}
      <div className="relative mx-3 -mt-4 rounded-2xl bg-gradient-to-b from-[#0a1848] to-[#060d2e] p-4 ring-1 ring-[#1a3a8a]/60 shadow-lg shadow-blue-900/30">
        {/* Cyan accent line at top */}
        <div className="absolute inset-x-4 top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#00c8ff] to-transparent" />

        {/* Label */}
        <h2 className="text-center text-sm font-bold tracking-wide text-white">Daily Mission Status</h2>

        {/* Checkmark indicators row */}
        <div className="mt-3 flex items-center justify-center gap-3">
          {missions.map((m) => (
            <div
              key={m.missionIndex}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 shadow-inner ${
                m.status === MISSION_STATUS.COLLECTED
                  ? 'border-green-400/60 bg-green-900/40 shadow-green-900/50'
                  : m.status === MISSION_STATUS.ACHIEVED
                  ? 'border-yellow-400/60 bg-yellow-900/30 shadow-yellow-900/50'
                  : 'border-gray-600/40 bg-[#0a0e24] shadow-black/50'
              }`}
            >
              {m.status === MISSION_STATUS.COLLECTED ? (
                <svg viewBox="0 0 16 16" className="h-5 w-5 text-green-400 drop-shadow-[0_0_4px_rgba(74,222,128,0.6)]" fill="currentColor">
                  <path d="M13.485 3.515a.75.75 0 010 1.06l-7 7a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 011.06-1.06L6 9.94l6.47-6.47a.75.75 0 011.06 0z" />
                </svg>
              ) : m.status === MISSION_STATUS.ACHIEVED ? (
                <span className="text-base font-bold text-yellow-400">!</span>
              ) : (
                <span className="h-2 w-2 rounded-full bg-gray-700" />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar with Volt reward icon */}
        <div className="mt-3 flex items-center gap-2">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#0a0e24] ring-1 ring-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 via-lime-400 to-yellow-400 transition-all duration-500"
              style={{ width: `${missions.length > 0 ? (collectedCount / missions.length) * 100 : 0}%` }}
            />
          </div>
          <img
            src="/assets/images/mission/volt_reward.png"
            alt="Volt reward"
            className="h-9 w-9 drop-shadow-[0_0_6px_rgba(255,200,40,0.5)]"
          />
        </div>

        {/* Description */}
        <p className="mt-2.5 text-center text-[11px] leading-relaxed text-gray-400">
          If you have completed all missions, you can earn<br />Volt rewards for free!
        </p>

        {/* Countdown timer */}
        <div className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-black/30 py-1.5 px-4 mx-auto w-fit ring-1 ring-white/10">
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-[#00c8ff]" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
          </svg>
          <span className="font-mono text-xs font-bold tracking-wider text-white">
            {String(hours + days * 24).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>

        {/* Coins decoration */}
        <div className="relative mt-2 flex justify-center overflow-hidden">
          <img src="/assets/images/mission/coins_deco.png" alt="" className="h-8 w-full object-contain opacity-60" />
        </div>
      </div>

      {/* ── 3. Mission card list ── */}
      <div className="mt-4 flex-1 space-y-3 px-4 pb-4">
        <AnimatePresence>
          {missions.map((mission, idx) => (
            <MissionCard
              key={mission.missionIndex}
              mission={mission}
              index={idx}
              collecting={collecting}
              onCollect={handleCollect}
              onNavigate={navigate}
            />
          ))}
        </AnimatePresence>

        {/* Action buttons */}
        {hasCollectable && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCollectAll}
            disabled={collecting !== null}
            className="w-full rounded-xl bg-gradient-to-r from-[#00c8ff] to-[#0088ff] py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-blue-900/40 disabled:opacity-50"
          >
            {collecting === -1 ? 'Collecting…' : 'Collect All'}
          </motion.button>
        )}

        {allCollected && overallStatus !== 3 && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleComplete}
            disabled={collecting !== null}
            className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 py-3.5 text-sm font-bold uppercase tracking-widest text-black shadow-lg shadow-yellow-900/40 disabled:opacity-50"
          >
            {collecting === -2 ? 'Completing…' : 'Complete All Missions!'}
          </motion.button>
        )}
      </div>
    </div>
  );
}

// ── Icon frame border color by mission type ──────────────────────────────────
const ICON_BORDER_COLORS: Record<number, string> = {
  1: 'ring-blue-400/60 shadow-blue-500/30',
  2: 'ring-green-400/60 shadow-green-500/30',
  3: 'ring-purple-400/60 shadow-purple-500/30',
  4: 'ring-yellow-400/60 shadow-yellow-500/30',
  5: 'ring-red-400/60 shadow-red-500/30',
  6: 'ring-cyan-400/60 shadow-cyan-500/30',
  7: 'ring-orange-400/60 shadow-orange-500/30',
  8: 'ring-pink-400/60 shadow-pink-500/30',
};

// ── MissionCard ───────────────────────────────────────────────────────────────
function MissionCard({
  mission,
  index,
  collecting,
  onCollect,
  onNavigate,
}: {
  mission: DailyMissionInfo;
  index: number;
  collecting: number | null;
  onCollect: (idx: number) => void;
  onNavigate: (path: string) => void;
}) {
  const progress = mission.maxValue > 0
    ? Math.min((mission.minValue / mission.maxValue) * 100, 100)
    : 0;

  const iconSrc = MISSION_ICONS[mission.missionType] || MISSION_ICONS[1];
  const typeName = MISSION_TYPES[mission.missionType] || 'Mission';
  const borderColor = ICON_BORDER_COLORS[mission.missionType] || ICON_BORDER_COLORS[1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c1e5a] to-[#0a1444] px-3 py-3.5 ring-1 ring-[#1a4aaa]/50 shadow-md shadow-blue-950/40"
    >
      {/* Icon frame */}
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#060d2e] ring-2 shadow-lg ${borderColor}`}>
        <img src={iconSrc} alt={typeName} className="h-10 w-10" />
      </div>

      {/* Info — name + content */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-bold text-white">{mission.name}</p>
        <p className="truncate text-[11px] text-blue-300/60">{mission.content}</p>
      </div>

      {/* Right column — progress badge + status button */}
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {/* Progress pill */}
        <div className="flex items-center gap-1.5 rounded-full bg-[#060d2e] px-2 py-1 ring-1 ring-white/10">
          <div className="h-1 w-10 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00c8ff] to-[#00ff88] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-white">
            {mission.minValue}/{mission.maxValue}
          </span>
        </div>

        {/* Status button */}
        <StatusButton
          mission={mission}
          collecting={collecting}
          onCollect={onCollect}
          onNavigate={onNavigate}
        />
      </div>
    </motion.div>
  );
}

// ── StatusButton ──────────────────────────────────────────────────────────────
function StatusButton({
  mission,
  collecting,
  onCollect,
  onNavigate,
}: {
  mission: DailyMissionInfo;
  collecting: number | null;
  onCollect: (idx: number) => void;
  onNavigate: (path: string) => void;
}) {
  const btnBase = 'rounded-md px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow';

  // COLLECTED → ✓ COMPLETE!
  if (mission.status === MISSION_STATUS.COLLECTED) {
    return (
      <div className="flex items-center gap-1 px-2 py-1">
        <svg viewBox="0 0 16 16" className="h-4 w-4 text-green-400 drop-shadow-[0_0_4px_rgba(74,222,128,0.6)]" fill="currentColor">
          <path d="M13.485 3.515a.75.75 0 010 1.06l-7 7a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 011.06-1.06L6 9.94l6.47-6.47a.75.75 0 011.06 0z" />
        </svg>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-green-400">
          Complete!
        </span>
      </div>
    );
  }

  // ACHIEVED → COLLECT!
  if (mission.status === MISSION_STATUS.ACHIEVED) {
    return (
      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={() => onCollect(mission.missionIndex)}
        disabled={collecting !== null}
        className={`${btnBase} bg-gradient-to-b from-green-400 to-green-600 text-white shadow-green-900/50 disabled:opacity-50`}
      >
        {collecting === mission.missionIndex ? '…' : 'Collect!'}
      </motion.button>
    );
  }

  // IN_PROGRESS + Bingo → LET'S GO!
  if (mission.missionType === 2) {
    return (
      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={() => onNavigate('/bingo')}
        className={`${btnBase} bg-gradient-to-b from-[#00c8ff] to-[#0088dd] text-white shadow-blue-900/50`}
      >
        Let's Go!
      </motion.button>
    );
  }

  // Slot & others → GOOD LUCK!
  return (
    <div className={`${btnBase} bg-gradient-to-b from-yellow-400 to-amber-500 text-[#1a0a00] shadow-yellow-900/40`}>
      Good Luck!
    </div>
  );
}
