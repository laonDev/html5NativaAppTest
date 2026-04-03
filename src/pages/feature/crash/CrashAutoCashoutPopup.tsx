import { useEffect, useState } from 'react'

interface CrashAutoCashoutPopupProps {
  open: boolean
  betIndex: number
  initialValue: number
  onClose: () => void
  onApply: (betIndex: number, autoMulti: number) => void
}

export function CrashAutoCashoutPopup({
  open,
  betIndex,
  initialValue,
  onClose,
  onApply,
}: CrashAutoCashoutPopupProps) {
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if (!open) return
    setInputValue(initialValue > 0 ? initialValue.toFixed(2) : '')
  }, [open, initialValue])

  if (!open) return null

  const handleReset = () => {
    setInputValue('')
  }

  const handleApply = () => {
    const parsed = Number(inputValue)

    if (!inputValue || Number.isNaN(parsed) || parsed < 1) {
      onApply(betIndex, 0)
      onClose()
      return
    }

    onApply(betIndex, Number(parsed.toFixed(2)))
    onClose()
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[320px] rounded-xl bg-[#1a1a2e] p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            Auto Cashout - Bet {betIndex + 1}
          </h3>
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mb-2 text-xs text-gray-400">
          자동 캐시아웃 배수를 입력하세요.
        </div>

        <div className="mb-3">
          <input
            type="number"
            step="0.01"
            min="1"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="예: 2.50"
            className="w-full rounded bg-[#16213e] px-3 py-2 text-sm text-white outline-none"
          />
        </div>

        <div className="mb-4 grid grid-cols-4 gap-2">
          {[1.50, 2.00, 3.00, 5.00].map((preset) => (
            <button
              key={preset}
              onClick={() => setInputValue(preset.toFixed(2))}
              className="rounded bg-[#16213e] px-2 py-2 text-xs text-white hover:bg-[#223056]"
            >
              {preset.toFixed(2)}x
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex-1 rounded bg-gray-600 py-2 text-sm font-medium text-white"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 rounded bg-[#e94560] py-2 text-sm font-bold text-white"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}