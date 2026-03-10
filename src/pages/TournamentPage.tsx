import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { tournamentApi } from '@/api/rest';
import { useTournamentStore } from '@/stores/tournamentStore';
import { useCountdown } from '@/hooks/useCountdown';
import { formatCurrency } from '@/utils/format';
import { PRIZE_TYPES } from '@/types';

type Tab = 'present' | 'previous';

export function TournamentPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('present');
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const tournament = useTournamentStore((s) => s.tournament);
  const currentUser = useTournamentStore((s) => s.currentUser);
  const rankings = useTournamentStore((s) => s.rankings);
  const history = useTournamentStore((s) => s.history);
  const setTournament = useTournamentStore((s) => s.setTournament);
  const setRankings = useTournamentStore((s) => s.setRankings);
  const setHistory = useTournamentStore((s) => s.setHistory);

  const { display: countdown } = useCountdown(tournament?.endDate ?? null);

  useEffect(() => {
    loadTournament();

    // 180s polling
    pollRef.current = setInterval(loadTournament, 180000);
    return () => clearInterval(pollRef.current);
  }, []);

  const loadTournament = async () => {
    try {
      const res = await tournamentApi.info(true, 0, 100);
      if (res.tournament) {
        setTournament(res.tournament.tournamentData, res.tournament.currentUserData);
        setRankings(res.tournament.tournamentData.lstRankingData);
      } else {
        setTournament(null, null);
      }
    } catch (err) {
      console.error('Tournament info error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await tournamentApi.history(10);
      setHistory(res.lstHistoryData);
    } catch (err) {
      console.error('Tournament history error:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'previous' && history.length === 0) {
      loadHistory();
    }
  }, [activeTab]);

  const getPrizeLabel = (type: number) => {
    switch (type) {
      case PRIZE_TYPES.CASH: return 'Cash';
      case PRIZE_TYPES.VICCON: return 'Viccon';
      case PRIZE_TYPES.VOLT: return 'Volt';
      default: return '';
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e94560] border-t-transparent" /></div>;
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {(['present', 'previous'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium capitalize ${
              activeTab === tab ? 'border-b-2 border-[#e94560] text-white' : 'text-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'present' && (
        <div className="p-4">
          {!tournament ? (
            <div className="py-12 text-center text-gray-500">No active tournament</div>
          ) : (
            <>
              {/* Banner */}
              {tournament.bannerUrl && (
                <img src={tournament.bannerUrl} alt="tournament" className="mb-4 w-full rounded-xl" />
              )}

              {/* Countdown */}
              <div className="mb-4 text-center">
                <p className="text-xs text-gray-400">Ends in</p>
                <p className="text-2xl font-bold text-[#e94560]">{countdown}</p>
              </div>

              {/* Current user rank */}
              {currentUser && (
                <div className="mb-4 rounded-xl bg-[#e94560]/20 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Your Rank</p>
                      <p className="text-2xl font-bold">#{currentUser.rankingData.rank}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Points</p>
                      <p className="text-lg font-bold">{currentUser.rankingData.point.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Leaderboard */}
              <h3 className="mb-2 text-sm font-medium text-gray-400">Leaderboard</h3>
              <div className="space-y-2">
                {rankings.slice(0, 100).map((rank, idx) => (
                  <motion.div
                    key={rank.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="flex items-center gap-3 rounded-lg bg-[#16213e] p-3"
                  >
                    <span className={`w-8 text-center text-sm font-bold ${
                      rank.rank <= 3 ? 'text-yellow-400' : 'text-gray-500'
                    }`}>
                      #{rank.rank}
                    </span>
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-[#0f3460]">
                      {rank.profileUrl && <img src={rank.profileUrl} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <span className="flex-1 truncate text-sm">{rank.userName}</span>
                    <span className="text-sm font-bold">{rank.point.toLocaleString()}</span>
                  </motion.div>
                ))}
              </div>

              {/* Prize table */}
              <h3 className="mb-2 mt-6 text-sm font-medium text-gray-400">Prizes</h3>
              <div className="space-y-1">
                {tournament.lstBenefitData.map((b) => (
                  <div key={b.benefitId} className="flex items-center justify-between rounded-lg bg-[#16213e] p-3 text-sm">
                    <span className="text-gray-300">
                      Rank {b.rankingRangeStart}
                      {b.rankingRangeEnd > b.rankingRangeStart ? `–${b.rankingRangeEnd}` : ''}
                    </span>
                    <span className="font-bold text-yellow-400">
                      {getPrizeLabel(b.prizeType)} {formatCurrency(b.prizeMoney)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'previous' && (
        <div className="p-4">
          {history.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No previous tournaments</div>
          ) : (
            <div className="space-y-4">
              {history.map((h) => (
                <div key={h.seq} className="rounded-xl bg-[#16213e] p-4">
                  <p className="mb-1 text-sm font-bold">Tournament #{h.tournamentData.tournamentId}</p>
                  <p className="mb-2 text-xs text-gray-400">
                    {new Date(h.tournamentData.startDate).toLocaleDateString()} – {new Date(h.tournamentData.endDate).toLocaleDateString()}
                  </p>
                  {h.tournamentData.currentUserData && (
                    <div className="flex justify-between text-sm">
                      <span>Rank: #{h.tournamentData.currentUserData.rankingData.rank}</span>
                      <span>Points: {h.tournamentData.currentUserData.rankingData.point.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
