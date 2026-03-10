export interface TournamentData {
  tournamentId: number;
  bannerUrl: string;
  startDate: string;
  endDate: string;
  lstBenefitData: BenefitData[];
  lstRankingData: RankingData[];
}

export interface BenefitData {
  benefitId: number;
  rankingRangeStart: number;
  rankingRangeEnd: number;
  prizeType: number;
  prizeMoney: number;
}

export interface RankingData {
  userId: number;
  userName: string;
  profileUrl: string;
  rank: number;
  point: number;
  targetBenefit: BenefitData;
}

export interface CurrentUserData {
  received: number;
  rankingData: RankingData;
}

export interface TournamentResponse {
  tournamentData: TournamentData;
  currentUserData: CurrentUserData;
}

export interface TournamentAwardData {
  rank: number;
  rewardType: number;
  rewardValue: number;
  benefitId: number;
}

export interface TournamentAwardResponse {
  awardData: TournamentAwardData;
  lstBenefitData: BenefitData[];
  lstRankingData: RankingData[];
  remainTime: number;
}

export interface TournamentHistoryData {
  seq: number;
  tournamentData: TournamentHistoryInnerData;
}

export interface TournamentHistoryInnerData {
  tournamentId: number;
  bannerUrl: string;
  startDate: string;
  endDate: string;
  lstBenefitData: BenefitData[];
  lstRankingData: RankingData[];
  currentUserData: CurrentUserData;
}

export interface TournamentInfoResponse {
  tournament: TournamentResponse | null;
}

export interface TournamentRankingResponse {
  lstRankingData: RankingData[];
}

export interface TournamentHistoryResponse {
  lstHistoryData: TournamentHistoryData[];
}

export const PRIZE_TYPES = {
  NONE: 0,
  CASH: 1,
  VICCON: 2,
  VOLT: 3,
} as const;
