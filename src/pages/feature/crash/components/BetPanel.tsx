import { useCrashUIStore } from '../store/useCrashUIStore';
import type { BetSlotUI } from '../types/crashUI';

interface BetPanelProps {
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

export function BetPanel({ slot }: BetPanelProps) {
  const increaseBetAmount = useCrashUIStore((state) => state.increaseBetAmount);
  const decreaseBetAmount = useCrashUIStore((state) => state.decreaseBetAmount);
  const placeBet = useCrashUIStore((state) => state.placeBet);
  const takeCashout = useCrashUIStore((state) => state.takeCashout);

  const handleMainButtonClick = () => {
    if (slot.status === 'idle') {
      placeBet(slot.id);
      return;
    }

    if (slot.status === 'bet') {
      takeCashout(slot.id);
    }
  };

  return (
    <div className="bet-panel">
      <div className="bet-panel-left">
        <div className="bet-panel-title">BET VICCOIN</div>

        <div className="bet-panel-amount-row">
          <button
            className="amount-control-button"
            onClick={() => decreaseBetAmount(slot.id)}
            disabled={slot.status !== 'idle'}
          >
            -
          </button>

          <div className="bet-panel-amount">{slot.amount.toFixed(2)}</div>

          <button
            className="amount-control-button"
            onClick={() => increaseBetAmount(slot.id)}
            disabled={slot.status !== 'idle'}
          >
            +
          </button>
        </div>
      </div>

      <div className="bet-panel-right">
        <div className="bet-multiplier-buttons">
          <button disabled>1</button>
          <button disabled>2</button>
          <button disabled>5</button>
          <button disabled>10</button>
        </div>

        <button
          className={`bet-main-button status-${slot.status}`}
          onClick={handleMainButtonClick}
          disabled={slot.status === 'cashout' || slot.status === 'lose'}
        >
          {getButtonLabel(slot.status)}
        </button>
      </div>
    </div>
  );
}