import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMissionStore } from '@/stores/missionStore';
import { MISSION_TYPES } from '@/types/dailyMission';

interface Props {
  /** 탭 시 실행할 콜백. 미전달 시 탭해도 이동 없음 (슬롯 인게임용) */
  onTap?: () => void;
}

// 미션 타입별 아이콘 이모지
const MISSION_ICONS: Record<number, string> = {
  1: '🎰', // Slot
  2: '🎱', // Bingo
  3: '💎', // Viccon
  4: '⚡', // Volt
  5: '🚀', // Crash
  6: '🎫', // Ticket
  7: '🏆', // Tournament
  8: '👥', // Friend
};

const REWARD_TYPE_ICONS: Record<number, string> = {
  1: '🪙', // Coin
  2: '⚡', // Volt
};

export function MissionClearToast({ onTap }: Props) {
  const notice = useMissionStore((s) => s.pendingClearNotice);
  const clearClearNotice = useMissionStore((s) => s.clearClearNotice);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!notice) return;

    // 2.5초 후 자동 닫기
    timerRef.current = setTimeout(() => {
      clearClearNotice();
    }, 2500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [notice, clearClearNotice]);

  const handleTap = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    clearClearNotice();
    onTap?.();
  };

  return (
    <AnimatePresence>
      {notice && (
        <motion.div
          key={notice.missionIndex}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="pointer-events-auto absolute left-0 right-0 top-0 z-50 mx-3 mt-2"
          onClick={handleTap}
        >
          <div className="flex items-center gap-3 rounded-2xl border border-yellow-400/30 bg-gradient-to-r from-[#1a0a35]/95 via-[#0c1e5a]/95 to-[#1a0a35]/95 px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.6)] backdrop-blur-sm">

            {/* 미션 타입 아이콘 */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-400/15 text-2xl ring-1 ring-yellow-400/30">
              {MISSION_ICONS[notice.missionType] ?? '🎯'}
            </div>

            {/* 텍스트 영역 */}
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-yellow-300">
                Mission Clear!
              </p>
              <p className="truncate text-sm font-semibold text-white">
                {notice.name}
              </p>
              <p className="text-[11px] text-white/60">
                {MISSION_TYPES[notice.missionType] ?? 'Mission'} · Tap to collect
              </p>
            </div>

            {/* 보상 뱃지 */}
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-yellow-400/20 px-2.5 py-1 ring-1 ring-yellow-400/30">
              <span className="text-base leading-none">
                {REWARD_TYPE_ICONS[notice.rewardType] ?? '🪙'}
              </span>
              <span className="text-sm font-black text-yellow-300">
                +{notice.rewardValue.toLocaleString()}
              </span>
            </div>

            {/* 인게임 내에서는 탭 텍스트 표시 안 함 */}
            {onTap && (
              <div className="flex shrink-0 items-center">
                <svg viewBox="0 0 6 10" className="h-3 w-3 fill-white/40">
                  <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            )}

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
