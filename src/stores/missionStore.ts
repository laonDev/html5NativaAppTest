import { create } from 'zustand';
import type { DailyMissionInfo } from '@/types';

interface MissionState {
  missions: DailyMissionInfo[];
  endDate: string | null;
  overallStatus: number;
  hasCompletable: boolean;

  setMissions: (missions: DailyMissionInfo[], endDate: string, status: number) => void;
  updateMission: (index: number, status: number) => void;
}

export const useMissionStore = create<MissionState>((set, get) => ({
  missions: [],
  endDate: null,
  overallStatus: 0,
  hasCompletable: false,

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
    if (mission) mission.status = status;
    set({
      missions,
      hasCompletable: missions.some((m) => m.status === 2),
    });
  },
}));
