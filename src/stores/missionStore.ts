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
  clearClearNotice: () => void;
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

  clearClearNotice: () => set({ pendingClearNotice: null }),
}));
