import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournamentStore } from '@/stores/tournamentStore';

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
  const rankBoxRef = useRef<HTMLDivElement | null>(null);
  const rewardBoxRef = useRef<HTMLDivElement | null>(null);
  const rankTextRef = useRef<HTMLSpanElement | null>(null);
  const rewardTextRef = useRef<HTMLSpanElement | null>(null);
  const [scale, setScale] = useState(1);
  const [rankScale, setRankScale] = useState(1);
  const [rewardScale, setRewardScale] = useState(1);
  const BASE_WIDTH = 358;
  const BASE_HEIGHT = 81;

  const updateTextScales = useCallback(() => {
    const rankBox = rankBoxRef.current;
    const rankText = rankTextRef.current;
    if (rankBox && rankText) {
      const boxWidth = rankBox.clientWidth;
      const boxHeight = rankBox.clientHeight;
      const textWidth = rankText.scrollWidth;
      const textHeight = rankText.scrollHeight;
      if (boxWidth && boxHeight && textWidth && textHeight) {
        const next = Math.min(1, boxWidth / textWidth, boxHeight / textHeight);
        setRankScale((prev) => (Math.abs(prev - next) < 0.01 ? prev : next));
      }
    }

    const rewardBox = rewardBoxRef.current;
    const rewardText = rewardTextRef.current;
    if (rewardBox && rewardText) {
      const boxWidth = rewardBox.clientWidth;
      const boxHeight = rewardBox.clientHeight;
      const textWidth = rewardText.scrollWidth;
      const textHeight = rewardText.scrollHeight;
      if (boxWidth && boxHeight && textWidth && textHeight) {
        const next = Math.min(1, boxWidth / textWidth, boxHeight / textHeight);
        setRewardScale((prev) => (Math.abs(prev - next) < 0.01 ? prev : next));
      }
    }
  }, []);

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;

    const updateScale = () => {
      const width = target.clientWidth;
      if (!width) return;
      setScale(width / BASE_WIDTH);
      updateTextScales();
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(target);

    return () => observer.disconnect();
  }, [updateTextScales]);

  useEffect(() => {
    updateTextScales();
  }, [rank, points, scale, updateTextScales]);

  return (
    <section className="flex justify-center">
      <button
        ref={containerRef}
        type="button"
        onClick={() => navigate('/tournament')}
        className="relative block w-full overflow-hidden rounded-[14px] text-left"
        style={{ width: `clamp(320px, calc(100% - 10px), ${maxWidth}px)`, aspectRatio: '358 / 81' }}
      >
        <img
          src="/assets/images/main_hud/tounerment_tab.png"
          alt="Tournament"
          className="absolute inset-0 h-full w-full object-cover"
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
          <div
            ref={rankBoxRef}
            className="absolute flex items-center justify-center"
            style={{ left: '131px', top: '37px', width: '85px', height: '20px' }}
          >
            <span
              id="tournament-rank-text"
              className="whitespace-nowrap text-[19px] font-black text-white"
              style={{
                width: '100%',
                height: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transformOrigin: 'center',
                transform: `translateY(6px) scale(${rankScale})`,
              }}
            >
              <span ref={rankTextRef} className="whitespace-nowrap">
                {rank > 0 ? `#${rank}` : '-'}
              </span>
            </span>
          </div>

          <div
            ref={rewardBoxRef}
            className="absolute flex items-center justify-end"
            style={{ left: '240px', top: '37px', width: '85px', height: '20px', paddingRight: '0px' }}
          >
            <span
              id="tournament-reward-text"
              className="whitespace-nowrap text-[19px] font-black text-[#ffe17a]"
              style={{
                width: '100%',
                height: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                transformOrigin: 'right center',
                transform: `translateY(6px) scale(${rewardScale})`,
              }}
            >
              <span ref={rewardTextRef} className="whitespace-nowrap">
                {points.toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      </button>
    </section>
  );
}
