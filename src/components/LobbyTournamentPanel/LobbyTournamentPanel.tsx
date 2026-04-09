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

  return (
    <section className="flex justify-center">
      <button
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

        <div className="absolute left-[44.5%] top-[58%] flex h-[24%] w-[14%] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <span className="translate-y-[6px] text-[13px] font-black text-white">
            {rank > 0 ? `#${rank}` : '-'}
          </span>
        </div>

        <div className="absolute left-[70%] top-[58%] flex h-[24%] w-[22%] -translate-y-1/2 items-center justify-end pr-[5%]">
          <span className="translate-y-[6px] text-[13px] font-black text-[#ffe17a]">
            {points.toLocaleString()}
          </span>
        </div>
      </button>
    </section>
  );
}
