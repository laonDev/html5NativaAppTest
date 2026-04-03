// features/crash/mocks/crashSocketMock.ts

import { CRASH_STATE } from '@/types'

export function startCrashMock(socketManager: any) {
  let tick = 0
  let state: number = CRASH_STATE.WAITING

  // join
  setTimeout(() => {
    socketManager.emitMock('crash_join', {
      roundIndex: 1,
      currentState: CRASH_STATE.WAITING,
      tick: 0,
      hash: 'mock',
      userCount: 10,
      betRank: [],
    })
  }, 500)

  // state loop
  setInterval(() => {
    if (state === CRASH_STATE.WAITING) {
      state = CRASH_STATE.START
      tick = 0
    } else if (state === CRASH_STATE.START) {
      state = CRASH_STATE.PLAY
    } else if (state === CRASH_STATE.PLAY) {
      tick++

      if (tick > 150) {
        state = CRASH_STATE.END
      }
    } else if (state === CRASH_STATE.END) {
      state = CRASH_STATE.WAITING
      tick = 0
    }

    socketManager.emitMock('crash_state', {
      currentState: state,
      tick,
    })

    if (state === CRASH_STATE.END) {
      socketManager.emitMock('crash_end', {
        cashOutRank: [],
        betRank: [],
      })
    }
  }, 100)
}