import type { CrashRankListProps } from './types'

export function CrashRankList({
  betRanks,
}: CrashRankListProps) {
  if (betRanks.length === 0) return null

  return (
    <div className="rounded-xl bg-[#1a1a2e] p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-bold text-white">Top Players</div>
        <div className="text-[11px] text-gray-400">
          {Math.min(betRanks.length, 10)} shown
        </div>
      </div>

      <div className="mb-2 grid grid-cols-4 gap-2 px-2 text-[11px] text-gray-400">
        <div>User</div>
        <div className="text-right">Bet</div>
        <div className="text-right">Multi</div>
        <div className="text-right">Take</div>
      </div>

      <div className="max-h-48 space-y-2 overflow-y-auto">
        {betRanks.slice(0, 10).map((rank, i) => {
          const betText = (rank.betMoney / 1000).toFixed(2)
          const multiText =
            rank.outMulti > 0 ? `${(rank.outMulti / 100).toFixed(2)}x` : '-'
          const takeText =
            rank.outMoney > 0 ? (rank.outMoney / 1000).toFixed(2) : '-'
          const isCashOut = rank.outMulti > 0

          return (
            <div
              key={i}
              className="grid grid-cols-4 gap-2 rounded-lg bg-[#16213e] px-2 py-2 text-xs"
            >
              <div className="truncate text-white">{rank.nickname}</div>

              <div className="text-right text-gray-300">
                {betText}
              </div>

              <div
                className={`text-right font-medium ${
                  isCashOut ? 'text-yellow-300' : 'text-gray-500'
                }`}
              >
                {multiText}
              </div>

              <div
                className={`text-right font-medium ${
                  isCashOut ? 'text-green-400' : 'text-gray-500'
                }`}
              >
                {takeText}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}