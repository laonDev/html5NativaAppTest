import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { missionApi } from '@/api/rest';
import { useMissionStore } from '@/stores/missionStore';
import { useCountdown } from '@/hooks/useCountdown';
import { MISSION_STATUS, MISSION_TYPES } from '@/types';

export function DailyMissionPage() {
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState<number | null>(null);

  const missions = useMissionStore((s) => s.missions);
  const endDate = useMissionStore((s) => s.endDate);
  const overallStatus = useMissionStore((s) => s.overallStatus);
  const setMissions = useMissionStore((s) => s.setMissions);
  const { display: countdown } = useCountdown(endDate);

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const res = await missionApi.list();
      setMissions(res.dailyMissionInfos, res.endDate, res.status);
    } catch (err) {
      console.error('Mission list error:', err);
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

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e94560] border-t-transparent" /></div>;
  }

  const completedCount = missions.filter((m) => m.status === MISSION_STATUS.COLLECTED).length;
  const hasCollectable = missions.some((m) => m.status === MISSION_STATUS.ACHIEVED);
  const allCollected = completedCount === missions.length;

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      {/* Header info */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Daily Mission</h2>
        <span className="text-sm text-gray-400">{countdown}</span>
      </div>

      {/* Overall progress gauge */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-xs text-gray-400">
          <span>{completedCount}/{missions.length} completed</span>
        </div>
        <div className="flex gap-1">
          {missions.map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i < completedCount ? 'bg-[#e94560]' : 'bg-[#16213e]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Mission Cards */}
      <div className="space-y-3">
        {missions.map((mission, idx) => {
          const progress = mission.maxValue > 0
            ? Math.min((mission.minValue / mission.maxValue) * 100, 100)
            : 0;

          return (
            <motion.div
              key={mission.missionIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl bg-[#16213e] p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <span className="mr-2 rounded bg-[#0f3460] px-2 py-0.5 text-xs text-gray-300">
                    {MISSION_TYPES[mission.missionType] || 'Unknown'}
                  </span>
                  <span className="text-sm font-medium">{mission.name}</span>
                </div>
                {mission.status === MISSION_STATUS.ACHIEVED && (
                  <button
                    onClick={() => handleCollect(mission.missionIndex)}
                    disabled={collecting !== null}
                    className="rounded-lg bg-[#e94560] px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {collecting === mission.missionIndex ? '...' : 'Collect'}
                  </button>
                )}
                {mission.status === MISSION_STATUS.COLLECTED && (
                  <span className="text-xs text-green-400">✓</span>
                )}
              </div>

              <p className="mb-2 text-xs text-gray-400">{mission.content}</p>

              {/* Progress bar */}
              <div className="h-2 overflow-hidden rounded-full bg-[#1a1a2e]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full rounded-full bg-[#e94560]"
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>{mission.minValue}/{mission.maxValue}</span>
                <span>+{mission.rewardValue}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="mt-4 space-y-2">
        {hasCollectable && (
          <button
            onClick={handleCollectAll}
            disabled={collecting !== null}
            className="w-full rounded-xl bg-[#e94560] py-3 font-bold text-white disabled:opacity-50"
          >
            {collecting === -1 ? 'Collecting...' : 'Collect All'}
          </button>
        )}
        {allCollected && overallStatus !== 3 && (
          <button
            onClick={handleComplete}
            disabled={collecting !== null}
            className="w-full rounded-xl bg-yellow-500 py-3 font-bold text-black disabled:opacity-50"
          >
            {collecting === -2 ? 'Completing...' : 'Complete All Missions!'}
          </button>
        )}
      </div>
    </div>
  );
}
