import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyApi } from '@/api/rest';
import { formatCurrency } from '@/utils/format';
import type { HistoryItem } from '@/types';
import { Button } from '@/components/ui/Button';

type HistoryTab = 'cash' | 'bonus' | 'viccon' | 'ticket';

export function HistoryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<HistoryTab>('cash');
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async (tab: HistoryTab) => {
    setLoading(true);
    try {
      const now = new Date();
      const params = {
        startDate: new Date(now.getTime() - 30 * 86400000).toISOString(),
        endDate: now.toISOString(),
        page: 1,
        pageSize: 50,
      };

      const api = historyApi[tab];
      const res = await api(params);
      setItems(res.items || []);
    } catch (err) {
      console.error('History error:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(activeTab);
  }, [activeTab]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#16213e] px-4 py-3">
        <Button onClick={() => navigate(-1)} variant="text" size="sm">← Back</Button>
        <h2 className="text-lg font-bold">Earned History</h2>
        <div className="w-12" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {(['cash', 'bonus', 'viccon', 'ticket'] as HistoryTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-xs font-medium capitalize ${
              activeTab === tab ? 'border-b-2 border-[#e94560] text-white' : 'text-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e94560] border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No history found</div>
        ) : (
          <div className="ui-section-stack">
            {items.map((item) => (
              <div key={item.idx} className="flex items-center justify-between rounded-lg bg-[#16213e] p-3">
                <div>
                  <p className="text-sm">{item.description}</p>
                  <p className="text-xs text-gray-500">{new Date(item.date).toLocaleString()}</p>
                </div>
                <span className={`text-sm font-bold ${item.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {item.amount >= 0 ? '+' : ''}{formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
