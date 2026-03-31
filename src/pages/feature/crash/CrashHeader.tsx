import { Button } from '@/components/ui/Button'
import type { CrashHeaderProps } from './types'

export function CrashHeader({
  balanceText,
  onBack,
}: CrashHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <Button onClick={onBack} variant="text" size="sm">
        ← Back
      </Button>
      <h2 className="text-sm font-bold">Crash</h2>
      <span className="text-xs text-gray-400">{balanceText}</span>
    </div>
  )
}