import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { casinoApi } from '@/api/rest';
import { socketManager } from '@/api/socket/socketManager';
import { useBalanceStore } from '@/stores/balanceStore';
import { useVoltStore } from '@/stores/voltStore';
import { useTicketStore } from '@/stores/ticketStore';
import type { SpinResultMessage } from '@/types';
import { Button } from '@/components/ui/Button';

export function SlotPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const slotType = Number(searchParams.get('slotType') || 0);
  const title = searchParams.get('title') || 'Slot';
  const [slotUrl, setSlotUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const updateFromSpin = useBalanceStore((s) => s.updateFromSpin);
  const addVolt = useVoltStore((s) => s.addVolt);
  const updateGauge = useTicketStore((s) => s.updateGauge);

  useEffect(() => {
    const enterSlot = async () => {
      try {
        const res = await casinoApi.slotEnter(slotType);
        // The slot URL would come from the response or config
        setSlotUrl(`/slot-game?slotType=${slotType}`);
        setLoading(false);

        // Join socket room
        socketManager.slotJoin(slotType);

        // Listen for spin results
        socketManager.onSpin((data: SpinResultMessage) => {
          updateFromSpin(data.cash, data.bonus);
          if (data.voltType > 0) {
            addVolt(data.voltType, 1);
          }
        });
      } catch (err) {
        console.error('Slot enter error:', err);
        navigate('/lobby');
      }
    };

    enterSlot();

    return () => {
      socketManager.slotLeave(slotType);
      socketManager.off('spin');
    };
  }, [slotType]);

  return (
    <div className="flex h-full flex-col bg-black">
      {/* Slot Header */}
      <div className="flex items-center justify-between bg-[#16213e] px-4 py-2">
        <Button onClick={() => navigate('/lobby')} variant="text" size="sm">
          ← Back
        </Button>
        <h2 className="text-sm font-medium">{title}</h2>
        <div className="w-12" />
      </div>

      {/* Slot iframe */}
      <div className="flex-1">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e94560] border-t-transparent" />
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={slotUrl}
            className="h-full w-full border-none"
            allow="autoplay; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        )}
      </div>
    </div>
  );
}
