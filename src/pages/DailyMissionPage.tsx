import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { missionApi } from '@/api/rest';
import { mockDailyMissions } from '@/api/mock/mockData';
import { useMissionStore } from '@/stores/missionStore';
import { MISSION_STATUS } from '@/types';
import type { DailyMissionInfo } from '@/types';

const M = '/assets/images/mission';

// Mission type → goods icon
const GOODS_ICON: Record<number, string> = {
  1: `${M}/dm_btn_goods_03.png`,
  2: `${M}/dm_btn_goods_02.png`,
  3: `${M}/dm_btn_goods_04.png`,
  4: `${M}/dm_btn_goods_05.png`,
  5: `${M}/dm_btn_goods_03.png`,
  6: `${M}/dm_btn_goods_02.png`,
  7: `${M}/dm_btn_goods_04.png`,
  8: `${M}/dm_btn_goods_05.png`,
};

// ── Countdown ─────────────────────────────────────────────────────────────────
function useCountdownParts(endTime: string | null) {
  const [p, setP] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    if (!endTime) return;
    const tick = () => {
      const d = Math.max(0, new Date(endTime).getTime() - Date.now());
      setP({
        days:    Math.floor(d / 86400000),
        hours:   Math.floor((d % 86400000) / 3600000),
        minutes: Math.floor((d % 3600000)  / 60000),
        seconds: Math.floor((d % 60000)    / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return p;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function DailyMissionPage() {
  const navigate   = useNavigate();
  const [loading,    setLoading]    = useState(true);
  const [collecting, setCollecting] = useState<number | null>(null);

  const missions      = useMissionStore((s) => s.missions);
  const endDate       = useMissionStore((s) => s.endDate);
  const overallStatus = useMissionStore((s) => s.overallStatus);
  const setMissions   = useMissionStore((s) => s.setMissions);
  const { days, hours, minutes, seconds } = useCountdownParts(endDate);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await missionApi.list();
      setMissions(res.dailyMissionInfos, res.endDate, res.status);
    } catch {
      const m = mockDailyMissions;
      if (m) setMissions(m.dailyMissionInfos, m.endDate, m.status);
    } finally { setLoading(false); }
  };

  const handleCollect = async (idx: number) => {
    setCollecting(idx);
    try { await missionApi.collect(idx); await load(); }
    catch (e) { console.error(e); }
    finally { setCollecting(null); }
  };

  const handleComplete = async () => {
    setCollecting(-2);
    try { await missionApi.complete(); await load(); }
    catch (e) { console.error(e); }
    finally { setCollecting(null); }
  };

  const collectedCount = missions.filter((m) => m.status === MISSION_STATUS.COLLECTED).length;
  const allCollected   = collectedCount === missions.length && missions.length > 0;
  const gaugePercent   = missions.length > 0 ? (collectedCount / missions.length) * 100 : 0;
  const totalHours     = hours + days * 24;
  const allDone        = overallStatus === 3;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: '#060520' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00c8ff] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-y-auto overflow-x-hidden" style={{ background: '#060520' }}>

      {/* ── BACKGROUND ────────────────────────────────────────────────────── */}
      <img
        src={`${M}/dm_bg.jpg`} alt=""
        className="pointer-events-none fixed inset-0 h-full w-full object-cover object-top"
        style={{ zIndex: 0 }}
      />

      {/* ── TITLE GLOW LAYER ─────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute left-0 right-0 top-0" style={{ zIndex: 1, height: '28vw' }}>
        <img src={`${M}/dm_title_ef.png`} alt=""
          className="absolute inset-0 h-full w-full object-fill" />
      </div>

      {/* ── SCROLLABLE CONTENT ───────────────────────────────────────────── */}
      <div className="relative flex flex-col pb-4" style={{ zIndex: 2 }}>

        {/* ── HEADER BUTTONS + TITLE (fixed top area) ─────────────────── */}
        <div className="relative flex items-center justify-between px-3 pt-3 pb-0">
          <button className="h-10 w-10 p-0.5">
            <img src={`${M}/dm_icon_info.png`} alt="Info" className="h-full w-full object-contain" />
          </button>

          {/* TITLE centered between buttons */}
          <div className="pointer-events-none absolute left-0 right-0 flex justify-center">
            <img src={`${M}/dm_title.png`} alt="Daily Mission"
              style={{ width: '55%', objectFit: 'contain' }} />
          </div>

          <button className="h-10 w-10 p-0.5" onClick={() => navigate(-1)}>
            <img src={`${M}/dm_icon_close.png`} alt="Close" className="h-full w-full object-contain" />
          </button>
        </div>

        {/* ── STATUS PANEL ─────────────────────────────────────────────── */}
        {/* dm_top.png is 1093×680, aspect ratio ≈ 1.607 */}
        <div className="relative mx-3">
          <img src={`${M}/dm_top.png`} alt="" className="w-full" style={{ display: 'block' }} />

          {/* Overlay — positions are % of dm_top.png (1093×680) */}
          <div className="absolute inset-0">

            {/* Status label bar: dm_status_bg 이미지에 텍스트 포함됨 */}
            <div className="absolute overflow-hidden"
              style={{ top: '3%', left: '3%', right: '3%', height: '11%' }}>
              <img src={`${M}/dm_status_bg.png`} alt=""
                className="absolute inset-0 h-full w-full object-fill" />
            </div>

            {/* coin_goods background image (covers most of inner area) */}
            <div className="pointer-events-none absolute"
              style={{ top: '14%', left: '3.8%', right: '3.8%', bottom: '2%' }}>
              <img src={`${M}/dm_coin_goods.png`} alt=""
                className="h-full w-full object-fill" />
            </div>

            {/* Check-box row: left=233/1093 to right side, top=209/680 */}
            <div className="absolute flex items-center justify-center"
              style={{ top: '30.7%', left: '20%', right: '22%' }}>
              {missions.map((m) => {
                const done  = m.status === MISSION_STATUS.COLLECTED;
                const ready = m.status === MISSION_STATUS.ACHIEVED;
                return (
                  <div key={m.missionIndex}
                    className="relative flex flex-1 items-center justify-center"
                    style={{ aspectRatio: '1 / 1.15' }}>
                    <img src={`${M}/dm_check_small.png`} alt=""
                      className="absolute inset-0 h-full w-full object-contain"
                      style={{
                        filter: done  ? 'drop-shadow(0 0 5px rgba(0,255,120,0.9))'
                              : ready ? 'drop-shadow(0 0 5px rgba(255,220,0,0.9))'
                              : 'brightness(0.5)',
                      }} />
                    {done && (
                      <img src={`${M}/dm_check_mini.png`} alt=""
                        className="relative z-10 object-contain" style={{ width: '50%' }} />
                    )}
                    {ready && (
                      <span className="relative z-10 text-[14px] font-black"
                        style={{ color: '#ffe040', textShadow: '0 0 6px rgba(255,200,0,0.9)' }}>!</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Gauge track: left=111/1093, top=304/680, w=813/1093, h=90/680 */}
            <div className="absolute"
              style={{ top: '44.7%', left: '10.2%', right: '22%', height: '13.2%' }}>
              <div className="relative h-full overflow-hidden">
                <img src={`${M}/dm_gauge_mask.png`} alt=""
                  className="absolute inset-0 h-full w-full object-fill" />
                {gaugePercent > 0 && (
                  <div className="absolute inset-y-0 left-0 overflow-hidden transition-all duration-700"
                    style={{ width: `${gaugePercent}%` }}>
                    <img src={`${M}/dm_gauge_green.png`} alt=""
                      className="h-full w-full object-fill" />
                  </div>
                )}
                {missions.length > 1 && missions.slice(0, -1).map((_, i) => (
                  <img key={i} src={`${M}/dm_gauge_section.png`} alt=""
                    className="pointer-events-none absolute top-0 h-full w-auto"
                    style={{ left: `${((i + 1) / missions.length) * 100}%`, transform: 'translateX(-50%)' }} />
                ))}
              </div>
            </div>

            {/* Right reward circle: left=790/1093, top=206/680, w=192/1093, h=192/680 */}
            <div className="absolute flex items-center justify-center"
              style={{ top: '30.3%', left: '72.3%', width: '17.6%', aspectRatio: '1' }}>
              <img src={`${M}/dm_bg_status_circle.png`} alt=""
                className="absolute inset-0 h-full w-full object-contain" />
              <img src={`${M}/dm_btn_goods_05.png`} alt=""
                className="relative z-10 object-contain"
                style={{
                  width: '75%',
                  filter: allCollected
                    ? 'drop-shadow(0 0 8px rgba(255,200,40,1)) brightness(1.2)'
                    : 'brightness(0.3) grayscale(0.5)',
                }} />
              {(allDone || allCollected) && (
                <img src={`${M}/dm_check_big.png`} alt=""
                  className="absolute z-20 object-contain"
                  style={{ width: '80%', top: '-15%' }} />
              )}
            </div>

            {/* Collect / All Done button area: centered, bottom area */}
            <div className="absolute flex items-center justify-center"
              style={{ top: '51.8%', left: '22%', width: '45%', height: '30%' }}>
              {allDone ? (
                <div className="flex items-center gap-1.5 rounded-full px-3 py-1"
                  style={{ background: 'rgba(0,200,80,0.15)', border: '1px solid rgba(0,200,80,0.4)' }}>
                  <img src={`${M}/dm_check.png`} alt="" style={{ width: 14, objectFit: 'contain' }} />
                  <span className="text-[11px] font-black tracking-widest text-green-400">ALL DONE!</span>
                </div>
              ) : allCollected ? (
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleComplete}
                  disabled={collecting === -2} className="h-full w-full">
                  <img src={`${M}/dm_btn_collect.png`} alt="Collect"
                    className="h-full w-full object-contain"
                    style={{ opacity: collecting === -2 ? 0.6 : 1 }} />
                </motion.button>
              ) : (
                <span className="text-center text-[9px]" style={{ color: 'rgba(160,190,255,0.65)' }}>
                  Complete all missions to earn free Volt!
                </span>
              )}
            </div>

          </div>
        </div>

        {/* ── TIMER ────────────────────────────────────────────────────── */}
        {/* dm_timer_box.png: 555×84, placed in center */}
        <div className="relative mx-auto mt-2 flex items-center justify-center"
          style={{ width: '54%', height: 42 }}>
          <img src={`${M}/dm_timer_box.png`} alt=""
            className="absolute inset-0 h-full w-full object-fill" />
          {allDone ? (
            <img src={`${M}/dm_txt_all_done.png`} alt="All Done"
              className="relative z-10 h-[55%] object-contain" />
          ) : (
            <div className="relative z-10 flex items-center gap-1.5">
              <img src={`${M}/dm_icon_clock.png`} alt=""
                className="h-4 w-4 object-contain" />
              <span className="font-mono text-sm font-black tracking-wider"
                style={{ color: '#ffe040', textShadow: '0 0 8px rgba(255,200,0,0.8)' }}>
                {String(totalHours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {/* ── MISSION CARDS ─────────────────────────────────────────────── */}
        <div className="mt-2 flex flex-col gap-2 px-3">
          <AnimatePresence>
            {missions.map((mission, idx) => (
              <MissionCard
                key={mission.missionIndex}
                mission={mission}
                index={idx}
                collecting={collecting}
                onCollect={handleCollect}
                onNavigate={navigate}
              />
            ))}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

// ── MissionCard ───────────────────────────────────────────────────────────────
function MissionCard({
  mission, index, collecting, onCollect, onNavigate,
}: {
  mission: DailyMissionInfo;
  index: number;
  collecting: number | null;
  onCollect: (idx: number) => void;
  onNavigate: (path: string) => void;
}) {
  const progress  = mission.maxValue > 0 ? Math.min((mission.minValue / mission.maxValue) * 100, 100) : 0;
  const collected = mission.status === MISSION_STATUS.COLLECTED;
  const goodsIcon = GOODS_ICON[mission.missionType] ?? `${M}/dm_btn_goods_03.png`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="relative"
    >
      {/* dm_bar_mission.png: 1047×212, aspect ratio ≈ 4.94 */}
      <img src={`${M}/dm_bar_mission.png`} alt=""
        className="w-full" style={{ display: 'block' }} />

      {/* Content overlay */}
      <div className="absolute inset-0 flex items-center gap-2 px-[3%]">

        {/* Mission icon: dm_bg_mission.png (180×180) at left ~6% */}
        {/* In Figma: left=61/1047=5.8%, size=180/212=84.9% of card height */}
        <div className="relative shrink-0 flex items-center justify-center"
          style={{ width: '16.5%', aspectRatio: '1' }}>
          <img src={`${M}/dm_bg_mission.png`} alt=""
            className="absolute inset-0 h-full w-full object-contain" />
          <img src={goodsIcon} alt=""
            className="relative z-10 object-contain"
            style={{ width: '88%' }} />
        </div>

        {/* Mission text + gauge */}
        <div className="flex flex-1 flex-col justify-center min-w-0 gap-[2px]">
          <p className="truncate font-black text-white"
            style={{ fontSize: 'clamp(11px, 3.5vw, 15px)', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
            {mission.name}
          </p>
          <p className="truncate" style={{ fontSize: 'clamp(9px, 2.6vw, 12px)', color: 'rgba(160,190,255,0.75)' }}>
            {mission.content}
          </p>
          {/* Progress gauge */}
          <div className="relative mt-1 overflow-hidden rounded-full" style={{ height: 7 }}>
            <img src={`${M}/dm_gauge_mask.png`} alt=""
              className="absolute inset-0 h-full w-full object-fill" />
            {progress > 0 && (
              <div className="absolute inset-y-0 left-0 overflow-hidden transition-all duration-500"
                style={{ width: `${progress}%` }}>
                <img src={`${M}/dm_gauge_green.png`} alt=""
                  className="h-full w-full object-fill" />
              </div>
            )}
          </div>
          <span style={{
            fontSize: 'clamp(8px, 2.2vw, 10px)',
            color: collected ? '#44ee88' : 'rgba(180,210,255,0.8)',
            fontFamily: 'monospace',
            fontWeight: 700,
          }}>
            {mission.minValue}/{mission.maxValue}
          </span>
        </div>

        {/* Action button area: right ~27% of card, from Figma: w=285/1047=27.2% */}
        <div className="shrink-0" style={{ width: '27%' }}>
          <ActionButton
            mission={mission}
            collecting={collecting}
            onCollect={onCollect}
            onNavigate={onNavigate}
          />
        </div>

      </div>
    </motion.div>
  );
}

// ── ActionButton ──────────────────────────────────────────────────────────────
function ActionButton({
  mission, collecting, onCollect, onNavigate,
}: {
  mission: DailyMissionInfo;
  collecting: number | null;
  onCollect: (idx: number) => void;
  onNavigate: (path: string) => void;
}) {
  // COLLECTED → Complete box (dm_box_complete + dm_complete_text + dm_check_icon)
  if (mission.status === MISSION_STATUS.COLLECTED) {
    return (
      <div className="relative flex flex-col items-center justify-center"
        style={{ aspectRatio: '202/140' }}>
        <img src={`${M}/dm_box_complete.png`} alt=""
          className="absolute inset-0 h-full w-full object-contain" />
        <img src={`${M}/dm_check_icon.png`} alt=""
          className="relative z-10 object-contain" style={{ width: '40%' }} />
        <img src={`${M}/dm_complete_text.png`} alt="COMPLETE"
          className="relative z-10 object-contain" style={{ width: '80%', marginTop: '4%' }} />
      </div>
    );
  }

  // ACHIEVED → Collect button (dm_btn_collect_2)
  if (mission.status === MISSION_STATUS.ACHIEVED) {
    return (
      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={() => onCollect(mission.missionIndex)}
        disabled={collecting !== null}
        className="relative flex items-center justify-center w-full"
        style={{ aspectRatio: '285/160' }}
      >
        <img src={`${M}/dm_btn_collect_2.png`} alt="Collect"
          className="absolute inset-0 h-full w-full object-contain"
          style={{ opacity: collecting !== null ? 0.55 : 1 }} />
        {collecting === mission.missionIndex && (
          <span className="relative z-10 text-[11px] font-extrabold text-white">…</span>
        )}
      </motion.button>
    );
  }

  // Bingo mission → Let's Go
  if (mission.missionType === 2) {
    return (
      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={() => onNavigate('/bingo')}
        className="w-full"
        style={{ aspectRatio: '285/160' }}
      >
        <img src={`${M}/dm_btn_lets_go.png`} alt="Let's Go"
          className="h-full w-full object-contain" />
      </motion.button>
    );
  }

  // Default → Good Luck (non-interactive)
  return (
    <div className="w-full" style={{ aspectRatio: '285/160' }}>
      <img src={`${M}/dm_btn_good_luck.png`} alt="Good Luck"
        className="h-full w-full object-contain" />
    </div>
  );
}
