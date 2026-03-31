import { Spine } from '@esotericsoftware/spine-pixi-v8'
import {
  AnimationStateListener,
  Physics,
  TrackEntry,
} from '@esotericsoftware/spine-core'

/**
 * ============================================
 * SpineController 사용 가이드
 * ============================================
 *
 * 1. Spine 생성 후 Controller 생성
 * const spine = Spine.from(spineData)
 * const controller = new SpineController(spine)
 * app.stage.addChild(spine)
 *
 * 2. 애니메이션 재생
 * controller.setAnimation(0, 'start', false)
 * controller.setAnimation(0, 'loop', true)
 *
 * 3. 애니메이션 이어붙이기
 * controller.setAnimation(0, 'start', false)
 * controller.addAnimation(0, 'loop', true, 0)
 *
 * 4. prefix 기반 랜덤 재생
 * controller.playRandomByPrefix('hit')
 *
 * 5. 목록 확인
 * controller.logAnimations()
 * controller.logSkins()
 *
 * 6. 스킨 변경
 * controller.setSkin('default')
 *
 * 7. 위치 / 크기 조정
 * controller.setPosition(x, y)
 * controller.setScale(0.7)
 *
 * 8. 제거
 * controller.destroy()
 *
 * ============================================
 */

export interface SetAnimationOptions {
  loop?: boolean
  resetQueue?: boolean
}

export interface QueueAnimationOptions {
  loop?: boolean
  delay?: number
}

export interface RandomAnimationOptions {
  excludes?: string[]
  loop?: boolean
  resetQueue?: boolean
}

export class SpineController {
  private spine: Spine

  constructor(spine: Spine) {
    this.spine = spine
  }

  getInstance(): Spine {
    return this.spine
  }

  private getSkeletonData() {
    return this.spine.skeleton.data
  }

  getAnimationNames(): string[] {
    return this.getSkeletonData().animations.map(
      (animation: { name: string }) => animation.name,
    )
  }

  getSkinNames(): string[] {
    return this.getSkeletonData().skins.map(
      (skin: { name: string }) => skin.name,
    )
  }

  hasAnimation(name: string): boolean {
    return this.getAnimationNames().includes(name)
  }

  hasSkin(name: string): boolean {
    return this.getSkinNames().includes(name)
  }

  findAnimationsByPrefix(prefix: string): string[] {
    return this.getAnimationNames().filter((name) => name.startsWith(prefix))
  }

  findAnimationsByKeyword(keyword: string): string[] {
    return this.getAnimationNames().filter((name) => name.includes(keyword))
  }

  setAnimation(
    trackIndex: number,
    name: string,
    loop = false,
    resetQueue = true,
  ): TrackEntry | null {
    if (!this.hasAnimation(name)) {
      console.warn(`[SpineController] animation not found: ${name}`)
      return null
    }

    if (resetQueue) {
      this.clearTrack(trackIndex)
    }

    return this.spine.state.setAnimation(trackIndex, name, loop)
  }

  addAnimation(
    trackIndex: number,
    name: string,
    loop = false,
    delay = 0,
  ): TrackEntry | null {
    if (!this.hasAnimation(name)) {
      console.warn(`[SpineController] animation not found: ${name}`)
      return null
    }

    return this.spine.state.addAnimation(trackIndex, name, loop, delay)
  }

  play(name: string, options: SetAnimationOptions = {}): TrackEntry | null {
    const { loop = false, resetQueue = true } = options
    return this.setAnimation(0, name, loop, resetQueue)
  }

  queue(name: string, options: QueueAnimationOptions = {}): TrackEntry | null {
    const { loop = false, delay = 0 } = options
    return this.addAnimation(0, name, loop, delay)
  }

  playSequence(
    names: string[],
    trackIndex = 0,
    lastLoop = false,
  ): TrackEntry[] {
    const result: TrackEntry[] = []

    if (names.length === 0) {
      return result
    }

    this.clearTrack(trackIndex)

    names.forEach((name, index) => {
      if (!this.hasAnimation(name)) {
        console.warn(`[SpineController] animation not found: ${name}`)
        return
      }

      if (index === 0) {
        const entry = this.spine.state.setAnimation(trackIndex, name, false)
        result.push(entry)
      } else {
        const isLast = index === names.length - 1
        const entry = this.spine.state.addAnimation(
          trackIndex,
          name,
          isLast ? lastLoop : false,
          0,
        )
        result.push(entry)
      }
    })

    return result
  }

  playRandomByPrefix(
    prefix: string,
    options: RandomAnimationOptions = {},
  ): TrackEntry | null {
    const { excludes = [], loop = false, resetQueue = true } = options

    const candidates = this.findAnimationsByPrefix(prefix).filter(
      (name) => !excludes.includes(name),
    )

    if (candidates.length === 0) {
      console.warn(`[SpineController] no animations found with prefix: ${prefix}`)
      return null
    }

    const selected =
      candidates[Math.floor(Math.random() * candidates.length)]

    return this.setAnimation(0, selected, loop, resetQueue)
  }

  setSkin(name: string): void {
    const skin = this.spine.skeleton.data.findSkin(name)

    if (!skin) {
      console.warn(`[SpineController] skin not found: ${name}`)
      return
    }

    this.spine.skeleton.setSkin(skin)
    this.spine.skeleton.setSlotsToSetupPose()
    this.spine.skeleton.updateWorldTransform(Physics.update)
  }

  setPosition(x: number, y: number): void {
    this.spine.position.set(x, y)
  }

  setScale(x: number, y?: number): void {
    this.spine.scale.set(x, y ?? x)
  }

  setVisible(visible: boolean): void {
    this.spine.visible = visible
  }

  addListener(listener: AnimationStateListener): void {
    this.spine.state.addListener(listener)
  }

  clearTrack(trackIndex = 0): void {
    this.spine.state.setEmptyAnimation(trackIndex, 0)
  }

  clearAllTracks(): void {
    this.spine.state.clearTracks()
  }

  getCurrent(trackIndex = 0): TrackEntry | null {
    return this.spine.state.getCurrent(trackIndex)
  }

  getCurrentAnimationName(trackIndex = 0): string | null {
    const current = this.getCurrent(trackIndex)
    return current?.animation?.name ?? null
  }

  logAnimations(): void {
    console.log('[SpineController] animations:', this.getAnimationNames())
  }

  logSkins(): void {
    console.log('[SpineController] skins:', this.getSkinNames())
  }

  destroy(): void {
    this.clearAllTracks()

    if (this.spine.parent) {
      this.spine.parent.removeChild(this.spine)
    }

    this.spine.destroy({
      children: true,
    })
  }
}