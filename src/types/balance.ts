import type { VoltData } from './volt';
import type { TicketsData } from './ticket';
import type { DailyMissionGetResponse } from './dailyMission';
import type { TournamentResponse } from './tournament';

export interface BalanceData {
  cash: number;
  bonus: number;
}

export interface CoinData {
  viccon: number;
  coin: number;
}

export interface GameBalanceData {
  coinInfo: CoinData;
  voltInfo: VoltData[];
  ticketInfo: TicketsData;
}

export interface UserAccountData {
  id: string;
  profileUrl: string;
  email: string;
  nickname: string;
  gender: string;
  lastName: string;
  firstName: string;
  birthDate: string;
  adress: string;
  currency: string;
  phoneNumber: string;
}

export interface GetUserAccountResponse {
  userInfo: UserAccountData;
  balanceInfo: BalanceData;
  gameBalanceInfo: GameBalanceData;
  dailyMissionInfo: DailyMissionGetResponse;
  Tournament: TournamentResponse | null;
  houseyEndDate: string;
}
