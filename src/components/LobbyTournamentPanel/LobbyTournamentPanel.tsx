import { useNavigate } from 'react-router-dom';
import { useTournamentStore } from '@/stores/tournamentStore';

export function LobbyTournamentPanel() {
  const navigate = useNavigate();
  const tournament = useTournamentStore((s) => s.tournament);
  const currentUser = useTournamentStore((s) => s.currentUser);
  const rankingData = currentUser?.rankingData;

  if (!tournament || !rankingData) {
    return null;
  }

  const rank = rankingData.rank;
  const points = rankingData.point;

  return (
    <section className="px-4">
      <button
        type="button"
        onClick={() => navigate('/tournament')}
        className="w-full overflow-hidden rounded-[14px] border border-[#d6a93c] bg-gradient-to-br from-[#e2a619] via-[#aa6908] to-[#5b3200] text-left shadow-[0_8px_18px_rgba(27,15,2,0.45)]"
      >
        <div className="flex items-center justify-between border-b border-[#f0c14d]/60 bg-gradient-to-r from-[#f2ba2e] to-[#be7a11] px-3 py-1.5">
          <h3 className="text-[34px] font-black leading-none tracking-[0.03em] text-[#fff7d8]">TOURNAMENT</h3>
          <span className="text-[22px] font-black text-[#fff7d8]">›</span>
        </div>

        <div className="px-3 py-2.5">
          <div className="rounded-[12px] border border-[#7b4f08] bg-gradient-to-b from-[#5d2f06] to-[#2f1702] p-2">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-[26px] font-black leading-none text-[#ffe8a2]">My Rank</p>
              <div className="flex items-center gap-1">
                <span className="text-[14px] text-[#ffd671]">🪙</span>
                <span className="text-[16px] font-bold text-[#ffe8a2]">{points.toLocaleString()}</span>
              </div>
            </div>
            <div className="h-4 overflow-hidden rounded-full border border-[#81520a] bg-[#251201]">
              <div
                className="h-full bg-gradient-to-r from-[#f4cf62] to-[#d18e13]"
                style={{ width: `${Math.min(100, Math.max(15, 100 - Number(rank) * 2))}%` }}
              />
            </div>
            <p className="mt-1 text-[14px] font-bold text-[#fff2c4]">#{rank}</p>
          </div>
        </div>
      </button>
    </section>
  );
}
