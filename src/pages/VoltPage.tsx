import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { voltApi } from '@/api/rest';
import { useVoltStore } from '@/stores/voltStore';
import { useBalanceStore } from '@/stores/balanceStore';
import { VOLT_NAMES, VOLT_COLORS } from '@/types';
import type { VoltReward } from '@/types';
import { Button } from '@/components/ui/Button';

export function VoltPage() {
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState<number | null>(null);
  const [rewards, setRewards] = useState<VoltReward[]>([]);

  const voltList = useVoltStore((s) => s.voltList);
  const setVoltList = useVoltStore((s) => s.setVoltList);
  const setCoinData = useBalanceStore((s) => s.setCoinData);

  useEffect(() => {
    loadVolts();
  }, []);

  const loadVolts = async () => {
    try {
      const res = await voltApi.list();
      setVoltList(res.voltInfo);
    } catch (err) {
      console.error('Volt list error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async (voltType: number) => {
    setOpening(voltType);
    try {
      const res = await voltApi.open(voltType);
      setRewards([res.voltReward]);
      await loadVolts();
    } catch (err) {
      console.error('Volt open error:', err);
    } finally {
      setOpening(null);
    }
  };

  const handleOpenAll = async (voltType: number) => {
    setOpening(voltType);
    try {
      const res = await voltApi.openAll(voltType);
      setRewards(res.voltRewards);
      await loadVolts();
    } catch (err) {
      console.error('Volt open all error:', err);
    } finally {
      setOpening(null);
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e94560] border-t-transparent" /></div>;
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <h2 className="mb-4 text-lg font-bold">Volt Inventory</h2>

      {/* Volt Grid */}
      <div className="grid grid-cols-2 gap-3">
        {voltList.map((volt) => (
          <motion.div
            key={volt.voltType}
            whileHover={{ scale: 1.02 }}
            className="rounded-xl bg-[#16213e] p-4"
          >
            <div
              className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: VOLT_COLORS[volt.voltType] + '30' }}
            >
              <span className="text-2xl" style={{ color: VOLT_COLORS[volt.voltType] }}>⚡</span>
            </div>
            <p className="mb-1 text-center text-sm font-bold" style={{ color: VOLT_COLORS[volt.voltType] }}>
              {VOLT_NAMES[volt.voltType]}
            </p>
            <p className="mb-3 text-center text-xs text-gray-400">x{volt.count}</p>

            {volt.count > 0 && (
              <div className="space-y-1">
                <Button
                  onClick={() => handleOpen(volt.voltType)}
                  disabled={opening !== null}
                  loading={opening === volt.voltType}
                  variant="secondary"
                  size="sm"
                  fullWidth
                >
                  Open 1
                </Button>
                {volt.count > 1 && (
                  <Button
                    onClick={() => handleOpenAll(volt.voltType)}
                    disabled={opening !== null}
                    loading={opening === volt.voltType}
                    variant="secondary"
                    size="sm"
                    fullWidth
                    style={{ backgroundColor: VOLT_COLORS[volt.voltType] + '40' }}
                  >
                    Open All
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {voltList.length === 0 && (
        <div className="py-12 text-center text-gray-500">No volts available</div>
      )}

      {/* Reward popup */}
      <AnimatePresence>
        {rewards.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setRewards([])}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mx-4 w-full max-w-sm rounded-2xl bg-[#16213e] p-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-4 text-lg font-bold">Rewards!</h3>
              <div className="space-y-2">
                {rewards.map((r, i) => (
                  <div key={i} className="rounded-lg bg-[#1a1a2e] p-3">
                    {r.vicconReward > 0 && (
                      <p className="text-purple-400">Viccon: +{(r.vicconReward / 1000).toFixed(2)}</p>
                    )}
                    {r.coinReward > 0 && (
                      <p className="text-yellow-400">Bingo Coin: +{r.coinReward}</p>
                    )}
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setRewards([])}
                className="mt-4"
                variant="primary"
                size="lg"
                fullWidth
              >
                OK
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
