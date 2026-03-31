import type { BetRank } from '@/types'

/**
 * 각 베팅 슬롯의 결과 상태
 * idle     : 아무것도 안 한 상태
 * bet      : 베팅 완료
 * cashout  : 캐시아웃 성공
 * lose     : 캐시아웃 못하고 종료 (손실)
 */
export type CrashBetResultStatus = 'idle' | 'bet' | 'cashout' | 'lose'

/**
 * 크래시 게임 베팅 슬롯 상태
 * (슬롯 0~3 각각 하나씩 존재)
 */
export interface CrashBetSlotState {
  /** 슬롯 인덱스 (0~3) */
  betIndex: number
  /** 베팅 금액 */
  betAmount: number
  /** 자동 캐시아웃 배수 (예: 2.5x) */
  autoMulti: number
  /** 현재 라운드에 베팅 참여 여부 */
  active: boolean
  /** 캐시아웃 성공 여부 */
  cashedOut: boolean
  /** 캐시아웃 시점 배수 */
  cashOutMulti: number
  /** 최종 획득 금액 (betAmount * cashOutMulti) */
  outMoney: number
  /** 순이익 (outMoney - betAmount, 실패 시 -betAmount) */
  profit: number
  /** 결과 상태 (idle / bet / cashout / lose) */
  resultStatus: CrashBetResultStatus
}

/**
 * 초기 베팅 슬롯 생성
 */
export const createInitialBetSlots = (): CrashBetSlotState[] =>
  [0, 1, 2, 3].map((betIndex) => ({
    betIndex,
    betAmount: 0,
    autoMulti: 0,
    active: false,
    cashedOut: false,
    cashOutMulti: 0,
    outMoney: 0,
    profit: 0,
    resultStatus: 'idle',
  }))

/**
 * BetPanel Props
 */
export interface CrashBetPanelProps {
  betSlots: CrashBetSlotState[]
  /** 베팅 가능 여부 (WAITING / START 상태) */
  canBet: boolean
  /** 캐시아웃 가능 여부 (PLAY 상태) */
  canCashOut: boolean
  /** 현재 multiplier */
  multiplier: number
  /** 베팅 금액 변경 */
  onChangeBetAmount: (index: number, value: number) => void
  /** 자동 캐시아웃 배수 변경 */
  onChangeAutoMulti: (index: number, value: number) => void
  /** 베팅 실행 */
  onBet: (index: number) => void
  /** 캐시아웃 실행 */
  onCashOut: (index: number) => void
  /** AutoCashout 팝업 열기 */
  onOpenAutoCashoutPopup: (index: number) => void
}

/**
 * Header Props
 */
export interface CrashHeaderProps {
  /** 표시용 잔액 문자열 */
  balanceText: string
  /** 뒤로가기 */
  onBack: () => void
}

/**
 * Canvas Props
 */
export interface CrashCanvasProps {
  /** 현재 게임 상태 */
  gameState: number
  /** 현재 multiplier */
  multiplier: number
  /** START 상태에서 표시할 카운트다운 */
  countdown: number
}

/**
 * RankList Props
 */
export interface CrashRankListProps {
  /** 베팅 랭킹 리스트 */
  betRanks: BetRank[]
}