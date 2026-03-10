import { create } from 'zustand';
import type { BalanceData, CoinData } from '@/types';

interface BalanceState {
  cash: number;
  bonus: number;
  balance: number;
  viccon: number;
  bingoCoin: number;

  setBalance: (data: BalanceData) => void;
  setCoinData: (data: CoinData) => void;
  updateFromSpin: (cash: number, bonus: number) => void;
  updateFromStomp: (balance: number, bonusMoney: number) => void;
}

export const useBalanceStore = create<BalanceState>((set) => ({
  cash: 0,
  bonus: 0,
  balance: 0,
  viccon: 0,
  bingoCoin: 0,

  setBalance: (data) =>
    set({
      cash: data.cash,
      bonus: data.bonus,
      balance: data.cash + data.bonus,
    }),

  setCoinData: (data) =>
    set({
      viccon: data.viccon,
      bingoCoin: data.coin,
    }),

  updateFromSpin: (cash, bonus) =>
    set({
      cash,
      bonus,
      balance: cash + bonus,
    }),

  updateFromStomp: (balance, bonusMoney) => {
    const cashValue = Math.round((balance - bonusMoney) * 1000);
    const bonusValue = Math.round(bonusMoney * 1000);
    set({
      cash: cashValue,
      bonus: bonusValue,
      balance: cashValue + bonusValue,
    });
  },
}));

export const formatBalance = (amount: number): string => {
  return `£${(amount / 1000).toFixed(2)}`;
};
