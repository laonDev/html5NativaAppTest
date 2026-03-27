import { useEffect, useRef, useState, useCallback } from 'react';
import {
  AssetManager,
  SkeletonRenderer,
  AtlasAttachmentLoader,
  SkeletonJson,
  Skeleton,
  AnimationState,
  AnimationStateData,
  Vector2,
} from '@esotericsoftware/spine-canvas';

// Physics enum: none=0, reset=1, update=2, pose=3
const PHYSICS_UPDATE = 2;

// ── Types ─────────────────────────────────────────────────────────────────────
interface SpineItem {
  name: string;
  json: string;
  atlas: string;
}

interface PlaybackState {
  animations: string[];
  currentAnim: string;
  isPlaying: boolean;
  loop: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function SpineToolPage() {
  const [items, setItems] = useState<SpineItem[]>([]);
  const [selected, setSelected] = useState<SpineItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scale, setScale] = useState(1);
  const [playback, setPlayback] = useState<PlaybackState | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const skeletonRef = useRef<Skeleton | null>(null);
  const stateRef = useRef<AnimationState | null>(null);
  const isPlayingRef = useRef(true);
  const scaleRef = useRef(1);

  // ── Fetch manifest ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/_spine/manifest')
      .then((r) => r.json())
      .then((data: { items: SpineItem[] }) => setItems(data.items))
      .catch(() => setItems([]));
  }, []);

  // ── Keep refs in sync ───────────────────────────────────────────────────────
  useEffect(() => { scaleRef.current = scale; }, [scale]);

  // ── Load & render spine animation ───────────────────────────────────────────
  const loadSpine = useCallback(async (item: SpineItem) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Cleanup previous
    cancelAnimationFrame(rafRef.current);
    skeletonRef.current = null;
    stateRef.current = null;

    setLoading(true);
    setError('');
    setPlayback(null);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      const assetManager = new AssetManager('');
      assetManager.loadTextureAtlas(item.atlas);
      assetManager.loadJson(item.json);

      // Poll until loaded
      await new Promise<void>((resolve, reject) => {
        let tries = 0;
        const poll = () => {
          if (assetManager.isLoadingComplete()) {
            if (assetManager.hasErrors()) {
              reject(new Error(JSON.stringify(assetManager.getErrors())));
            } else {
              resolve();
            }
          } else if (++tries > 200) {
            reject(new Error('Asset load timeout'));
          } else {
            setTimeout(poll, 50);
          }
        };
        poll();
      });

      // Build skeleton
      const atlas = assetManager.require(item.atlas);
      const loader = new AtlasAttachmentLoader(atlas);
      const json = new SkeletonJson(loader);
      const skeletonData = json.readSkeletonData(assetManager.require(item.json));

      const skeleton = new Skeleton(skeletonData);
      skeleton.setToSetupPose();
      skeleton.updateWorldTransform(PHYSICS_UPDATE as never);

      const stateData = new AnimationStateData(skeletonData);
      const animState = new AnimationState(stateData);

      const animNames = skeletonData.animations.map((a) => a.name);
      const firstAnim = animNames[0] ?? '';
      if (firstAnim) animState.setAnimation(0, firstAnim, true);

      skeletonRef.current = skeleton;
      stateRef.current = animState;

      setPlayback({ animations: animNames, currentAnim: firstAnim, isPlaying: true, loop: true });
      isPlayingRef.current = true;

      // ── Compute bounds for centering ────────────────────────────────────────
      const offset = new Vector2();
      const size = new Vector2();
      skeleton.getBounds(offset, size, []);

      const renderer = new SkeletonRenderer(ctx);

      let lastTime = performance.now();

      const render = (now: number) => {
        const delta = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        if (isPlayingRef.current && stateRef.current && skeletonRef.current) {
          stateRef.current.update(delta);
          stateRef.current.apply(skeletonRef.current);
          skeletonRef.current.updateWorldTransform(PHYSICS_UPDATE as never);
        }

        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);

        if (skeletonRef.current) {
          const sx = size.x > 0 ? (W / size.x) * 0.8 * scaleRef.current : scaleRef.current;
          const sy = size.y > 0 ? (H / size.y) * 0.8 * scaleRef.current : scaleRef.current;
          const s = Math.min(sx, sy);

          const cx = offset.x + size.x / 2;
          const cy = offset.y + size.y / 2;

          ctx.save();
          ctx.translate(W / 2, H / 2);
          ctx.scale(s, -s); // flip Y: Spine is Y-up, Canvas is Y-down
          ctx.translate(-cx, -cy);
          renderer.draw(skeletonRef.current);
          ctx.restore();
        }

        rafRef.current = requestAnimationFrame(render);
      };

      rafRef.current = requestAnimationFrame(render);
      setLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load spine asset');
      setLoading(false);
    }
  }, []);

  // ── Select handler ──────────────────────────────────────────────────────────
  const handleSelect = (item: SpineItem) => {
    setSelected(item);
    loadSpine(item);
  };

  // ── Playback controls ───────────────────────────────────────────────────────
  const togglePlay = () => {
    isPlayingRef.current = !isPlayingRef.current;
    setPlayback((p) => p ? { ...p, isPlaying: isPlayingRef.current } : p);
  };

  const changeAnimation = (name: string) => {
    if (!stateRef.current || !playback) return;
    stateRef.current.setAnimation(0, name, playback.loop);
    setPlayback((p) => p ? { ...p, currentAnim: name } : p);
  };

  const toggleLoop = () => {
    if (!stateRef.current || !playback) return;
    const next = !playback.loop;
    stateRef.current.setAnimation(0, playback.currentAnim, next);
    setPlayback((p) => p ? { ...p, loop: next } : p);
  };

  // Cleanup on unmount
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0d0b1a] text-white">

      {/* ── Sidebar: list ── */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-[#110f20]">
        <div className="border-b border-white/10 px-4 py-3">
          <h1 className="text-sm font-bold tracking-widest text-[#00c8ff]">SPINE VIEWER</h1>
          <p className="mt-0.5 text-[10px] text-gray-500">
            {items.length} asset{items.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-6 text-xs text-gray-600">
              <p className="font-semibold text-gray-500">No spine assets found.</p>
              <p className="mt-2 leading-relaxed">
                Add folders to:<br />
                <code className="text-[10px] text-purple-400">
                  public/assets/spine/&#123;name&#125;/
                </code>
              </p>
              <p className="mt-2 leading-relaxed text-[10px]">
                Each folder needs:<br />
                <code className="text-[10px] text-gray-400">skeleton.json</code><br />
                <code className="text-[10px] text-gray-400">skeleton.atlas</code><br />
                <code className="text-[10px] text-gray-400">skeleton.png</code>
              </p>
            </div>
          ) : (
            <ul className="py-2">
              {items.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => handleSelect(item)}
                    className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                      selected?.name === item.name
                        ? 'bg-[#00c8ff]/10 text-[#00c8ff]'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {/* Icon dot */}
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        selected?.name === item.name ? 'bg-[#00c8ff]' : 'bg-gray-600'
                      }`}
                    />
                    <span className="truncate font-mono text-xs">{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* ── Main: viewer ── */}
      <main className="relative flex flex-1 flex-col overflow-hidden">

        {/* Canvas area */}
        <div className="relative flex-1 overflow-hidden bg-[#08061a]">

          {/* Checkerboard bg */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'repeating-conic-gradient(#1a1830 0% 25%, #0d0b1a 0% 50%)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="absolute inset-0 m-auto h-full w-full"
            style={{ display: 'block' }}
          />

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00c8ff] border-t-transparent" />
                <span className="text-xs text-gray-400">Loading spine asset…</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="max-w-sm rounded-lg bg-red-900/40 px-5 py-4 text-center ring-1 ring-red-500/40">
                <p className="text-sm font-semibold text-red-400">Load Error</p>
                <p className="mt-1 text-xs text-red-300/70 break-all">{error}</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!selected && !loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-gray-600">← 좌측에서 애니메이션을 선택하세요</p>
            </div>
          )}
        </div>

        {/* Controls bar */}
        {playback && (
          <div className="flex shrink-0 flex-wrap items-center gap-4 border-t border-white/10 bg-[#110f20] px-5 py-3">

            {/* Animation selector */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                Anim
              </label>
              <select
                value={playback.currentAnim}
                onChange={(e) => changeAnimation(e.target.value)}
                className="rounded bg-white/10 px-2 py-1 text-xs text-white outline-none"
              >
                {playback.animations.map((a) => (
                  <option key={a} value={a} className="bg-[#110f20]">{a}</option>
                ))}
              </select>
            </div>

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="flex h-7 w-7 items-center justify-center rounded bg-white/10 text-white hover:bg-white/20"
            >
              {playback.isPlaying ? (
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
                  <rect x="3" y="2" width="3.5" height="12" rx="1" />
                  <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
                  <path d="M4 2.5l9 5.5-9 5.5V2.5z" />
                </svg>
              )}
            </button>

            {/* Loop toggle */}
            <button
              onClick={toggleLoop}
              className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                playback.loop
                  ? 'bg-[#00c8ff]/20 text-[#00c8ff]'
                  : 'bg-white/5 text-gray-500'
              }`}
            >
              Loop
            </button>

            {/* Scale */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                Scale
              </label>
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-28 accent-[#00c8ff]"
              />
              <span className="w-10 text-right text-xs text-gray-400">{scale.toFixed(2)}x</span>
            </div>

            {/* Asset path */}
            <span className="ml-auto text-[10px] text-gray-600 truncate max-w-xs">
              {selected?.json}
            </span>
          </div>
        )}
      </main>
    </div>
  );
}
