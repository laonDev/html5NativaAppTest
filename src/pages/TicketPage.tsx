import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ticketApi } from '@/api/rest';
import { useTicketStore } from '@/stores/ticketStore';
import { formatCurrency } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { useUiStatus } from '@/components/Feedback/UiStatusProvider';

export function TicketPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [using, setUsing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useUiStatus();

  const gauge = useTicketStore((s) => s.gauge);
  const maxGauge = useTicketStore((s) => s.maxGauge);
  const ticketList = useTicketStore((s) => s.ticketList);
  const setTicketData = useTicketStore((s) => s.setTicketData);
  const removeTicket = useTicketStore((s) => s.removeTicket);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ticketApi.list();
      setTicketData(res);
    } catch (err) {
      console.error('Ticket list error:', err);
      setError('Failed to load tickets.');
      showToast('Failed to load tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUse = async (ticketIdx: number) => {
    if (using !== null) return;
    setUsing(ticketIdx);
    try {
      await ticketApi.use(ticketIdx, 0);
      removeTicket(ticketIdx);
      await loadTickets();
      showToast('Ticket used successfully', 'success');
    } catch (err) {
      console.error('Ticket use error:', err);
      showToast('Failed to use ticket', 'error');
    } finally {
      setUsing(null);
    }
  };

  const gaugePercent = maxGauge > 0 ? Math.min((gauge / maxGauge) * 100, 100) : 0;

  if (loading) {
    return (
      <div className="flex h-full flex-col p-4">
        <Button onClick={() => navigate(-1)} variant="text" size="sm" className="mb-3 self-start">
          ← Back
        </Button>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e94560] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col p-4">
        <Button onClick={() => navigate(-1)} variant="text" size="sm" className="mb-3 self-start">
          ← Back
        </Button>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-gray-300">{error}</p>
          <Button variant="primary" size="sm" onClick={loadTickets}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <Button onClick={() => navigate(-1)} variant="text" size="sm" className="mb-3 self-start">
        ← Back
      </Button>

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
        <div className="py-12 text-center">
          <p className="mb-3 text-gray-500">No tickets available</p>
          <Button variant="secondary" size="sm" onClick={loadTickets}>
            Reload
          </Button>
        </div>
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
