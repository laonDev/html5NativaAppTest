import type { CrashBetPanelProps } from './types'

const BET_SLOTS = [0, 1, 2, 3]

export function CrashBetPanel({
  betSlots,
  canBet,
  canCashOut,
  multiplier,
  onChangeBetAmount,
  onChangeAutoMulti,
  onBet,
  onCashOut,
  onOpenAutoCashoutPopup,
}: CrashBetPanelProps) {
  return (
    <div
      className="space-y-2 bg-[#16213e] p-3"
      style={{ paddingBottom: 'calc(12px + var(--safe-bottom))' }}
    >
      <div className="grid grid-cols-2 gap-2">
        {BET_SLOTS.slice(0, 2).map((idx) => {
          const slot = betSlots[idx]

          return (
            <div key={idx} className="rounded-lg bg-[#1a1a2e] p-2">
              <input
                type="number"
                value={slot.betAmount || ''}
                onChange={(e) => onChangeBetAmount(idx, Number(e.target.value))}
                placeholder="Bet amount"
                disabled={!canBet || slot.active}
                className="mb-1 w-full rounded bg-[#16213e] px-2 py-1.5 text-xs text-white outline-none disabled:opacity-50"
              />

              <input
                type="number"
                value={slot.autoMulti || ''}
                onChange={(e) => onChangeAutoMulti(idx, Number(e.target.value))}
                placeholder="Auto x"
                disabled={!canBet || slot.active}
                className="mb-2 w-full rounded bg-[#16213e] px-2 py-1.5 text-xs text-white outline-none disabled:opacity-50"
              />

              <button
                type="button"
                onClick={() => onOpenAutoCashoutPopup(idx)}
                disabled={!canBet || slot.active}
                className="mb-2 w-full rounded bg-[#223056] py-1.5 text-xs text-white disabled:opacity-40"
              >
                Auto Cashout
                {slot.autoMulti > 0 ? ` (${slot.autoMulti.toFixed(2)}x)` : ''}
              </button>

              {!slot.active ? (
                <button
                  onClick={() => onBet(idx)}
                  disabled={!canBet || slot.betAmount <= 0}
                  className="w-full rounded bg-[#e94560] py-1.5 text-xs font-bold disabled:opacity-30"
                >
                  Bet
                </button>
              ) : !slot.cashedOut ? (
                <button
                  onClick={() => onCashOut(idx)}
                  disabled={!canCashOut}
                  className="w-full rounded bg-green-500 py-1.5 text-xs font-bold disabled:opacity-30"
                >
                  Cash Out {canCashOut ? `(${multiplier.toFixed(2)}x)` : ''}
                </button>
              ) : (
                <div className="py-1.5 text-center text-xs text-green-400">
                  Cashed Out!
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}