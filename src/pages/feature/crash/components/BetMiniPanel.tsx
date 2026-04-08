import { useCrashUIStore } from '../store/useCrashUIStore';
import type { BetSlotUI } from '../types/crashUI';

interface BetMiniPanelProps {
  slot: BetSlotUI;
}

function getButtonLabel(status: BetSlotUI['status']) {
  switch (status) {
    case 'idle':
      return 'BET';
    case 'bet':
      return 'TAKE';
    case 'cashout':
      return 'DONE';
    case 'lose':
      return 'LOSE';
    default:
      return 'BET';
  }
}

export function BetMiniPanel({ slot }: BetMiniPanelProps) {
  const placeBet = useCrashUIStore((state) => state.placeBet);
  const takeCashout = useCrashUIStore((state) => state.takeCashout);

  const handleClick = () => {
    if (slot.status === 'idle') {
      placeBet(slot.id);
      return;
    }

    if (slot.status === 'bet') {
      takeCashout(slot.id);
    }
  };

  return (
    <div className="bet-mini-panel">
      <div className="bet-mini-info">
        <div className="bet-mini-title">BET VICCOIN</div>
        <div className="bet-mini-amount">{slot.amount.toFixed(2)}</div>
      </div>

      <button
        className={`bet-mini-button status-${slot.status}`}
        onClick={handleClick}
        disabled={slot.status === 'cashout' || slot.status === 'lose'}
      >
        {getButtonLabel(slot.status)}
      </button>
    </div>
  );
}