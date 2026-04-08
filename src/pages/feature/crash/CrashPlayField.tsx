import { useEffect, useRef, useState } from 'react'
import { CRASH_STATE } from '@/types'
import SpineViewer from '@/components/CSpine/SpineViewer'

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
  const [shipPosition, setShipPosition] = useState({ x: 0, y: 0 })

  const standbyPosition = { x: 110, y: 420 }

  const isWaiting =
    gameState === CRASH_STATE.WAITING || gameState === CRASH_STATE.START

  const isPlaying =
    gameState === CRASH_STATE.PLAY || gameState === CRASH_STATE.PLAYING

  const currentShipPosition = isWaiting ? standbyPosition : shipPosition

  const getSpaceshipAnimation = () => {
    if (gameState === CRASH_STATE.END) {
      return 'spaceship_boom'
    }

    if (isPlaying) {
      return multiplier >= 2 ? 'spaceship_step_02' : 'spaceship_step_01'
    }

    return 'spaceship_standby'
  }

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

    const bottomSheetHeight = 220
    const bottomPadding = bottomSheetHeight + 24
    const topPadding = 80

    const graphTop = topPadding
    const graphBottom = height - bottomPadding
    const graphHeight = graphBottom - graphTop

    const startX = width * 0.18
    const startY = graphBottom

    if (gameState === CRASH_STATE.WAITING) {
      pointsRef.current = [{ x: startX, y: startY }]
    } else if (isPlaying) {
      const prev = pointsRef.current
      const last = prev[prev.length - 1] ?? { x: startX, y: startY }

      const nextX = Math.min(last.x + 4, width - 20)
      const normalized = Math.min((multiplier - 1) / 4, 1)
      const nextY = graphBottom - normalized * graphHeight

      const nextPoint = { x: nextX, y: nextY }
      pointsRef.current = [...prev, nextPoint]
      setShipPosition(nextPoint)
    }

    ctx.clearRect(0, 0, width, height)

    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1

    for (let i = 1; i < 5; i += 1) {
      const y = graphTop + (graphHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    for (let i = 1; i < 5; i += 1) {
      const x = (width / 5) * i
      ctx.beginPath()
      ctx.moveTo(x, graphTop)
      ctx.lineTo(x, graphBottom)
      ctx.stroke()
    }

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
    }
  }, [gameState, multiplier, isPlaying])

  return (
    <div className="crash-play-field">
      <div className="crash-bg-spine">
        <SpineViewer
          spinePath="/assets/spine/crashgame/crashgame_bg_loop.json"
          animation="Crashgame_bg"
          loop
          className="w-full h-full"
          width={375}
          height={250}
          autoCenter={false}
          autoFit={false}
          scale={0.11}
          x={180}
          y={200}
          backgroundAlpha={0}
        />
      </div>

      <canvas ref={canvasRef} className="crash-play-canvas" />

      <div
        className="crash-ship-layer"
        style={{
          left: `${currentShipPosition.x}px`,
          top: `${currentShipPosition.y}px`,
        }}
      >
        <SpineViewer
          spinePath="/assets/spine/crashgame/icon_spaceship.json"
          animation={getSpaceshipAnimation()}
          loop={gameState !== CRASH_STATE.END}
          className="w-full h-full"
          width={120}
          height={120}
          autoCenter={true}
          autoFit={false}
          scale={0.2}
          backgroundAlpha={0}
        />
      </div>

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