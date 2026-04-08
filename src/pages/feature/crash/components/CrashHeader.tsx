import { useCrashUIStore } from '../store/useCrashUIStore';

export function CrashHeader() {
  const roundStatus = useCrashUIStore((state) => state.roundStatus);
  const balance = useCrashUIStore((state) => state.balance);
  const startRound = useCrashUIStore((state) => state.startRound);
  const endRound = useCrashUIStore((state) => state.endRound);
  const resetRound = useCrashUIStore((state) => state.resetRound);

  return (
    <div className="crash-header">
      <div>← CRASH</div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div>{balance.toFixed(2)}</div>

        {roundStatus === 'waiting' && <button onClick={startRound}>START</button>}
        {roundStatus === 'playing' && <button onClick={endRound}>END</button>}
        {roundStatus === 'ended' && <button onClick={resetRound}>RESET</button>}
      </div>
    </div>
  );
}