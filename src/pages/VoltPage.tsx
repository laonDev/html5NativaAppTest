import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { voltApi } from '@/api/rest';
import { useVoltStore } from '@/stores/voltStore';
import { useUiStatus } from '@/components/Feedback/UiStatusProvider';
import type { VoltReward } from '@/types';

type VoltUiItem = {
  voltType: number;
  name: string;
  icon: string;
  count: number;
};

const VOLT_UI_ORDER: Array<{ voltType: number; name: string; icon: string }> = [
  { voltType: 1, name: 'Victory Volt', icon: '/assets/images/volt/goods/BTN_Goods_05.png' },
  { voltType: 2, name: 'Legend Volt', icon: '/assets/images/volt/goods/BTN_Goods_04.png' },
  { voltType: 3, name: 'Ultra Volt', icon: '/assets/images/volt/goods/BTN_Goods_03.png' },
  { voltType: 4, name: 'Thunder Volt', icon: '/assets/images/volt/goods/BTN_Goods_02.png' },
  { voltType: 5, name: 'Energy Volt', icon: '/assets/images/volt/goods/BTN_Goods_01.png' },
];

const VOLT_LAYOUT_CLASS: Record<number, string> = {
  1: 'row-start-1 col-start-1',
  2: 'row-start-1 col-start-3',
  3: 'row-start-2 col-start-2',
  4: 'row-start-3 col-start-1',
  5: 'row-start-3 col-start-3',
};

