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

  return (
    <section className="flex justify-center px-2">
      <div className="w-[358px] rounded-[14px]">
        <div className="relative block h-[156px] w-[358px] overflow-hidden rounded-[14px] text-left">
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

          <div className="pointer-events-none absolute right-[23.2%] top-[44.5%]">
            <img src="/assets/images/main_hud/ticket_number_tab.png" alt="" className="h-[28px] w-[72px] object-contain opacity-90" />
            <span className="absolute inset-0 flex items-center justify-center text-[14px] font-black text-[#d6ecff]">
              {ticketCount}
            </span>
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
