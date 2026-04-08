import { useEffect, useRef } from 'react'
import { CRASH_STATE } from '@/types'

interface CrashPlayFieldProps {
  gameState: number
  multiplier: number
  countdown: number
}

function getStateText(state: number) {
  switch (state) {
    case CRASH_STATE.WAITING:
      return 'WAITING'
    case CRASH_STATE.START:
      return 'START'
    case CRASH_STATE.PLAY:
      return 'PLAY'
    case CRASH_STATE.END:
      return 'END'
    default:
      return ''
  }
}

export function CrashPlayField({
  gameState,
  multiplier,
  countdown,
}: CrashPlayFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const pointsRef = useRef<Array<{ x: number; y: number }>>([])
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = parent.clientWidth
    const height = parent.clientHeight

    if (!width || !height) return

    canvas.width = width
    canvas.height = height

    // 상태별 점 데이터 갱신
    if (gameState === CRASH_STATE.WAITING) {
      pointsRef.current = [{ x: 20, y: height - 40 }]
    } else if (gameState === CRASH_STATE.PLAY) {
      const prev = pointsRef.current
      const last = prev[prev.length - 1] ?? { x: 20, y: height - 40 }

      const nextX = Math.min(last.x + 6, width - 20)

      // multiplier 1 ~ 5 기준으로 위로 올라가게
      const normalized = Math.min((multiplier - 1) / 4, 1)
      const nextY = height - 40 - normalized * (height - 100)

      pointsRef.current = [...prev, { x: nextX, y: nextY }]
    }

    // draw
    ctx.clearRect(0, 0, width, height)

    // 그리드
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1

    for (let i = 1; i < 5; i += 1) {
      const y = (height / 5) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    for (let i = 1; i < 5; i += 1) {
      const x = (width / 5) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // 그래프 선
    if (pointsRef.current.length > 1) {
      ctx.strokeStyle = '#4ade80'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(pointsRef.current[0].x, pointsRef.current[0].y)

      for (let i = 1; i < pointsRef.current.length; i += 1) {
        const point = pointsRef.current[i]
        ctx.lineTo(point.x, point.y)
      }

      ctx.stroke()

      const lastPoint = pointsRef.current[pointsRef.current.length - 1]
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(lastPoint.x, lastPoint.y, 5, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [gameState, multiplier])

  return (
    <div className="crash-play-field">
      <canvas ref={canvasRef} className="crash-play-canvas" />

      <div className="crash-play-overlay">
        <div className="crash-multiplier">{multiplier.toFixed(2)}x</div>

        {countdown > 0 && (
          <div className="crash-countdown">{countdown}</div>
        )}

        <div className="crash-state">{getStateText(gameState)}</div>
      </div>
    </div>
  )
}