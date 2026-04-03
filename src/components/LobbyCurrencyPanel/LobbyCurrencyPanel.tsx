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
  const gauge = useTicketStore((s) => s.gauge);
  const maxGauge = useTicketStore((s) => s.maxGauge);
  const ticketCount = useTicketStore((s) => s.count);

  return (
    <section className="px-4">
      <div className="overflow-hidden rounded-[14px] border border-[#5f74cf] bg-gradient-to-br from-[#5e2de3] via-[#3a1fb5] to-[#20135f] shadow-[0_8px_18px_rgba(7,10,28,0.5)]">
        <div className="flex min-h-[114px]">
          <div className="flex-1 px-3 py-2.5">
            <h3 className="text-[35px] font-extrabold leading-none tracking-[0.02em] text-white">TICKETS</h3>
            <p className="mt-1 text-[16px] font-semibold leading-tight text-[#d6dcff]">
              TICKETS SERVE AS A MEANS TO EXCHANGE
              <br />
              VICCON FOR CASH.
            </p>

            <button
              type="button"
              onClick={() => navigate('/viccon')}
              className="mt-2 block w-full overflow-hidden rounded-[12px] border border-[#51caff]/70 bg-gradient-to-r from-[#74ffe3] via-[#43a8ff] to-[#2f6dff] p-[1px] text-left"
            >
              <div className="rounded-[11px] bg-gradient-to-b from-[#143b90] to-[#0d235d] px-2 py-1.5">
                <p className="text-[34px] font-black leading-none tracking-[0.02em] text-[#cbf7ff]">VICCON</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#46d66f] text-[12px]">✓</span>
                  <span className="rounded bg-[#0d2e73] px-2 py-0.5 text-[16px] font-bold text-white">
                    {formatViccon(viccon)}
                  </span>
                </div>
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/ticket')}
            className="relative flex w-[100px] shrink-0 flex-col items-center justify-center border-l border-[#667bd3]/60 bg-gradient-to-b from-[#4423c2] to-[#28126e] p-2"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.03em] text-[#d6dcff]">MY TICKETS</p>
            <p className="mt-1 text-[34px] font-black leading-none text-white">{ticketCount}</p>
            <div className="mt-2 rounded bg-[#f726c5] px-1.5 py-0.5 text-[11px] font-black text-white">
              VIEW
            </div>
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#667bd3]/60 bg-[#2a1a72]/80 px-3 py-1.5">
          <span className="text-[14px] font-semibold text-[#d6dcff]">Ticket Gauge</span>
          <span className="text-[14px] font-extrabold text-white">{gauge}/{maxGauge}</span>
        </div>
      </div>
    </section>
  );
}
