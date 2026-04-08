export interface SpinData {
  cash: number;
  bonus: number;
  totalAward: number;
  totalBet: number;
  bigwin: boolean;
  voltType: number;
  ticketValue: number[];
  ticketGauge: number;
  ticketMaxGauge: number;
  tournamentPoint: number;
  time: string;
}

export interface SlotLoginResponse {
  userInfo: { balance: number };
  slotInfo: LoginSlotInfoResponse;
  slotState: SlotState;
}

export interface LoginSlotInfoResponse {
  jackpot: number;
  jackpotInitMulti: number;
  jackpotForDisplay: number;
  slotType: number;
  isJackpotParty: boolean;
  isMultiJackpot: boolean;
  multiJackpots: number[];
  multiJackpotsForDisplay: number[];
  betRange: number[];
  lineCount: number;
  payoutArray: number[][];
  reelArray: number[][];
  buyFeatures: Record<number, number>;
  extraPays: Record<number, number>;
}

export interface SlotState {
  [key: string]: unknown;
}

export interface SpinParameter {
  slotType: number;
  requestType: number;
  totalBet: number;
  coinIn: number;
  lineCount: number;
  betLevel: number;
  uid: string;
  extensions: Record<string, unknown>;
}

export interface SpinResultMessage {
  cash: number;
  bonus: number;
  beforeCash: number;
  beforeBonus: number;
  voltType: number;
  /** 스핀 결과로 클리어된 미션 정보 (서버에서 포함할 때만 존재) */
  missionUpdate?: {
    missionIndex: number;
    status: number;
    minValue?: number;
    maxValue?: number;
  };
}
