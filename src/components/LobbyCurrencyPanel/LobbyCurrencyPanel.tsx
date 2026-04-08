import { useNavigate } from 'react-router-dom';
import { useBalanceStore } from '@/stores/balanceStore';
import { useTicketStore } from '@/stores/ticketStore';

function formatViccon(viccon: number) {
  return (viccon / 1000).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function LobbyCurrencyPanel() {
  const navigate = useNavigate();
  const viccon = useBalanceStore((s) => s.viccon);
  const ticketCount = useTicketStore((s) => s.count);
  const ticketGauge = useTicketStore((s) => s.gauge);
  const ticketMaxGauge = useTicketStore((s) => s.maxGauge);

  return (
    <section className="flex justify-center">
      <div className="w-full rounded-[14px]" style={{ width: 'calc(100% - 20px)' }}>
        <div
          className="relative block w-full overflow-hidden rounded-[14px] text-left"
          style={{ aspectRatio: '358 / 156' }}
        >
          <img
            src="/assets/images/main_hud/ticket_tab.png"
            alt="Tickets"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute bottom-[1.2%] left-[0.4%] w-[58.5%]">
            <button
              type="button"
              aria-label="Go to Viccon"
              onClick={() => navigate('/viccon')}
              className="relative block w-full text-left"
              style={{ aspectRatio: '587 / 183' }}
            >
              <img
                src="/assets/images/main_hud/viccon_tab.png"
                alt="Viccon"
                className="absolute inset-0 h-full w-full object-contain"
              />
              <div className="relative h-full">
                <div className="absolute left-[19.5%] top-[53%] flex h-[24%] w-[43%] items-center justify-end pr-[8%]">
                  <span className="text-[14px] font-black tracking-[0.02em] text-[#dff3ff]">
                    {formatViccon(viccon)}
                  </span>
                </div>
              </div>
            </button>
          </div>

          <div className="pointer-events-none absolute right-[23.2%] top-[44.5%] translate-x-[90px] translate-y-[30px]">
            <img src="/assets/images/main_hud/ticket_number_tab.png" alt="" className="h-[28px] w-[72px] object-contain opacity-90" />
            <span className="absolute inset-0 flex items-center justify-center -translate-y-[3px] text-[14px] font-black text-[#d6ecff]">
              {ticketCount}
            </span>
          </div>

          <div className="pointer-events-none absolute right-[18%] top-[60.5%] w-[118px] translate-x-[50px] translate-y-[30px]">
            <div className="h-[6px] w-full rounded-full bg-[#0a1338]/80 ring-1 ring-[#7ad3ff]/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#3cc9ff] to-[#7bff7b]"
                style={{
                  width: ticketMaxGauge > 0 ? `${Math.min(100, (ticketGauge / ticketMaxGauge) * 100)}%` : '0%',
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/ticket')}
            aria-label="Go to Ticket"
            className="absolute right-0 top-0 h-full w-[34%]"
          />
        </div>
      </div>
    </section>
  );
}
