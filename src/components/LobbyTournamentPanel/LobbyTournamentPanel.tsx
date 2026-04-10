import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournamentStore } from '@/stores/tournamentStore';
import { AutoScaleTextBox } from '@/components/AutoScaleTextBox/AutoScaleTextBox';
import SpineViewer from '@/components/CSpine/SpineViewer';

type LobbyTournamentPanelProps = {
  maxWidth?: number;
};

export function LobbyTournamentPanel({ maxWidth = 720 }: LobbyTournamentPanelProps) {
  const navigate = useNavigate();
  const currentUser = useTournamentStore((s) => s.currentUser);
  const rankingData = currentUser?.rankingData;
  const rank = rankingData?.rank ?? 0;
  const points = rankingData?.point ?? 0;
  const containerRef = useRef<HTMLButtonElement | null>(null);
  const [scale, setScale] = useState(1);
  const BASE_WIDTH = 358;
  const BASE_HEIGHT = 81;

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

  return (
    <section className="flex justify-center">
      <button
        ref={containerRef}
        type="button"
        onClick={() => navigate('/tournament')}
        className="relative block w-full overflow-hidden rounded-[14px] text-left"
        style={{ width: `clamp(320px, calc(100% - 10px), ${maxWidth}px)`, aspectRatio: '358 / 81' }}
      >
        <SpineViewer
          spinePath="/assets/spine/main/banner_tournament.json"
          animation="loop_rank"
          loop
          useBoundsOffset
          useBoundsScale
          width={BASE_WIDTH}
          height={BASE_HEIGHT}
          className="absolute inset-0 h-full w-full object-cover z-10"
        />
        <img
          src="/assets/images/main_hud/tounerment_tab.png"
          alt="Tournament"
          className="absolute inset-0 h-full w-full object-cover z-0"
        />

        <div
          className="absolute left-0 top-0"
          style={{
            width: `${BASE_WIDTH}px`,
            height: `${BASE_HEIGHT}px`,
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
          }}
        >
          <AutoScaleTextBox
            text={rank > 0 ? `#${rank}` : '-'}
            className="absolute flex items-center justify-center"
            style={{ left: '131px', top: '37px', width: '85px', height: '20px' }}
            textId="tournament-rank-text"
            textClassName="whitespace-nowrap text-[19px] font-black text-white"
            align="center"
            textTranslateY={6}
          />

          <AutoScaleTextBox
            text={points.toLocaleString()}
            className="absolute flex items-center justify-end"
            style={{ left: '240px', top: '37px', width: '85px', height: '20px', paddingRight: '0px' }}
            textId="tournament-reward-text"
            textClassName="whitespace-nowrap text-[19px] font-black text-[#ffe17a]"
            align="right"
            textTranslateY={6}
          />
        </div>
      </button>
    </section>
  );
}
