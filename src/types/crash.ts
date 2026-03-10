export interface CrashBet {
  betIndex: number;
  bet: number;
  autoMulti: number;
}

export interface CrashCashResponse {
  bet_idx: number;
  bet_money: number;
  auto_multi: number;
  out_multi: number;
  out_money: number;
}

export interface CrashJoinResponse {
  roundHistory: RoundHistory;
  userHistory: UserHistory[];
}

export interface RoundHistory {
  roundInfo: RoundInfo;
  userInfo: UserHistory;
}

export interface RoundInfo {
  idx: number;
  crash_time: string;
  game_start_time: string;
  hash: string;
  multi: number;
  round_end_time: string;
  round_start_time: string;
}

export interface UserHistory {
  round_idx: number;
  bets: CrashBets[];
  date: string;
}

export interface CrashBets {
  user_idx: number;
  bet_idx: number;
  auto_multi: number;
  nickname: string;
  bet_money: number;
  out_multi: number;
  out_money: number;
  profile_url: string;
}

export interface CrashTopRanking {
  betMoney: number;
  name: string;
  outMoney: number;
  outMulti: number;
  profileUrl: string;
  rank: number;
}

export interface CrashTopRankingResponse {
  rankings: CrashTopRanking[];
}

export interface CrashRoundDetailResponse {
  roundInfo: RoundInfo;
  bets: CrashBets[];
}

export interface CrashUserHistoryResponse {
  history: UserHistory[];
}

export interface CrashRoundHistoryResponse {
  rounds: RoundInfo[];
}

export interface BetRank {
  betIndex: number;
  nickname: string;
  betMoney: number;
  outMulti: number;
  outMoney: number;
  profileUrl: string;
}

export const CRASH_STATE = {
  WAITING: 0,
  START: 1,
  BETCLOSED: 2,
  PLAY: 3,
  PLAYING: 4,
  END: 5,
} as const;

export type CrashGameState = typeof CRASH_STATE[keyof typeof CRASH_STATE];
