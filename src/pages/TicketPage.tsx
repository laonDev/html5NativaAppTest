import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ticketApi } from '@/api/rest';
import { useTicketStore } from '@/stores/ticketStore';
import { formatCurrency } from '@/utils/format';
import { Button } from '@/components/ui/Button';

export function TicketPage() {
  const [loading, setLoading] = useState(true);
  const [using, setUsing] = useState<number | null>(null);

  const gauge = useTicketStore((s) => s.gauge);
  const maxGauge = useTicketStore((s) => s.maxGauge);
  const ticketList = useTicketStore((s) => s.ticketList);
  const setTicketData = useTicketStore((s) => s.setTicketData);
  const removeTicket = useTicketStore((s) => s.removeTicket);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const res = await ticketApi.list() as any;
      if (res) {
        setTicketData(res);
      }
    } catch (err) {
      console.error('Ticket list error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUse = async (ticketIdx: number) => {
    setUsing(ticketIdx);
    try {
      await ticketApi.use(ticketIdx, 0);
      removeTicket(ticketIdx);
    } catch (err) {
      console.error('Ticket use error:', err);
    } finally {
      setUsing(null);
    }
  };

  const gaugePercent = maxGauge > 0 ? Math.min((gauge / maxGauge) * 100, 100) : 0;

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e94560] border-t-transparent" /></div>;
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      {/* Gauge */}
      <div className="mb-6 rounded-xl bg-[#16213e] p-4">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-400">Ticket Gauge</span>
          <span>{gauge}/{maxGauge}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[#1a1a2e]">
          <motion.div
            animate={{ width: `${gaugePercent}%` }}
            className="h-full rounded-full bg-gradient-to-r from-[#e94560] to-yellow-400"
          />
        </div>
      </div>

      {/* Ticket List */}
      <h3 className="mb-3 text-sm font-medium text-gray-400">My Tickets ({ticketList.length})</h3>
      {ticketList.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No tickets available</div>
      ) : (
        <div className="ui-section-stack">
          {ticketList.map((ticket) => (
            <div key={ticket.ticketIdx} className="flex items-center gap-3 rounded-xl bg-[#16213e] p-4">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#0f3460]">
                {ticket.imgUrl && <img src={ticket.imgUrl} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{ticket.ticketName}</p>
                <p className="text-xs text-gray-400">Value: {formatCurrency(ticket.value)}</p>
              </div>
              <Button
                onClick={() => handleUse(ticket.ticketIdx)}
                disabled={using !== null}
                loading={using === ticket.ticketIdx}
                variant="primary"
                size="sm"
              >
                Use
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
