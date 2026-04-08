import type { CrashBetPanelProps } from './types'

const BET_SLOTS = [0, 1]

type BetMiniPanelProps = Pick<
  CrashBetPanelProps,
  'betSlots' | 'canBet' | 'canCashOut' | 'multiplier' | 'onBet' | 'onCashOut' | 'onChangeBetAmount'
>

export function BetMiniPanel({
  betSlots,
  canBet,
  canCashOut,
  multiplier,
  onBet,
  onCashOut,
  onChangeBetAmount,
}: BetMiniPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-2 bg-[#16213e] p-2">
      {BET_SLOTS.map((idx) => {
        const slot = betSlots[idx]

        const canShowBetButton =
          !slot.active &&
          slot.resultStatus !== 'cashout' &&
          slot.resultStatus !== 'lose'

        const canShowCashOutButton = slot.active && !slot.cashedOut

        return (
          <div key={idx} className="rounded bg-[#1a1a2e] p-2">
            <div className="mb-1 text-[11px] text-gray-400">
              Bet {idx + 1}
            </div>

            <div className="mb-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  onChangeBetAmount(idx, Math.max(0, slot.betAmount - 1))
                }
                disabled={!canBet || slot.active}
                className="rounded bg-[#223056] px-2 py-1 text-[11px] text-white disabled:opacity-30"
              >
                -
              </button>

              <div className="flex-1 text-center text-sm font-bold text-white">
                {slot.betAmount > 0 ? slot.betAmount.toFixed(0) : '-'}
              </div>

              <button
                type="button"
                onClick={() => onChangeBetAmount(idx, slot.betAmount + 1)}
                disabled={!canBet || slot.active}
                className="rounded bg-[#223056] px-2 py-1 text-[11px] text-white disabled:opacity-30"
              >
                +
              </button>
            </div>

            {canShowBetButton ? (
              <button
                type="button"
                onClick={() => onBet(idx)}
                disabled={!canBet || slot.betAmount <= 0}
                className="w-full rounded bg-[#e94560] py-1 text-[11px] font-bold text-white disabled:opacity-30"
              >
                Bet
              </button>
            ) : canShowCashOutButton ? (
              <button
                type="button"
                onClick={() => onCashOut(idx)}
                disabled={!canCashOut}
                className="w-full rounded bg-green-500 py-1 text-[11px] font-bold text-white disabled:opacity-30"
              >
                {canCashOut ? `Take ${multiplier.toFixed(2)}x` : 'Wait'}
              </button>
            ) : slot.resultStatus === 'cashout' ? (
              <div className="py-1 text-center text-[11px] font-bold text-green-400">
                Cashed Out!
              </div>
            ) : slot.resultStatus === 'lose' ? (
              <div className="py-1 text-center text-[11px] font-bold text-red-400">
                Lose
              </div>
            ) : (
              <div className="py-1 text-center text-[11px] text-gray-400">
                Waiting
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}