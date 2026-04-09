import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBalanceStore } from '@/stores/balanceStore';
import { useTicketStore } from '@/stores/ticketStore';
import { TICKET_TOTAL_COUNT } from '@/constants/ticket';
import { AutoScaleTextBox } from '@/components/AutoScaleTextBox/AutoScaleTextBox';

function formatViccon(viccon: number) {
  return (viccon / 1000).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type LobbyCurrencyPanelProps = {
  maxWidth?: number;
};

export function LobbyCurrencyPanel({ maxWidth = 720 }: LobbyCurrencyPanelProps) {
  const navigate = useNavigate();
  const viccon = useBalanceStore((s) => s.viccon);
  const ticketCount = useTicketStore((s) => s.count);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const vicconButtonRef = useRef<HTMLButtonElement | null>(null);
  const [scale, setScale] = useState(1);
  const [vicconBoxScale, setVicconBoxScale] = useState(1);
  const BASE_WIDTH = 358;
  const BASE_HEIGHT = 156;
  const VICCON_BASE_WIDTH = 587;
  const VICCON_BASE_HEIGHT = 183;
  const TICKET_BG_SCALE = 1.62;

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;

    const updateScale = () => {
      const width = target.clientWidth;
      if (!width) return;
      setScale(width / BASE_WIDTH);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const target = vicconButtonRef.current;
    if (!target) return;

    const updateScale = () => {
      const width = target.clientWidth;
      if (!width) return;
      setVicconBoxScale(width / VICCON_BASE_WIDTH);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  return (
    <section className="flex justify-center">
      <div
        className="w-full rounded-[14px]"
        style={{ width: `clamp(320px, calc(100% - 20px), ${maxWidth}px)` }}
      >
        <div
          ref={containerRef}
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
              ref={vicconButtonRef}
              type="button"
              aria-label="Go to Viccon"
              onClick={() => navigate('/viccon')}
              className="relative block w-full overflow-visible text-left"
              style={{ aspectRatio: '587 / 183' }}
            >
              <img
                src="/assets/images/main_hud/viccon_tab.png"
                alt="Viccon"
                className="absolute inset-0 h-full w-full object-contain"
              />
              <div
                className="absolute left-0 top-0"
                style={{
                  width: `${VICCON_BASE_WIDTH}px`,
                  height: `${VICCON_BASE_HEIGHT}px`,
                  transformOrigin: 'top left',
                  transform: `scale(${vicconBoxScale})`,
                }}
              >
                <AutoScaleTextBox
                  text={formatViccon(viccon)}
                  className="absolute z-10 flex items-center justify-end"
                  style={{ left: '130px', top: '95px', width: '220px', height: '50px', paddingRight: '0px' }}
                  textId="viccon-amount-text"
                  textClassName="whitespace-nowrap text-[35px] font-black tracking-[0.02em] text-[#ffffff] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                  align="right"
                />
              </div>
            </button>
          </div>

          <div
            className="pointer-events-none absolute left-0 top-0"
            style={{
              width: `${BASE_WIDTH}px`,
              height: `${BASE_HEIGHT}px`,
              transformOrigin: 'top left',
              transform: `scale(${scale})`,
            }}
          >
            <div
              className="absolute flex items-center justify-center bg-red-400/25"
              style={{ left: '298px', top: '119px', width: '40px', height: '22px' }}
            >
              <img
                src="/assets/images/main_hud/ticket_number_tab.png"
                alt=""
                className="absolute inset-0 h-full w-full object-contain opacity-90"
                style={{
                  transform: `translateX(2px) scale(${TICKET_BG_SCALE})`,
                }}
              />
              <AutoScaleTextBox
                text={`${ticketCount}/${TICKET_TOTAL_COUNT}`}
                className="absolute inset-0"
                textId="ticket-count-text"
                textClassName="whitespace-nowrap text-[14px] font-black text-[#d6ecff]"
                align="center"
                textTranslateY={-3}
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
