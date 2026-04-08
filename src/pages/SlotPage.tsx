import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { casinoApi } from '@/api/rest';
import { socketManager } from '@/api/socket/socketManager';
import { useBalanceStore } from '@/stores/balanceStore';
import { useVoltStore } from '@/stores/voltStore';
import { useTicketStore } from '@/stores/ticketStore';
import { useMissionStore } from '@/stores/missionStore';
import { MISSION_STATUS } from '@/types/dailyMission';
import type { SpinResultMessage } from '@/types';
import { Button } from '@/components/ui/Button';
import { MissionClearToast } from '@/components/MissionClearToast/MissionClearToast';

const IS_DEV = import.meta.env.DEV;

export function SlotPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const slotType = Number(searchParams.get('slotType') || 0);
  const title = searchParams.get('title') || 'Slot';
  const [slotUrl, setSlotUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [lastSpinSummary, setLastSpinSummary] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const cash = useBalanceStore((s) => s.cash);
  const bonus = useBalanceStore((s) => s.bonus);
  const updateFromSpin = useBalanceStore((s) => s.updateFromSpin);
  const addVolt = useVoltStore((s) => s.addVolt);
  const updateGauge = useTicketStore((s) => s.updateGauge);
  const updateMission = useMissionStore((s) => s.updateMission);
  const updateMissionProgress = useMissionStore((s) => s.updateMissionProgress);
  const missions = useMissionStore((s) => s.missions);
  const slotMission = missions.find((m) => m.missionType === 1 && m.status !== MISSION_STATUS.COLLECTED);
  const slotMissionCurrent = slotMission?.minValue ?? 0;
  const slotMissionTarget = slotMission?.target ?? slotMission?.maxValue ?? 0;

  useEffect(() => {
    const enterSlot = async () => {
      try {
        const res = await casinoApi.slotEnter(slotType);
        // 실전 연동 시 서버 launch URL을 우선 사용
        const launchUrl =
          (res as any)?.launchUrl ||
          (res as any)?.slotUrl ||
          (res as any)?.url ||
          '';
        setSlotUrl(typeof launchUrl === 'string' ? launchUrl : '');
        setLoading(false);

        // Join socket room
        socketManager.slotJoin(slotType);

        // Listen for spin results
        socketManager.onSpin((data: SpinResultMessage) => {
          updateFromSpin(data.cash, data.bonus);
          if (data.voltType > 0) {
            addVolt(data.voltType, 1);
          }
          // 서버가 미션 클리어 정보를 함께 보낼 경우 처리
          if (data.missionUpdate) {
            if (typeof data.missionUpdate.minValue === 'number') {
              updateMissionProgress(
                data.missionUpdate.missionIndex,
                data.missionUpdate.minValue,
                data.missionUpdate.status,
                data.missionUpdate.maxValue,
              );
            } else {
              updateMission(data.missionUpdate.missionIndex, data.missionUpdate.status);
            }
          }
          setLastSpinSummary(`Spin event: cash ${data.beforeCash} -> ${data.cash}`);
        });
      } catch (err) {
        console.error('Slot enter error:', err);
        navigate('/lobby');
      }
    };

    enterSlot();

    return () => {
      socketManager.slotLeave(slotType);
      socketManager.off('spin');
    };
  }, [slotType]);

  const handleSpin = async () => {
    if (spinning) return;
    setSpinning(true);
    try {
      const totalBet = 1000;
      const result = await casinoApi.slotSpin({
        slotType,
        requestType: 1,
        totalBet,
        coinIn: totalBet,
        lineCount: 20,
        betLevel: 1,
        uid: String(Date.now()),
        extensions: {},
      } as any);

      const nextCash = typeof (result as any).cash === 'number' ? (result as any).cash : cash;
      const nextBonus = typeof (result as any).bonus === 'number' ? (result as any).bonus : bonus;
      updateFromSpin(nextCash, nextBonus);

      if (typeof (result as any).ticketGauge === 'number' && typeof (result as any).ticketMaxGauge === 'number') {
        updateGauge((result as any).ticketGauge, (result as any).ticketMaxGauge);
      }

      if (typeof (result as any).voltType === 'number' && (result as any).voltType > 0) {
        addVolt((result as any).voltType, 1);
      }

      if ((result as any).missionUpdate) {
        const missionUpdate = (result as any).missionUpdate;
        if (typeof missionUpdate.minValue === 'number') {
          updateMissionProgress(
            missionUpdate.missionIndex,
            missionUpdate.minValue,
            missionUpdate.status,
            missionUpdate.maxValue,
          );
        } else {
          updateMission(missionUpdate.missionIndex, missionUpdate.status);
        }
      }

      const beforeCash = typeof (result as any).beforeCash === 'number' ? (result as any).beforeCash : cash;
      const diff = nextCash - beforeCash;
      setLastSpinSummary(
        `Spin done | bet: £${(totalBet / 1000).toFixed(2)} | ${diff >= 0 ? 'win' : 'loss'}: £${(Math.abs(diff) / 1000).toFixed(2)}`,
      );
    } catch (err) {
      console.error('Spin error:', err);
      setLastSpinSummary('Spin failed');
    } finally {
      setSpinning(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-black">
      {/* Slot Header */}
      <div className="flex items-center justify-between bg-[#16213e] px-4 py-2">
        <Button onClick={() => navigate('/lobby')} variant="text" size="sm">
          ← Back
        </Button>
        <div className="flex flex-col items-center leading-tight">
          <h2 className="text-sm font-medium">{title}</h2>
          <p className="text-[10px] text-[#9ec8ff]">
            Mission: {slotMission ? `${slotMissionCurrent}/${slotMissionTarget}` : '-'}
          </p>
        </div>
        {/* Mock 모드 전용 — 미션 클리어 토스트 테스트 버튼 */}
        {IS_DEV ? (
          <button
            className="rounded bg-yellow-500/20 px-2 py-1 text-[10px] font-bold text-yellow-300 ring-1 ring-yellow-400/30 active:opacity-70"
            onClick={() => {
              const target = missions.find((m) => m.status === MISSION_STATUS.IN_PROGRESS);
              if (target) updateMission(target.missionIndex, MISSION_STATUS.ACHIEVED);
            }}
          >
            TEST
          </button>
        ) : (
          <div className="w-12" />
        )}
      </div>

      {/* Slot iframe + 미션 클리어 토스트 (인게임 — 탭해도 이동 없음) */}
      <div className="relative flex-1">
        <MissionClearToast />
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e94560] border-t-transparent" />
          </div>
        ) : slotUrl ? (
          <iframe
            ref={iframeRef}
            src={slotUrl}
            className="h-full w-full border-none"
            allow="autoplay; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-5 px-4">
            <div className="w-full max-w-md rounded-xl border border-[#253f8d] bg-[#0c1535] p-4">
              <p className="text-sm text-gray-300">Mock Slot Runtime (연동 가정 모드)</p>
              <p className="mt-2 text-xs text-gray-400">slotType: {slotType || '-'}</p>
              <p className="text-xs text-gray-400">cash: £{(cash / 1000).toFixed(2)} / bonus: £{(bonus / 1000).toFixed(2)}</p>
              <p className="mt-2 min-h-5 text-xs text-[#8fd2ff]">{lastSpinSummary}</p>
            </div>

            <button
              type="button"
              onClick={handleSpin}
              disabled={spinning}
              className="rounded-lg bg-[#2a4dff] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {spinning ? 'Spinning...' : 'Spin (API)'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
