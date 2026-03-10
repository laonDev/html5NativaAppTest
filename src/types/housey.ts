export interface HouseyData {
  houseyHistory: number[];
  houseyArray: number[][];
  houseyHitArray: number[][];
  hitLines: number[];
  type: number;
  resultNum: number[];
  activated: number;
  endTime: string | null;
}

export interface HouseyAwardData {
  awardType: number;
  awardValue: number;
}

export interface HouseyReadResponse {
  houseyInfo: HouseyData;
}

export interface HouseyPlayResponse {
  houseyInfo: HouseyData;
  awardInfo: HouseyAwardData;
}

export interface HouseyResetResponse {
  houseyInfo: HouseyData;
}

export const HOUSEY_TYPES = {
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
} as const;
