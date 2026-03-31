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

      {/* ── 1. Banner ── */}
      <div className="relative overflow-hidden">
        <img
          src="/assets/images/mission/banner_mission.png"
          alt=""
          className="h-28 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080620] via-transparent to-transparent" />
      </div>

      {/* ── 2. Daily Mission Status ── */}
      <div className="px-4 pb-3">
        <h2 className="text-center text-base font-bold text-white">Daily Mission Status</h2>
        <p className="mt-1 text-center text-[11px] leading-relaxed text-gray-400">
          If you have completed all missions,{'\n'}you can earn Volt rewards for free!
        </p>

        {/* Checkmark indicators */}
        <div className="mt-3 flex items-center justify-center gap-2.5">
          {missions.map((m) => (
            <div
              key={m.missionIndex}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border-2 transition-colors ${
                m.status === MISSION_STATUS.COLLECTED
                  ? 'border-[#00c8ff] bg-[#00c8ff]/20'
                  : m.status === MISSION_STATUS.ACHIEVED
                  ? 'border-yellow-400 bg-yellow-400/10'
                  : 'border-gray-700 bg-gray-800/50'
              }`}
            >
              {m.status === MISSION_STATUS.COLLECTED ? (
                <svg viewBox="0 0 16 16" className="h-5 w-5 text-[#00c8ff]" fill="currentColor">
                  <path d="M13.485 3.515a.75.75 0 010 1.06l-7 7a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 011.06-1.06L6 9.94l6.47-6.47a.75.75 0 011.06 0z" />
                </svg>
              ) : m.status === MISSION_STATUS.ACHIEVED ? (
                <span className="text-sm text-yellow-400">!</span>
              ) : (
                <span className="h-2 w-2 rounded-full bg-gray-600" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Countdown timer ── */}
      <div className="mx-4 mb-4 flex items-center justify-center gap-2 rounded-xl bg-[#0d0b2a] py-2.5 ring-1 ring-white/10">
        {/* Clock icon */}
        <svg viewBox="0 0 20 20" className="h-4 w-4 text-[#00c8ff]" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
        </svg>
        <div className="flex items-center gap-1 font-mono text-sm tracking-wider text-white">
          <TimeBlock value={days} label="D" />
          <span className="text-gray-500">:</span>
          <TimeBlock value={hours} label="H" />
          <span className="text-gray-500">:</span>
          <TimeBlock value={minutes} label="M" />
          <span className="text-gray-500">:</span>
          <TimeBlock value={seconds} label="S" />
        </div>
      </div>

      {/* ── 4. Mission card list ── */}
      <div className="flex-1 space-y-2.5 px-4 pb-4">
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`flex items-center gap-3 rounded-xl p-3 ring-1 ${
        mission.status === MISSION_STATUS.COLLECTED
          ? 'bg-[#0a1130]/60 ring-[#00c8ff]/20'
          : mission.status === MISSION_STATUS.ACHIEVED
          ? 'bg-[#1a1040] ring-yellow-500/30'
          : 'bg-[#0d0b2a] ring-white/8'
      }`}
    >
      {/* Icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-black/30">
        <img src={iconSrc} alt={typeName} className="h-9 w-9" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-white">{mission.name}</p>
        <p className="truncate text-[11px] text-gray-500">{mission.content}</p>

        {/* Progress bar */}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full ${
                mission.status === MISSION_STATUS.COLLECTED
                  ? 'bg-[#00c8ff]'
                  : mission.status === MISSION_STATUS.ACHIEVED
                  ? 'bg-yellow-400'
                  : 'bg-purple-500'
              }`}
            />
          </div>
          <span className="shrink-0 text-[10px] font-medium text-gray-400">
            {mission.minValue}/{mission.maxValue}
          </span>
        </div>
      </div>

      {/* Action button */}
      <div className="shrink-0">
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
  // COLLECTED → checkmark
  if (mission.status === MISSION_STATUS.COLLECTED) {
    return (
      <div className="flex items-center gap-1 rounded-lg bg-[#00c8ff]/10 px-3 py-1.5">
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-[#00c8ff]" fill="currentColor">
          <path d="M13.485 3.515a.75.75 0 010 1.06l-7 7a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 011.06-1.06L6 9.94l6.47-6.47a.75.75 0 011.06 0z" />
        </svg>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#00c8ff]">
          Complete
        </span>
      </div>
    );
  }

  // ACHIEVED → COLLECT button
  if (mission.status === MISSION_STATUS.ACHIEVED) {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onCollect(mission.missionIndex)}
        disabled={collecting !== null}
        className="rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black shadow shadow-yellow-900/40 disabled:opacity-50"
      >
        {collecting === mission.missionIndex ? '…' : 'Collect!'}
      </motion.button>
    );
  }

  // IN_PROGRESS → type-specific label
  if (mission.missionType === 2) {
    // Bingo → LET'S GO!
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate('/bingo')}
        className="rounded-lg bg-green-600/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-green-400 ring-1 ring-green-500/30"
      >
        Let's Go!
      </motion.button>
    );
  }

  // Slot & others → GOOD LUCK!
  return (
    <div className="rounded-lg bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
      Good Luck!
    </div>
  );
}

// ── TimeBlock ─────────────────────────────────────────────────────────────────
function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-0.5">
      <span className="rounded bg-white/10 px-1.5 py-0.5 text-white">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[8px] text-gray-600">{label}</span>
    </span>
  );
}
