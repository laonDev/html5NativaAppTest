export interface DailyMissionGetResponse {
  dailyMissionInfos: DailyMissionInfo[];
  endDate: string;
  status: number;
}

export interface DailyMissionInfo {
  missionIndex: number;
  name: string;
  content: string;
  minValue: number;
  maxValue: number;
  target: number;
  status: number;
  missionType: number;
  rewardValue: number;
  rewardType: number;
}

export interface DailyMissionCollectResponse {
  missionRewardType: number;
  missionRewardValue: number;
}

export interface DailyMissionCollectAllResponse {
  missionRewards: MissionRewardInfo[];
}

export interface MissionRewardInfo {
  missionIndex: number;
  missionRewardType: number;
  missionRewardValue: number;
}

export interface DailyMissionCompleteResponse {
  voltType: number;
  voltValue: number;
}

export const MISSION_STATUS = {
  IN_PROGRESS: 1,
  ACHIEVED: 2,
  COLLECTED: 3,
} as const;

export const MISSION_TYPES: Record<number, string> = {
  1: 'Slot',
  2: 'Bingo',
  3: 'Viccon',
  4: 'Volt',
  5: 'Crash',
  6: 'Ticket',
  7: 'Tournament',
  8: 'Friend',
};
