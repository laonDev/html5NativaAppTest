import { useEffect, useRef } from 'react'
import { CRASH_STATE } from '@/types'
import { getMultiplierColor } from '@/utils/format'
import type { CrashCanvasProps } from './types'
import SpineViewer from '@/components/CSpine/SpineViewer'

export function CrashCanvas({
  gameState,
  multiplier,
  countdown,
}: CrashCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)

  const getSpaceshipAnimation = () => {
    if (gameState === CRASH_STATE.END) {
      return 'spaceship_boom'
    }

    if (
      gameState === CRASH_STATE.PLAY ||
      gameState === CRASH_STATE.PLAYING
    ) {
      if (multiplier >= 2) {
        return 'spaceship_step_02'
      }

      return 'spaceship_step_01'
    }

    return 'spaceship_standby'
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      const w = canvas.width
      const h = canvas.height

      ctx.clearRect(0, 0, w, h)
      // ctx.fillStyle = '#1a1a2e'
      // ctx.fillRect(0, 0, w, h)

      ctx.strokeStyle = '#ffffff10'
      ctx.lineWidth = 1

      for (let i = 0; i < 5; i++) {
        const y = (h / 5) * i
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      if (gameState === CRASH_STATE.PLAY || gameState === CRASH_STATE.PLAYING) {
        const color = getMultiplierColor(multiplier)

        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.lineWidth = 3
        ctx.moveTo(40, h - 40)

        const progress = Math.min((multiplier - 1) / 10, 1)
        const cx = 40 + (w - 80) * progress
        const cy = h - 40 - (h - 80) * progress * 0.8

        ctx.quadraticCurveTo(cx * 0.5, h - 40, cx, cy)
        ctx.stroke()

        ctx.font = '24px sans-serif'
        ctx.fillText('🚀', cx - 12, cy - 10)

        ctx.fillStyle = color
        ctx.font = 'bold 48px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`${multiplier.toFixed(2)}x`, w / 2, h / 2)
        ctx.textAlign = 'start'
      } else if (gameState === CRASH_STATE.END) {
        ctx.fillStyle = '#ef4444'
        ctx.font = 'bold 48px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('CRASHED!', w / 2, h / 2 - 20)
        ctx.font = 'bold 32px sans-serif'
        ctx.fillText(`${multiplier.toFixed(2)}x`, w / 2, h / 2 + 30)
        ctx.textAlign = 'start'
      } else if (gameState === CRASH_STATE.WAITING) {
        ctx.fillStyle = '#ffffff80'
        ctx.font = '24px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Waiting for next round...', w / 2, h / 2)
        ctx.textAlign = 'start'
      } else if (gameState === CRASH_STATE.START) {
        ctx.fillStyle = '#eab308'
        ctx.textAlign = 'center'
        ctx.font = 'bold 24px sans-serif'
        ctx.fillText('Starting...', w / 2, h / 2 - 40)
        if (countdown > 0) {
          ctx.font = 'bold 64px sans-serif'
          ctx.fillText(String(countdown), w / 2, h / 2 + 20)
        }

        ctx.textAlign = 'start'
      }

      animFrameRef.current = requestAnimationFrame(draw)
    }

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return

      const rect = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)
    animFrameRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [gameState, multiplier, countdown])

  return (
    <div className="relative flex-1 overflow-hidden bg-[#1a1a2e]">
      <div className="absolute inset-0 z-0 pointer-events-none">
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

        <SpineViewer
          spinePath="/assets/spine/crashgame/icon_spaceship.json"
          animation={getSpaceshipAnimation()}
          loop={gameState !== CRASH_STATE.END}
          className="absolute inset-0 pointer-events-none"
          width={375}
          height={250}
          autoCenter={false}
          autoFit={false}
          x={180}
          y={175}
          scale={0.15}
          backgroundAlpha={0}
        />
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10"
      />

      <div className={`
        absolute top-10 left-1/2 -translate-x-1/2
        text-3xl font-bold pointer-events-none
        ${gameState === CRASH_STATE.END ? 'text-red-500' : 'text-green-400'}
      `}>
        {multiplier.toFixed(2)}x
      </div>
    </div>
  )
}