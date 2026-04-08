export type BottomSheetState = 'expanded' | 'collapsed';
export type BottomTab = 'all' | 'top' | 'my';

export type BetSlotStatus = 'idle' | 'bet' | 'cashout' | 'lose';
export type RoundStatus = 'waiting' | 'playing' | 'ended';

export interface BetSlotUI {
  id: number;
  amount: number;
  autoCashout?: number | null;
  status: BetSlotStatus;
  cashedOutAt?: number | null;
}

export interface CrashGameState {
  roundStatus: RoundStatus;
  multiplier: number;
  balance: number;
  crashPoint: number;
}