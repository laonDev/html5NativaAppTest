import { create } from 'zustand';
import type { DailyMissionInfo } from '@/types';
import { MISSION_STATUS } from '@/types/dailyMission';

interface MissionState {
  missions: DailyMissionInfo[];
  endDate: string | null;
  overallStatus: number;
  hasCompletable: boolean;
  /** 방금 ACHIEVED 상태가 된 미션 — 토스트 표시용. 표시 후 clearClearNotice() 호출 */
  pendingClearNotice: DailyMissionInfo | null;

  setMissions: (missions: DailyMissionInfo[], endDate: string, status: number) => void;
  updateMission: (index: number, status: number) => void;
  updateMissionProgress: (index: number, minValue: number, status?: number, maxValue?: number) => void;
  clearClearNotice: () => void;
  /** DEV 전용 — 모든 미션을 COLLECTED 상태로 만들어 COLLECT 버튼 테스트 */
  devSetAllCollected: () => void;
}

export const useMissionStore = create<MissionState>((set, get) => ({
  missions: [],
  endDate: null,
  overallStatus: 0,
  hasCompletable: false,
  pendingClearNotice: null,

  setMissions: (missions, endDate, status) =>
    set({
      missions,
      endDate,
      overallStatus: status,
      hasCompletable: missions.some((m) => m.status === 2),
    }),

  updateMission: (index, status) => {
    const missions = [...get().missions];
    const mission = missions.find((m) => m.missionIndex === index);
    if (!mission) return;
    mission.status = status;
    set({
      missions,
      hasCompletable: missions.some((m) => m.status === 2),
      // ACHIEVED 로 전환될 때만 토스트 트리거
      ...(status === MISSION_STATUS.ACHIEVED ? { pendingClearNotice: { ...mission } } : {}),
    });
  },

  updateMissionProgress: (index, minValue, status, maxValue) => {
    const missions = [...get().missions];
    const mission = missions.find((m) => m.missionIndex === index);
    if (!mission) return;

    const prevStatus = mission.status;
    mission.minValue = minValue;
    if (typeof maxValue === 'number') {
      mission.maxValue = maxValue;
    }
    if (typeof status === 'number') {
      mission.status = status;
    }

    const becameAchieved =
      prevStatus !== MISSION_STATUS.ACHIEVED && mission.status === MISSION_STATUS.ACHIEVED;

    set({
      missions,
      hasCompletable: missions.some((m) => m.status === MISSION_STATUS.ACHIEVED),
      ...(becameAchieved ? { pendingClearNotice: { ...mission } } : {}),
    });
  },

  clearClearNotice: () => set({ pendingClearNotice: null }),

  devSetAllCollected: () => {
    const missions = get().missions.map((m) => ({ ...m, status: MISSION_STATUS.COLLECTED, minValue: m.maxValue }));
    set({ missions, hasCompletable: false, overallStatus: 1 });
  },
}));
