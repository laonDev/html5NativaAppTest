import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
// import { crashApi } from '@/api/rest'
// import { socketManager } from '@/api/socket/socketManager'
import { useCrashStore } from '@/stores/crashStore'
import { useBalanceStore, formatBalance } from '@/stores/balanceStore'
import { CRASH_STATE } from '@/types'
import { CrashHeader } from './CrashHeader'
import { CrashCanvas } from './CrashCanvas'
import { CrashBetPanel } from './CrashBetPanel'
import { CrashRankList } from './CrashRankList'
import { CrashAutoCashoutPopup } from './CrashAutoCashoutPopup'
import type { CrashBetSlotState } from './types'
import { createInitialBetSlots } from './types'

export function CrashGamePageV2() {
  const navigate = useNavigate()

  const gameState = useCrashStore((s) => s.gameState)
  const multiplier = useCrashStore((s) => s.multiplier)
  const betRanks = useCrashStore((s) => s.betRanks)
  // const setRoundInfo = useCrashStore((s) => s.setRoundInfo)
  const setGameState = useCrashStore((s) => s.setGameState)
  const setTick = useCrashStore((s) => s.setTick)
  const setMultiplier = useCrashStore((s) => s.setMultiplier)
  // const setBetRanks = useCrashStore((s) => s.setBetRanks)
  // const setCashOutRanks = useCrashStore((s) => s.setCashOutRanks)
  // const clearBets = useCrashStore((s) => s.clearBets)
  const [countdown, setCountdown] = useState(0)

  const balance = useBalanceStore((s) => s.balance)

  const [betSlots, setBetSlots] = useState<CrashBetSlotState[]>(
    createInitialBetSlots(),
  )
  const updateBetSlot = (
    betIndex: number,
    updater: (slot: CrashBetSlotState) => CrashBetSlotState,
  ) => {
    setBetSlots((prev) =>
      prev.map((slot) =>
        slot.betIndex === betIndex ? updater(slot) : slot,
      ),
    )
  }
  
  const [autoPopupOpen, setAutoPopupOpen] = useState(false)
  const [selectedBetIndex, setSelectedBetIndex] = useState(0)
  
  useEffect(() => {
    console.log('🔥 CrashGamePageV2 mounted')
  }, [])

  /*
   * =========================================================
   * REAL SERVER / SOCKET FLOW
   * =========================================================
   * 실서버 연동 시 아래 useEffect 주석 해제해서 사용
   */
  // useEffect(() => {
  //   const init = async () => {
  //     try {
  //       await crashApi.join()
  //       socketManager.crashJoin()
  //
  //       socketManager.onCrashJoin((data) => {
  //         setRoundInfo(
  //           data.roundIndex,
  //           data.currentState,
  //           data.tick,
  //           data.hash,
  //           data.userCount,
  //         )
  //         setBetRanks(data.betRank)
  //         clearBets()
  //       })
  //
  //       socketManager.onCrashState((data) => {
  //         setGameState(data.currentState)
  //         setTick(data.tick)
  //
  //         if (
  //           data.currentState === CRASH_STATE.PLAY ||
  //           data.currentState === CRASH_STATE.PLAYING
  //         ) {
  //           const multi = Math.pow(1.0024, data.tick)
  //           setMultiplier(Math.round(multi * 100) / 100)
  //         }
  //       })
  //
  //       socketManager.onCrashBet((data) => {
  //         setBetRanks(data.betRank)
  //       })
  //
  //       socketManager.onCrashEnd((data) => {
  //         setGameState(CRASH_STATE.END)
  //         setCashOutRanks(data.cashOutRank)
  //         setBetRanks(data.betRank)
  //       })
  //
  //       socketManager.onCrashCashOut(() => {})
  //     } catch (err) {
  //       console.error('Crash join error:', err)
  //     }
  //   }
  //
  //   init()
  //
  //   return () => {
  //     socketManager.crashLeave()
  //     socketManager.off('crash_join')
  //     socketManager.off('crash_state')
  //     socketManager.off('crash_bet')
  //     socketManager.off('crash_end')
  //     socketManager.off('crash_cash_out')
  //   }
  // }, [
  //   clearBets,
  //   setBetRanks,
  //   setCashOutRanks,
  //   setGameState,
  //   setMultiplier,
  //   setRoundInfo,
  //   setTick,
  // ])

  /*
   * =========================================================
   * MOCK ROUND FLOW
   * =========================================================
   * 서버/소켓 미구성 상태에서 화면 및 상태 전환 테스트용
   *
   * WAITING (3s)
   * -> START (2s)
   * -> PLAY (tick 증가, multiplier 증가)
   * -> END (2s)
   * -> 반복
   */
  useEffect(() => {
    const WAITING_TIME = 7000
    const START_TIME = 3000
    const PLAY_INTERVAL = 100
    const CRASH_TICK = 180
    const END_TIME = 2500

    let stateTimer: number | null = null
    let playTimer: number | null = null
    let countdownTimer: number | null = null
    let disposed = false

    const resetRoundUi = () => {
        setBetSlots((prev) =>
        prev.map((slot) => ({
          ...slot,
          active: false,
          cashedOut: false,
          cashOutMulti: 0,
          outMoney: 0,
          profit: 0,
          resultStatus: 'idle',
        })),
      )
    }

    const clearTimers = () => {
      if (stateTimer) {
        window.clearTimeout(stateTimer)
        stateTimer = null
      }

      if (playTimer) {
        window.clearInterval(playTimer)
        playTimer = null
      }

      if (countdownTimer) {
        window.clearInterval(countdownTimer)
        countdownTimer = null
      }
    }

    const runRound = () => {
    if (disposed) return

    let tick = 0
    const crashTick = CRASH_TICK

    resetRoundUi()
    setGameState(CRASH_STATE.WAITING)
    setTick(0)
    setMultiplier(1)
    setCountdown(0)

    stateTimer = window.setTimeout(() => {
      if (disposed) return

      setGameState(CRASH_STATE.START)
      setCountdown(3)

      let count = 3
      countdownTimer = window.setInterval(() => {
        count -= 1
        setCountdown(count)

        if (count <= 0) {
          if (countdownTimer) {
            window.clearInterval(countdownTimer)
            countdownTimer = null
          }
        }
      }, 1000)

      stateTimer = window.setTimeout(() => {
        if (disposed) return

        setGameState(CRASH_STATE.PLAY)
        setCountdown(0)

        playTimer = window.setInterval(() => {
          if (disposed) return

          tick += 1
          setTick(tick)

          const multi = Math.pow(1.0024, tick)
          setMultiplier(Math.round(multi * 100) / 100)

          if (tick >= crashTick) {
            if (playTimer) {
              window.clearInterval(playTimer)
              playTimer = null
            }

            setBetSlots((prev) =>
                prev.map((slot) => {
                  if (!slot.active) return slot
                  if (slot.cashedOut) return slot

                  return {
                    ...slot,
                    resultStatus: 'lose',
                    outMoney: 0,
                    profit: -slot.betAmount,
                    active: false,
                  }
                }),
              )

            setGameState(CRASH_STATE.END)
            setCountdown(0)

            stateTimer = window.setTimeout(() => {
              runRound()
            }, END_TIME)
          }
        }, PLAY_INTERVAL)
      }, START_TIME)
    }, WAITING_TIME)
  }

    runRound()

    return () => {
      disposed = true
      clearTimers()
    }
  }, [setGameState, setMultiplier, setTick])

  const handleChangeBetAmount = (index: number, value: number) => {
    updateBetSlot(index, (slot) => ({
      ...slot,
      betAmount: value,
    }))
  }

  const handleChangeAutoMulti = (index: number, value: number) => {
    updateBetSlot(index, (slot) => ({
    ...slot,
    autoMulti: value,
  }))
  }

  const handleBet = async (betIndex: number) => {
    const slot = betSlots[betIndex]
    if (!slot) return

    const amount = slot.betAmount
    if (amount <= 0) return

    try {
      // 실서버 연동 시 사용
      // await crashApi.bet(betIndex, amount, autoMultis[betIndex])

      updateBetSlot(betIndex, (currentSlot) => ({
        ...currentSlot,
        active: true,
        cashedOut: false,
        cashOutMulti: 0,
        outMoney: 0,
        profit: 0,
        resultStatus: 'bet',
      }))
    } catch (err) {
      console.error('Bet error:', err)
    }
  }

  const handleCashOut = async (betIndex: number) => {
    try {
      // 실서버 연동 시 사용
      // await crashApi.cashOut(betIndex)

      updateBetSlot(betIndex, (slot) => {
        const cashOutMulti = multiplier
        const outMoney = Math.floor(slot.betAmount * cashOutMulti)
        const profit = outMoney - slot.betAmount

        return {
          ...slot,
          active: false,
          cashedOut: true,
          cashOutMulti,
          outMoney,
          profit,
          resultStatus: 'cashout',
        }
      })  
    } catch (err) {
      console.error('Cash out error:', err)
    }
  }

const handleOpenAutoCashoutPopup = (betIndex: number) => {
  setSelectedBetIndex(betIndex)
  setAutoPopupOpen(true)
}

const handleApplyAutoCashout = (betIndex: number, autoMulti: number) => {
  updateBetSlot(betIndex, (slot) => ({
    ...slot,
    autoMulti,
  }))
}

  const canBet =
    gameState === CRASH_STATE.WAITING || gameState === CRASH_STATE.START

  const canCashOut =
    gameState === CRASH_STATE.PLAY || gameState === CRASH_STATE.PLAYING

  return (
    <div className="flex h-full flex-col bg-[#1a1a2e]">
      <CrashAutoCashoutPopup
        open={autoPopupOpen}
        betIndex={selectedBetIndex}
        initialValue={betSlots[selectedBetIndex]?.autoMulti ?? 0}
        onClose={() => setAutoPopupOpen(false)}
        onApply={handleApplyAutoCashout}
      />
      <CrashHeader
        balanceText={formatBalance(balance)}
        onBack={() => navigate(-1)}
      />

      <CrashCanvas gameState={gameState} multiplier={multiplier} countdown={countdown} />

      <div
        className="bg-[#16213e] p-3"
        style={{ paddingBottom: 'calc(12px + var(--safe-bottom))' }}
      >
        <CrashBetPanel
          betSlots={betSlots}
          canBet={canBet}
          canCashOut={canCashOut}
          multiplier={multiplier}
          onChangeBetAmount={handleChangeBetAmount}
          onChangeAutoMulti={handleChangeAutoMulti}
          onBet={handleBet}
          onCashOut={handleCashOut}
          onOpenAutoCashoutPopup={handleOpenAutoCashoutPopup}
        />

        <CrashRankList betRanks={betRanks} />
      </div>
    </div>
  )
}