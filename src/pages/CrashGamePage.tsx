import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { crashApi } from '@/api/rest';
import { socketManager } from '@/api/socket/socketManager';
import { useCrashStore } from '@/stores/crashStore';
import { useBalanceStore, formatBalance } from '@/stores/balanceStore';
import { CRASH_STATE } from '@/types';
import type { BetRank } from '@/types';
import { getMultiplierColor } from '@/utils/format';

const BET_SLOTS = [0, 1, 2, 3];

export function CrashGamePage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const gameState = useCrashStore((s) => s.gameState);
  const multiplier = useCrashStore((s) => s.multiplier);
  const betRanks = useCrashStore((s) => s.betRanks);
  const cashOutRanks = useCrashStore((s) => s.cashOutRanks);
  const setRoundInfo = useCrashStore((s) => s.setRoundInfo);
  const setGameState = useCrashStore((s) => s.setGameState);
  const setTick = useCrashStore((s) => s.setTick);
  const setMultiplier = useCrashStore((s) => s.setMultiplier);
  const setBetRanks = useCrashStore((s) => s.setBetRanks);
  const setCashOutRanks = useCrashStore((s) => s.setCashOutRanks);
  const clearBets = useCrashStore((s) => s.clearBets);
  const balance = useBalanceStore((s) => s.balance);

  const [betAmounts, setBetAmounts] = useState<number[]>([0, 0, 0, 0]);
  const [autoMultis, setAutoMultis] = useState<number[]>([0, 0, 0, 0]);
  const [activeBets, setActiveBets] = useState<boolean[]>([false, false, false, false]);
  const [cashedOut, setCashedOut] = useState<boolean[]>([false, false, false, false]);

  // Socket.IO event handlers
  useEffect(() => {
    const init = async () => {
      try {
        const joinRes = await crashApi.join();
        // Connect socket events
        socketManager.crashJoin();

        socketManager.onCrashJoin((data) => {
          setRoundInfo(data.roundIndex, data.currentState, data.tick, data.hash, data.userCount);
          setBetRanks(data.betRank);
          clearBets();
          setActiveBets([false, false, false, false]);
          setCashedOut([false, false, false, false]);
        });

        socketManager.onCrashState((data) => {
          setGameState(data.currentState);
          setTick(data.tick);

          // Calculate multiplier from tick
          if (data.currentState === CRASH_STATE.PLAY || data.currentState === CRASH_STATE.PLAYING) {
            const multi = Math.pow(1.0024, data.tick);
            setMultiplier(Math.round(multi * 100) / 100);
          }
        });

        socketManager.onCrashBet((data) => {
          setBetRanks(data.betRank);
        });

        socketManager.onCrashEnd((data) => {
          setGameState(CRASH_STATE.END);
          setCashOutRanks(data.cashOutRank);
          setBetRanks(data.betRank);
        });

        socketManager.onCrashCashOut((data) => {
          // Update UI for cash outs
        });
      } catch (err) {
        console.error('Crash join error:', err);
      }
    };

    init();

    return () => {
      socketManager.crashLeave();
      socketManager.off('crash_join');
      socketManager.off('crash_state');
      socketManager.off('crash_bet');
      socketManager.off('crash_end');
      socketManager.off('crash_cash_out');
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = '#ffffff10';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = (h / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      if (gameState === CRASH_STATE.PLAY || gameState === CRASH_STATE.PLAYING) {
        // Draw rocket trail
        const multi = multiplier;
        const color = getMultiplierColor(multi);

        // Curve path
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.moveTo(40, h - 40);

        const progress = Math.min((multi - 1) / 10, 1);
        const cx = 40 + (w - 80) * progress;
        const cy = h - 40 - (h - 80) * progress * 0.8;

        ctx.quadraticCurveTo(cx * 0.5, h - 40, cx, cy);
        ctx.stroke();

        // Rocket emoji at curve end
        ctx.font = '24px sans-serif';
        ctx.fillText('🚀', cx - 12, cy - 10);

        // Multiplier display
        ctx.fillStyle = color;
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${multi.toFixed(2)}x`, w / 2, h / 2);
        ctx.textAlign = 'start';
      } else if (gameState === CRASH_STATE.END) {
        // Crashed
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CRASHED!', w / 2, h / 2 - 20);
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText(`${multiplier.toFixed(2)}x`, w / 2, h / 2 + 30);
        ctx.textAlign = 'start';
      } else if (gameState === CRASH_STATE.WAITING) {
        ctx.fillStyle = '#ffffff80';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Waiting for next round...', w / 2, h / 2);
        ctx.textAlign = 'start';
      } else if (gameState === CRASH_STATE.START) {
        ctx.fillStyle = '#eab308';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Starting...', w / 2, h / 2);
        ctx.textAlign = 'start';
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    // Set canvas size
    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    animFrameRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gameState, multiplier]);

  const handleBet = async (betIndex: number) => {
    const amount = betAmounts[betIndex];
    if (amount <= 0) return;

    try {
      await crashApi.bet(betIndex, amount, autoMultis[betIndex]);
      const newActive = [...activeBets];
      newActive[betIndex] = true;
      setActiveBets(newActive);
    } catch (err) {
      console.error('Bet error:', err);
    }
  };

  const handleCashOut = async (betIndex: number) => {
    try {
      await crashApi.cashOut(betIndex);
      const newCashed = [...cashedOut];
      newCashed[betIndex] = true;
      setCashedOut(newCashed);
    } catch (err) {
      console.error('Cash out error:', err);
    }
  };

  const canBet = gameState === CRASH_STATE.WAITING || gameState === CRASH_STATE.START;
  const canCashOut = gameState === CRASH_STATE.PLAY || gameState === CRASH_STATE.PLAYING;

  return (
    <div className="flex h-full flex-col bg-[#1a1a2e]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-400">← Back</button>
        <h2 className="text-sm font-bold">Crash</h2>
        <span className="text-xs text-gray-400">{formatBalance(balance)}</span>
      </div>

      {/* Canvas */}
      <div className="relative flex-1">
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>

      {/* Bet Controls */}
      <div className="space-y-2 bg-[#16213e] p-3" style={{ paddingBottom: 'calc(12px + var(--safe-bottom))' }}>
        <div className="grid grid-cols-2 gap-2">
          {BET_SLOTS.slice(0, 2).map((idx) => (
            <div key={idx} className="rounded-lg bg-[#1a1a2e] p-2">
              <input
                type="number"
                value={betAmounts[idx] || ''}
                onChange={(e) => {
                  const arr = [...betAmounts];
                  arr[idx] = Number(e.target.value);
                  setBetAmounts(arr);
                }}
                placeholder="Bet amount"
                disabled={!canBet || activeBets[idx]}
                className="mb-1 w-full rounded bg-[#16213e] px-2 py-1.5 text-xs text-white outline-none disabled:opacity-50"
              />
              <input
                type="number"
                value={autoMultis[idx] || ''}
                onChange={(e) => {
                  const arr = [...autoMultis];
                  arr[idx] = Number(e.target.value);
                  setAutoMultis(arr);
                }}
                placeholder="Auto x"
                disabled={!canBet || activeBets[idx]}
                className="mb-2 w-full rounded bg-[#16213e] px-2 py-1.5 text-xs text-white outline-none disabled:opacity-50"
              />
              {!activeBets[idx] ? (
                <button
                  onClick={() => handleBet(idx)}
                  disabled={!canBet || betAmounts[idx] <= 0}
                  className="w-full rounded bg-[#e94560] py-1.5 text-xs font-bold disabled:opacity-30"
                >
                  Bet
                </button>
              ) : !cashedOut[idx] ? (
                <button
                  onClick={() => handleCashOut(idx)}
                  disabled={!canCashOut}
                  className="w-full rounded bg-green-500 py-1.5 text-xs font-bold disabled:opacity-30"
                >
                  Cash Out {canCashOut ? `(${multiplier.toFixed(2)}x)` : ''}
                </button>
              ) : (
                <div className="py-1.5 text-center text-xs text-green-400">Cashed Out!</div>
              )}
            </div>
          ))}
        </div>

        {/* Bet Rank leaderboard */}
        {betRanks.length > 0 && (
          <div className="max-h-24 overflow-y-auto rounded-lg bg-[#1a1a2e] p-2">
            {betRanks.slice(0, 10).map((rank, i) => (
              <div key={i} className="flex items-center justify-between py-0.5 text-xs">
                <span className="truncate text-gray-400">{rank.nickname}</span>
                <span className="text-gray-300">{(rank.betMoney / 1000).toFixed(2)}</span>
                {rank.outMulti > 0 && (
                  <span className="text-green-400">{rank.outMulti.toFixed(2)}x</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
