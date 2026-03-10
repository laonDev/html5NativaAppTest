export interface VoltData {
  voltType: number;
  count: number;
}

export interface VoltReward {
  voltType: number;
  vicconReward: number;
  coinReward: number;
}

export interface VoltListResponse {
  voltInfo: VoltData[];
}

export interface VoltOpenResponse {
  voltReward: VoltReward;
}

export interface VoltOpenAllResponse {
  voltRewards: VoltReward[];
}

export const VOLT_TYPES = {
  COMMON: 1,
  PRIME: 2,
  ELITE: 3,
  LUXE: 4,
} as const;

export const VOLT_NAMES: Record<number, string> = {
  1: 'Common',
  2: 'Prime',
  3: 'Elite',
  4: 'Luxe',
};

export const VOLT_COLORS: Record<number, string> = {
  1: '#3b82f6',
  2: '#22c55e',
  3: '#a855f7',
  4: '#eab308',
};
