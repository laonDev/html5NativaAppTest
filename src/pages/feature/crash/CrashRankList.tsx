import type { CrashRankListProps } from './types'

export function CrashRankList({
  betRanks,
}: CrashRankListProps) {
  if (betRanks.length === 0) return null

  return (
    <div className="max-h-24 overflow-y-auto rounded-lg bg-[#1a1a2e] p-2">
      {betRanks.slice(0, 10).map((rank, i) => (
        <div key={i} className="flex items-center justify-between py-0.5 text-xs">
          <span className="truncate text-gray-400">{rank.nickname}</span>
          <span className="text-gray-300">{(rank.betMoney / 1000).toFixed(2)}</span>
          {rank.outMulti > 0 && (
            <span className="text-green-400">{rank.outMulti.toFixed(2)}x</span>
          )}
        </div>
      ))}
    </div>
  )
}