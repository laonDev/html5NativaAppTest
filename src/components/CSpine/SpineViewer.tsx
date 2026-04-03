import { useEffect, useRef } from 'react'
import { Application, Assets } from 'pixi.js'
import { Spine } from '@esotericsoftware/spine-pixi-v8'
import { SpineController } from './SpineController'

/**
 * ============================================
 * SpineViewer 사용 가이드
 * ============================================
 *
 * 1. 기본 사용
 * <SpineViewer
 *   spinePath="/spine/character/character.json"
 *   animation="loop"
 *   loop={true}
 * />
 *
 * 2. 위치 / 크기 지정
 * <SpineViewer
 *   spinePath="/spine/character/character.json"
 *   animation="start"
 *   loop={false}
 *   x={400}
 *   y={500}
 *   scale={0.7}
 * />
 *
 * 3. 스킨 적용
 * <SpineViewer
 *   spinePath="/spine/character/character.json"
 *   animation="loop"
 *   loop={true}
 *   skin="default"
 * />
 *
 * 4. 자동 중앙 정렬 / 자동 맞춤
 * <SpineViewer
 *   spinePath="/spine/character/character.json"
 *   animation="loop"
 *   loop={true}
 *   autoCenter={true}
 *   autoFit={true}
 *   fitRatio={0.8}
 * />
 *
 * 5. 디버깅
 * <SpineViewer
 *   spinePath="/spine/character/character.json"
 *   animation="loop"
 *   debug={true}
 * />
 *
 * 6. 외부 제어
 * <SpineViewer
 *   spinePath="/spine/character/character.json"
 *   onReady={(controller) => {
 *     controller.logAnimations()
 *   }}
 * />
 *
 * ============================================
 */

export interface SpineViewerProps {
  spinePath: string
  animation?: string
  loop?: boolean
  skin?: string

  x?: number
  y?: number
  scale?: number

  width?: number
  height?: number
  backgroundAlpha?: number

  autoCenter?: boolean
  autoFit?: boolean
  fitRatio?: number

  debug?: boolean
  className?: string
  onReady?: (controller: SpineController) => void
}

export default function SpineViewer({
  spinePath,
  animation,
  loop = true,
  skin,
  x,
  y,
  scale = 1,
  width = 800,
  height = 600,
  backgroundAlpha = 0,
  autoCenter = true,
  autoFit = false,
  fitRatio = 0.8,
  debug = false,
  className,
  onReady,
}: SpineViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const appRef = useRef<Application | null>(null)
  const controllerRef = useRef<SpineController | null>(null)
  
  const applyAutoLayout = (
    controller: SpineController,
    app: Application,
  ) => {
    const spine = controller.getInstance()

    let finalScale = scale

    if (autoFit) {
      const rawBounds = spine.getLocalBounds()

      if (rawBounds.width > 0 && rawBounds.height > 0) {
        const targetWidth = app.screen.width * fitRatio
        const targetHeight = app.screen.height * fitRatio

        const scaleX = targetWidth / rawBounds.width
        const scaleY = targetHeight / rawBounds.height

        finalScale = Math.min(scaleX, scaleY)
      }
    }

    controller.setScale(finalScale)

    if (autoCenter) {
      const bounds = spine.getLocalBounds()

      const centerX = app.screen.width / 2
      const centerY = app.screen.height / 2

      const offsetX = (bounds.x + bounds.width / 2) * finalScale
      const offsetY = (bounds.y + bounds.height / 2) * finalScale

      controller.setPosition(centerX - offsetX, centerY - offsetY)
    } else {
      const resolvedX = x ?? app.screen.width / 2
      const resolvedY = y ?? app.screen.height / 2
      controller.setPosition(resolvedX, resolvedY)
    }
  }

  useEffect(() => {
    let mounted = true

    const init = async () => {
      if (!containerRef.current) return

      const app = new Application()
      await app.init({
        width,
        height,
        backgroundAlpha,
        antialias: true,
      })

      if (!mounted) {
        app.destroy(true)
        return
      }

      appRef.current = app
      containerRef.current.appendChild(app.canvas)

      app.canvas.style.width = '100%'
app.canvas.style.height = '100%'
app.canvas.style.display = 'block'

      const jsonPath = spinePath
      const atlasPath = spinePath.replace(/\.json$/i, '.atlas')

      const jsonAlias = `${jsonPath}-json`
      const atlasAlias = `${jsonPath}-atlas`

      try {
        Assets.add({ alias: jsonAlias, src: jsonPath })
        Assets.add({ alias: atlasAlias, src: atlasPath })

        if (debug) {
          console.log('[SpineViewer] jsonPath:', jsonPath)
          console.log('[SpineViewer] atlasPath:', atlasPath)
        }

        await Assets.load([jsonAlias, atlasAlias])

        if (debug) {
          console.log('[SpineViewer] assets loaded')
        }
      } catch (err) {
        console.error('[SpineViewer] load failed:', err)
        return
      }

      if (!mounted) {
        app.destroy(true)
        return
      }

      let spine: Spine

      try {
        spine = Spine.from({
          skeleton: jsonAlias,
          atlas: atlasAlias,
        })
      } catch (err) {
        console.error('[SpineViewer] Spine.from failed:', err)
        return
      }

      app.stage.addChild(spine)

      const controller = new SpineController(spine)
      controllerRef.current = controller

      if (debug) {
        controller.logAnimations()
        controller.logSkins()
      }

      if (skin) {
        controller.setSkin(skin)
      }

      applyAutoLayout(controller, app)

      if (animation) {
        controller.setAnimation(0, animation, loop)
      }

      onReady?.(controller)
    }

    init()

    return () => {
      mounted = false

      controllerRef.current?.destroy()
      controllerRef.current = null

      if (appRef.current) {
        appRef.current.destroy(true, { children: true })
        appRef.current = null
      }

      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [spinePath, width, height, backgroundAlpha, debug])

  useEffect(() => {
    const controller = controllerRef.current
    if (!controller) return
    if (!animation) return

    controller.setAnimation(0, animation, loop)
  }, [animation, loop])

  useEffect(() => {
    const controller = controllerRef.current
    if (!controller) return
    if (!skin) return

    controller.setSkin(skin)
  }, [skin])

  useEffect(() => {
    const controller = controllerRef.current
    const app = appRef.current
    if (!controller || !app) return

    applyAutoLayout(controller, app)
  }, [x, y, scale, autoCenter, autoFit, fitRatio])

  return <div ref={containerRef} className={className} />
}