export function VoltPage() {
  const navigate = useNavigate();
  const { showToast } = useUiStatus();

  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState<number | null>(null);
  const [openingAll, setOpeningAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rewards, setRewards] = useState<VoltReward[]>([]);
  const [guideOpen, setGuideOpen] = useState(false);

  const voltList = useVoltStore((s) => s.voltList);
  const setVoltList = useVoltStore((s) => s.setVoltList);

  const voltItems = useMemo<VoltUiItem[]>(() => {
    const countMap = new Map<number, number>(voltList.map((v) => [v.voltType, v.count]));
    return VOLT_UI_ORDER.map((item) => ({
      ...item,
      count: countMap.get(item.voltType) ?? 0,
    }));
  }, [voltList]);

  const totalCount = useMemo(
    () => voltItems.reduce((sum, item) => sum + item.count, 0),
    [voltItems]
  );

  useEffect(() => {
    void loadVolts();
  }, []);

  const loadVolts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await voltApi.list();
      setVoltList(res.voltInfo);
    } catch (err) {
      console.error('Volt list error:', err);
      setError('Failed to load volt inventory.');
      showToast('Failed to load volts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async (item: VoltUiItem) => {
    if (item.count <= 0 || opening !== null || openingAll) return;
    setOpening(item.voltType);
    try {
      const res = await voltApi.open(item.voltType);
      setRewards([res.voltReward]);
      await loadVolts();
      showToast(`${item.name} opened`, 'success');
    } catch (err) {
      console.error('Volt open error:', err);
      showToast('Failed to open volt', 'error');
    } finally {
      setOpening(null);
    }
  };

  const handleOpenAll = async () => {
    if (totalCount <= 0 || openingAll || opening !== null) return;
    setOpeningAll(true);
    try {
      const targets = voltItems.filter((item) => item.count > 0);
      const responses = await Promise.all(targets.map((item) => voltApi.openAll(item.voltType)));
      const allRewards = responses.flatMap((res) => res.voltRewards);
      setRewards(allRewards);
      await loadVolts();
      showToast('All volts opened', 'success');
    } catch (err) {
      console.error('Volt open all error:', err);
      showToast('Failed to open all volts', 'error');
    } finally {
      setOpeningAll(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1ba5ff] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-sm text-gray-200">{error}</p>
        <button
          type="button"
          onClick={loadVolts}
          className="rounded-md bg-[#2f7bff] px-4 py-2 text-sm font-semibold text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden bg-[#070b2b] text-white">
      <img
        src="/assets/images/volt/bg/IMG_Bg.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-95"
      />
      <img
        src="/assets/images/volt/bg/IMG_Bg_Ceiling.png"
        alt=""
        className="pointer-events-none absolute left-1/2 top-0 w-full max-w-[580px] -translate-x-1/2 object-cover"
      />
      <img
        src="/assets/images/volt/bg/IMG_Bg_Floor.png"
        alt=""
        className="pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[580px] -translate-x-1/2 object-cover"
      />

      <div className="relative z-10 flex h-full flex-col px-5 pb-6 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <button type="button" onClick={() => setGuideOpen(true)} className="h-10 w-10">
            <img
              src="/assets/images/volt/ui/IMG_Information_Purple_Neon.png"
              alt="Guide"
              className="h-full w-full object-contain"
            />
          </button>

          <img
            src="/assets/images/volt/ui/IMG_Secondary_Title.png"
            alt="Volt"
            className="h-[80px] w-[220px] object-contain"
          />

          <button type="button" onClick={() => navigate(-1)} className="h-10 w-10">
            <img
              src="/assets/images/volt/ui/IMG_Close_Circle.png"
              alt="Close"
              className="h-full w-full object-contain"
            />
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="-translate-y-[40px] mt-1 flex w-full justify-center">
            <div className="grid w-full max-w-[342px] grid-cols-3 grid-rows-3 place-items-center gap-y-5">
              {voltItems.map((item) => (
                <button
                  key={item.voltType}
                  type="button"
                  onClick={() => handleOpen(item)}
                  disabled={item.count <= 0 || opening !== null || openingAll}
                  className={`${VOLT_LAYOUT_CLASS[item.voltType]} relative h-[108px] w-[108px] transition-transform duration-150 active:scale-95 disabled:opacity-65`}
                >
                  <img
                    src="/assets/images/volt/goods/IMG_Goods_Frame.png"
                    alt=""
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="absolute left-1/2 top-1/2 h-[76px] w-[76px] -translate-x-1/2 -translate-y-1/2 object-contain"
                  />
                  <span className="absolute right-0 top-1 rounded-full bg-[#ff2b34] px-2 py-0.5 text-[13px] font-bold leading-none text-white shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                  {opening === item.voltType && (
                    <span className="absolute inset-0 rounded-full bg-black/40 text-[12px] font-semibold">OPENING...</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleOpenAll}
              disabled={totalCount <= 0 || openingAll || opening !== null}
              className="relative h-[52px] w-[248px] transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              <img
                src="/assets/images/volt/ui/BTN_Orangebutton.png"
                alt=""
                className="absolute inset-0 h-full w-full object-fill"
              />
              <span className="absolute inset-0 flex items-center justify-center text-[17px] font-black uppercase tracking-wide text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                Open All Volts({totalCount.toString().padStart(2, '0')})
              </span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {guideOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/55 p-4"
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className="relative mx-auto flex h-full max-h-[86vh] w-full max-w-[360px] flex-col overflow-hidden rounded-xl border border-[#3c74ff] bg-[#0d1a59]"
            >
              <button
                type="button"
                onClick={() => setGuideOpen(false)}
                className="absolute right-3 top-3 z-10 h-8 w-8"
              >
                <img
                  src="/assets/images/volt/ui/IMG_Close_Circle.png"
                  alt="Close"
                  className="h-full w-full object-contain"
                />
              </button>

              <div className="border-b border-[#3a5fc0] px-4 py-4 text-center text-3xl font-black tracking-wide text-[#d9ecff]">
                GUIDE
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                <div className="rounded-lg border border-[#3f78ff] bg-[#070a3e] p-2">
                  <img
                    src="/assets/images/volt/guide/IMG_Volt_Banner.png"
                    alt="Volt guide visual"
                    className="w-full rounded object-contain"
                  />
                </div>

                <div className="space-y-3 text-sm leading-[1.4] text-[#edf6ff]">
                  <div>
                    <p className="mb-1 text-[#4cff9b]">How to Earn the VOLT</p>
                    <p>There are five different types of VOLTS.</p>
                    <p>By wagering in casino games and completing daily missions, you can acquire VOLTS.</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[#4cff9b]">How to Use the VOLT</p>
                    <p>Open VOLTS to earn COINS and VICCONS.</p>
                    <p>VICCON can be exchanged to cash by using tickets.</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[#4cff9b]">Types of VOLT</p>
                    <p>The reward increases as the VOLT tier goes up.</p>
                  </div>
                </div>

                <img
                  src="/assets/images/volt/guide/IMG_Guide_Table.png"
                  alt="Volt reward table"
                  className="w-full rounded object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rewards.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setRewards([])}
          >
            <motion.div
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              className="w-full max-w-[320px] rounded-xl border border-[#3d7cff] bg-[#08164e] p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-3 text-center text-2xl font-black text-[#d9ecff]">VOLT REWARD</h3>
              <div className="space-y-2">
                {rewards.map((r, idx) => (
                  <div key={`${r.voltType}-${idx}`} className="rounded-lg bg-[#112872] px-3 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[#a8d0ff]">VICCON</span>
                      <span className="font-bold text-[#79ff9e]">+{(r.vicconReward / 1000).toFixed(2)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[#a8d0ff]">COIN</span>
                      <span className="font-bold text-[#ffd96a]">+{r.coinReward}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setRewards([])}
                className="mt-4 w-full rounded-lg bg-[#2f7bff] py-2.5 text-base font-bold text-white"
              >
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
