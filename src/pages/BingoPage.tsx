import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { houseyApi } from '@/api/rest';
import { useBingoStore } from '@/stores/bingoStore';
import { useBalanceStore } from '@/stores/balanceStore';
import { useCountdown } from '@/hooks/useCountdown';
import { HOUSEY_TYPES } from '@/types';

const TIER_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  [HOUSEY_TYPES.BRONZE]: { bg: 'bg-amber-700', text: 'text-amber-200', label: 'Bronze' },
  [HOUSEY_TYPES.SILVER]: { bg: 'bg-gray-400', text: 'text-gray-100', label: 'Silver' },
  [HOUSEY_TYPES.GOLD]: { bg: 'bg-yellow-500', text: 'text-yellow-100', label: 'Gold' },
};

export function BingoPage() {
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [drawnNumber, setDrawnNumber] = useState<number | null>(null);

  const houseyData = useBingoStore((s) => s.houseyData);
  const lastAward = useBingoStore((s) => s.lastAward);
  const setHouseyData = useBingoStore((s) => s.setHouseyData);
  const setLastAward = useBingoStore((s) => s.setLastAward);
  const setIsPlaying = useBingoStore((s) => s.setIsPlaying);
  const endTime = useBingoStore((s) => s.endTime);
  const { display: countdown, isExpired } = useCountdown(endTime);

  useEffect(() => {
    loadBingo();
    return () => setIsPlaying(false);
  }, []);

  const loadBingo = async () => {
    try {
      const res = await houseyApi.read();
      setHouseyData(res.houseyInfo);
    } catch (err) {
      console.error('Bingo read error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDraw = useCallback(async () => {
    if (drawing || !houseyData) return;
    setDrawing(true);
    setLastAward(null);

    try {
      const res = await houseyApi.play(1);
      const newNums = res.houseyInfo.resultNum;
      const latestNum = newNums[newNums.length - 1];

      // Animate drawn number
      setDrawnNumber(latestNum);
      setTimeout(() => setDrawnNumber(null), 1500);

      setHouseyData(res.houseyInfo);
      if (res.awardInfo && res.awardInfo.awardValue > 0) {
        setLastAward(res.awardInfo);
      }

      // Check if stage complete (all lines hit) → reset
      if (res.houseyInfo.hitLines.length >= 3) {
        setTimeout(async () => {
          const resetRes = await houseyApi.reset();
          setHouseyData(resetRes.houseyInfo);
        }, 2000);
      }
    } catch (err) {
      console.error('Bingo play error:', err);
    } finally {
      setDrawing(false);
    }
  }, [drawing, houseyData]);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e94560] border-t-transparent" /></div>;
  }

  const tier = houseyData?.type ?? 1;
  const tierInfo = TIER_COLORS[tier] || TIER_COLORS[1];

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      {/* Timer & Tier */}
      <div className="mb-4 flex items-center justify-between">
        <span className={`rounded-full ${tierInfo.bg} px-4 py-1 text-sm font-bold ${tierInfo.text}`}>
          {tierInfo.label}
        </span>
        <span className="text-sm text-gray-400">{countdown}</span>
      </div>

      {/* Drawn number animation */}
      <AnimatePresence>
        {drawnNumber !== null && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="mb-4 flex items-center justify-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e94560] text-2xl font-bold">
              {drawnNumber}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5x5 Grid */}
      {houseyData && (
        <div className="mx-auto mb-6 grid w-full max-w-xs grid-cols-5 gap-1">
          {houseyData.houseyArray.flat().map((num, idx) => {
            const row = Math.floor(idx / 5);
            const col = idx % 5;
            const isHit = houseyData.houseyHitArray[row]?.[col] === 1;
            const isEmpty = num === 0;

            return (
              <motion.div
                key={idx}
                animate={isHit ? { scale: [1, 1.1, 1] } : {}}
                className={`flex aspect-square items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                  isEmpty
                    ? 'bg-[#16213e]/50'
                    : isHit
                    ? 'bg-[#e94560] text-white'
                    : 'bg-[#16213e] text-gray-300'
                }`}
              >
                {isEmpty ? '' : num}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Hit Lines indicator */}
      <div className="mb-4 flex justify-center gap-2">
        {[0, 1, 2].map((line) => (
          <div
            key={line}
            className={`h-3 w-12 rounded-full ${
              houseyData?.hitLines.includes(line) ? 'bg-[#e94560]' : 'bg-[#16213e]'
            }`}
          />
        ))}
      </div>

      {/* Draw History */}
      <div className="mb-4 flex flex-wrap justify-center gap-1">
        {houseyData?.houseyHistory.map((num, i) => (
          <span key={i} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f3460] text-xs">
            {num}
          </span>
        ))}
      </div>

      {/* Award popup */}
      <AnimatePresence>
        {lastAward && lastAward.awardValue > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="mb-4 rounded-xl bg-yellow-500/20 p-4 text-center"
          >
            <p className="text-lg font-bold text-yellow-400">
              +{lastAward.awardValue}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Draw Button */}
      <button
        onClick={handleDraw}
        disabled={drawing || isExpired}
        className="mt-auto rounded-xl bg-[#e94560] py-4 text-lg font-bold text-white transition-transform active:scale-95 disabled:opacity-50"
      >
        {drawing ? 'Drawing...' : 'DRAW'}
      </button>
    </div>
  );
}
