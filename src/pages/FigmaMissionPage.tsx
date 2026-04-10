/**
 * FigmaMissionPage
 * Figma 디자인(node-id=2:1386, 1093px 기준)을 픽셀 좌표 그대로 렌더링합니다.
 * scale = window.innerWidth / 1093 으로 화면 너비에 맞게 등비 축소됩니다.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { missionApi } from '@/api/rest';
import { mockDailyMissions } from '@/api/mock/mockData';
import { useMissionStore } from '@/stores/missionStore';
import { MISSION_STATUS } from '@/types';
import type { DailyMissionInfo } from '@/types';

const M = '/assets/images/mission';

/** Figma 원본 캔버스 크기 */
const DW = 1093;  // design width
const DH = 2220;  // design height (cards 5장 + 하단 여백)

/** mission type → 굿즈 아이콘 */
const GOODS: Record<number, string> = {
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
export function FigmaMissionPage() {
  const navigate = useNavigate();
  const [scale,      setScale]      = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [collecting, setCollecting] = useState<number | null>(null);

  const missions      = useMissionStore((s) => s.missions);
  const endDate       = useMissionStore((s) => s.endDate);
  const overallStatus = useMissionStore((s) => s.overallStatus);
  const setMissions   = useMissionStore((s) => s.setMissions);
  const { days, hours, minutes, seconds } = useCountdownParts(endDate);

  useEffect(() => {
    setScale(window.innerWidth / DW);
    load();
  }, []);

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
    finally   { setCollecting(null); }
  };

  const handleComplete = async () => {
    setCollecting(-2);
    try { await missionApi.complete(); await load(); }
    catch (e) { console.error(e); }
    finally   { setCollecting(null); }
  };

  const collectedCount = missions.filter((m) => m.status === MISSION_STATUS.COLLECTED).length;
  const allCollected   = collectedCount === missions.length && missions.length > 0;
  const gaugePercent   = missions.length > 0 ? (collectedCount / missions.length) * 100 : 0;
  const totalHours     = hours + days * 24;
  const allDone        = overallStatus === 3;

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', background: '#060520' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #00c8ff', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  return (
    /* 외부: 전체 화면, 세로 스크롤 */
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', background: '#060520', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'scroll', overflowX: 'hidden' }}>

        {/* 스크롤 공간 확보 (scale 적용 후 실제 렌더 높이) */}
        <div style={{ height: DH * scale, position: 'relative' }}>

          {/* scale 변환된 Figma 캔버스 */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0,
            width: DW,
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
          }}>

            {/* ── 배경 (image 1 / Bg 1): left=-794 top=-87 w=2667 h=2334 ── */}
            <div style={{ position: 'absolute', left: -794, top: -87, width: 2667, height: 2334, pointerEvents: 'none', zIndex: 0 }}>
              <img src={`${M}/dm_bg_image.png`} alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <img src={`${M}/dm_bg_overlay.png`} alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* ── Figma 캔버스 본체 ── */}
            <div style={{ position: 'relative', width: DW, height: DH, zIndex: 1 }}>

              {/* ── 타이틀 그룹 (4:1792): left=-102 top=-130 w=1341 h=519 ── */}
              <div style={{ position: 'absolute', left: -102, top: -130, width: 1341, height: 519, pointerEvents: 'none' }}>
                {/* Title_Ef 1 */}
                <img src={`${M}/dm_title_ef.png`} alt=""
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                {/* Title 1: left=229 top=98 w=826 h=323 */}
                <div style={{ position: 'absolute', left: 229, top: 98, width: 826, height: 323 }}>
                  <img src={`${M}/dm_title.png`} alt="Daily Mission"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>

              {/* ── Lightning Ef: left=-19 top=33 w=1112 h=1093 ── */}
              <div style={{ position: 'absolute', left: -19, top: 33, width: 1112, height: 1093, pointerEvents: 'none' }}>
                <img src={`${M}/dm_lightning_ef.png`} alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* ── 헤더 버튼 그룹 (4:1791): 그룹 left=-19 top=32 ── */}
              {/* Bold_information: 그룹내 left=46 top=0 → 프레임 left=27 top=32 */}
              <button
                style={{ position: 'absolute', left: 27, top: 32, width: 97, height: 97, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <img src={`${M}/dm_icon_info.png`} alt="Info"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
              {/* Bold_Close: 그룹내 left=982 top=1 → 프레임 left=963 top=33 */}
              <button
                onClick={() => navigate(-1)}
                style={{ position: 'absolute', left: 963, top: 33, width: 97, height: 97, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <img src={`${M}/dm_icon_close.png`} alt="Close"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>

              {/* ── 상단 패널 그룹 (2:1789): left=0 top=240 w=1093 h=680 ── */}
              <div style={{ position: 'absolute', left: 0, top: 240, width: 1093, height: 680 }}>

                {/* Top 1 배경 */}
                <img src={`${M}/dm_top.png`} alt=""
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />

                {/* coin_goods 1: left=41 top=27 w=998 h=626 */}
                <img src={`${M}/dm_coin_goods.png`} alt=""
                  style={{ position: 'absolute', left: 41, top: 27, width: 998, height: 626, objectFit: 'cover', pointerEvents: 'none' }} />

                {/* Check_small 1~4: top=209 h=90 w=73, x=233,367,503,643 */}
                {([233, 367, 503, 643] as const).map((x, i) => {
                  const m    = missions[i];
                  const done  = m?.status === MISSION_STATUS.COLLECTED;
                  const ready = m?.status === MISSION_STATUS.ACHIEVED;
                  return (
                    <div key={i} style={{ position: 'absolute', left: x, top: 209, width: 73, height: 90 }}>
                      <img src={`${M}/dm_check_small.png`} alt=""
                        style={{
                          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                          filter: done  ? 'drop-shadow(0 0 8px rgba(0,255,120,0.9))'
                                : ready ? 'drop-shadow(0 0 8px rgba(255,220,0,0.9))'
                                : 'brightness(0.45)',
                        }} />
                      {done && (
                        <img src={`${M}/dm_check_mini.png`} alt=""
                          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 40, objectFit: 'contain' }} />
                      )}
                      {ready && (
                        <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#ffe040', fontSize: 30, fontWeight: 900, textShadow: '0 0 8px rgba(255,200,0,0.9)' }}>!</span>
                      )}
                    </div>
                  );
                })}

                {/* Mission_Gauge 1: left=111 top=304 w=813 h=90 */}
                <div style={{ position: 'absolute', left: 111, top: 304, width: 813, height: 90, overflow: 'hidden' }}>
                  <img src={`${M}/dm_gauge_mask.png`} alt=""
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill' }} />
                  {gaugePercent > 0 && (
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${gaugePercent}%`, overflow: 'hidden', transition: 'width 0.7s ease' }}>
                      <img src={`${M}/dm_gauge_green.png`} alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'fill' }} />
                    </div>
                  )}
                  {missions.length > 1 && missions.slice(0, -1).map((_, i) => (
                    <img key={i} src={`${M}/dm_gauge_section.png`} alt=""
                      style={{ position: 'absolute', top: 0, height: '100%', width: 'auto', left: `${((i + 1) / missions.length) * 100}%`, transform: 'translateX(-50%)' }} />
                  ))}
                </div>

                {/* Check_big 1: left=837 top=99 w=93 h=110 (수집 완료 시) */}
                {allCollected && (
                  <img src={`${M}/dm_check_big.png`} alt=""
                    style={{ position: 'absolute', left: 837, top: 99, width: 93, height: 110, objectFit: 'cover' }} />
                )}

                {/* bg_status 1: left=790 top=206 w=192 h=192 */}
                <img src={`${M}/dm_bg_status_circle.png`} alt=""
                  style={{ position: 'absolute', left: 790, top: 206, width: 192, height: 192, objectFit: 'cover', pointerEvents: 'none' }} />

                {/* BTN_Goods_05 3 (보상 아이콘): left=815 top=225 w=144 h=155 */}
                <img src={`${M}/dm_btn_goods_05.png`} alt=""
                  style={{
                    position: 'absolute', left: 815, top: 225, width: 144, height: 155, objectFit: 'cover', pointerEvents: 'none',
                    filter: allCollected
                      ? 'drop-shadow(0 0 12px rgba(255,200,40,1)) brightness(1.2)'
                      : 'brightness(0.35) grayscale(0.5)',
                  }} />

                {/* BTN_Collect 1 / 완료 텍스트: left=356 top=352 w=368 h=207 */}
                {allDone ? (
                  <div style={{ position: 'absolute', left: 356, top: 352, width: 368, height: 207, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,200,80,0.15)', border: '2px solid rgba(0,200,80,0.4)', borderRadius: 50, padding: '10px 26px' }}>
                      <img src={`${M}/dm_check.png`} alt="" style={{ width: 24, objectFit: 'contain' }} />
                      <span style={{ color: '#44ee88', fontSize: 28, fontWeight: 900, letterSpacing: '0.1em' }}>ALL DONE!</span>
                    </div>
                  </div>
                ) : allCollected ? (
                  <motion.button whileTap={{ scale: 0.95 }}
                    onClick={handleComplete}
                    disabled={collecting === -2}
                    style={{ position: 'absolute', left: 356, top: 352, width: 368, height: 207, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <img src={`${M}/dm_btn_collect.png`} alt="Collect"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: collecting === -2 ? 0.6 : 1 }} />
                  </motion.button>
                ) : (
                  <div style={{ position: 'absolute', left: 356, top: 395, width: 368, textAlign: 'center' }}>
                    <span style={{ color: 'rgba(160,190,255,0.6)', fontSize: 22 }}>
                      Complete all missions to earn free Volt!
                    </span>
                  </div>
                )}
              </div>{/* end top panel */}

              {/* ── 타이머 그룹 (2:1790): left=260 top=833 w=555 h=84 ── */}
              <div style={{ position: 'absolute', left: 260, top: 833, width: 555, height: 84 }}>
                <img src={`${M}/dm_timer_box.png`} alt=""
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill' }} />
                {allDone ? (
                  /* Txt_all_done: left=194 top=20 w=199 h=43 */
                  <img src={`${M}/dm_txt_all_done.png`} alt="All Done"
                    style={{ position: 'absolute', left: 194, top: 20, width: 199, height: 43, objectFit: 'contain' }} />
                ) : (
                  <>
                    {/* Icon_Clock: left=145 top=15 w=53 h=53 */}
                    <img src={`${M}/dm_icon_clock.png`} alt=""
                      style={{ position: 'absolute', left: 145, top: 15, width: 53, height: 53, objectFit: 'cover' }} />
                    <span style={{
                      position: 'absolute', left: 210, top: 22,
                      color: '#ffe040', fontSize: 30, fontWeight: 900,
                      fontFamily: 'monospace', letterSpacing: '0.04em',
                      textShadow: '0 0 10px rgba(255,200,0,0.9)',
                    }}>
                      {String(totalHours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </span>
                  </>
                )}
              </div>

              {/* ── 미션 카드 목록 (4:1793): left=16 top=969 w=1047 gap=17 ── */}
              <div style={{ position: 'absolute', left: 16, top: 969, width: 1047, display: 'flex', flexDirection: 'column', gap: 17 }}>
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
              </div>

            </div>{/* end Figma canvas */}
          </div>{/* end scale wrapper */}
        </div>{/* end scroll spacer */}
      </div>{/* end scroll container */}
    </div>
  );
}

// ── MissionCard ───────────────────────────────────────────────────────────────
// Figma: 각 카드 w=1047 h=212
function MissionCard({
  mission, index, collecting, onCollect, onNavigate,
}: {
  mission: DailyMissionInfo;
  index: number;
  collecting: number | null;
  onCollect: (idx: number) => void;
  onNavigate: ReturnType<typeof useNavigate>;
}) {
  const progress  = mission.maxValue > 0 ? Math.min((mission.minValue / mission.maxValue) * 100, 100) : 0;
  const collected = mission.status === MISSION_STATUS.COLLECTED;
  const achieved  = mission.status === MISSION_STATUS.ACHIEVED;
  const goodsIcon = GOODS[mission.missionType] ?? `${M}/dm_btn_goods_03.png`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{ position: 'relative', width: 1047, height: 212, flexShrink: 0 }}
    >
      {/* bar_mission 배경 */}
      <img src={`${M}/dm_bar_mission.png`} alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />

      {/* bg_mission (아이콘 배경): left=61 top=16 size=180 */}
      <div style={{ position: 'absolute', left: 61, top: 16, width: 180, height: 180 }}>
        <img src={`${M}/dm_bg_mission.png`} alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* 굿즈 아이콘: bg_mission 위에 centered */}
      <div style={{ position: 'absolute', left: 61, top: 16, width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={goodsIcon} alt=""
          style={{ width: 140, height: 'auto', objectFit: 'contain' }} />
      </div>

      {/* 미션 이름: left=295 top=65 w=446 h=46 fontSize=39 */}
      <p style={{
        position: 'absolute', left: 295, top: 65, width: 446, height: 46,
        margin: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        color: 'white', fontSize: 36, fontWeight: 900, fontStyle: 'normal',
        textShadow: '0px 0px 8.7px rgba(128,164,255,0.25)',
        lineHeight: '46px',
      }}>
        {mission.name}
      </p>

      {/* 미션 설명: left=295 top=111 w=446 h=46 fontSize=32 */}
      <p style={{
        position: 'absolute', left: 295, top: 111, width: 446, height: 46,
        margin: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        color: 'rgba(160,190,255,0.85)', fontSize: 28, fontWeight: 700,
        lineHeight: '46px',
      }}>
        {mission.content}
      </p>

      {/* 진행도 게이지: left=785 top=40 w=232 h=54 */}
      <div style={{ position: 'absolute', left: 785, top: 40, width: 232, height: 54, overflow: 'hidden', borderRadius: 27 }}>
        <img src={`${M}/dm_gauge_mask.png`} alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill' }} />
        {progress > 0 && (
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${progress}%`, overflow: 'hidden', transition: 'width 0.5s ease' }}>
            <img src={`${M}/dm_gauge_green.png`} alt=""
              style={{ width: '100%', height: '100%', objectFit: 'fill' }} />
          </div>
        )}
      </div>

      {/* 진행도 텍스트: 게이지 아래 */}
      <span style={{
        position: 'absolute', left: 785, top: 100, width: 232, textAlign: 'center',
        color: collected ? '#44ee88' : 'rgba(180,210,255,0.8)',
        fontSize: 22, fontWeight: 700, fontFamily: 'monospace',
      }}>
        {mission.minValue}/{mission.maxValue}
      </span>

      {/* ── 상태 버튼 영역 (우측) ── */}
      {collected ? (
        /* COLLECTED: Box_Complete(left=800,top=36,w=202,h=140) + check + COMPLETE text */
        <>
          <div style={{ position: 'absolute', left: 800, top: 36, width: 202, height: 140 }}>
            <img src={`${M}/dm_box_complete.png`} alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ position: 'absolute', left: 867, top: 56, width: 67, height: 57 }}>
            <img src={`${M}/dm_check_icon.png`} alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ position: 'absolute', left: 826, top: 118, width: 150, height: 36 }}>
            <img src={`${M}/dm_complete_text.png`} alt="COMPLETE"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </>
      ) : achieved ? (
        /* ACHIEVED: BTN_Collect_2 (left=758,top=52,w=285,h=160) */
        <motion.button whileTap={{ scale: 0.93 }}
          onClick={() => onCollect(mission.missionIndex)}
          disabled={collecting !== null}
          style={{ position: 'absolute', left: 758, top: 52, width: 285, height: 160, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <img src={`${M}/dm_btn_collect_2.png`} alt="Collect"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: collecting !== null ? 0.55 : 1 }} />
        </motion.button>
      ) : mission.missionType === 2 ? (
        /* 빙고 미션: BTN_Let's_Go (left=758,top=49,w=285,h=160) */
        <motion.button whileTap={{ scale: 0.93 }}
          onClick={() => onNavigate('/bingo')}
          style={{ position: 'absolute', left: 758, top: 49, width: 285, height: 160, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <img src={`${M}/dm_btn_lets_go.png`} alt="Let's Go"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </motion.button>
      ) : (
        /* 기본: BTN_Good_Luck (left=758,top=52,w=285,h=160) */
        <div style={{ position: 'absolute', left: 758, top: 52, width: 285, height: 160 }}>
          <img src={`${M}/dm_btn_good_luck.png`} alt="Good Luck"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
    </motion.div>
  );
}
