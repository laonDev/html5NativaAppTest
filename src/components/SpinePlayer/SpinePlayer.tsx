import { useEffect, useRef } from 'react';
import {
  AssetManager,
  SkeletonRenderer,
  AtlasAttachmentLoader,
  SkeletonJson,
  SkeletonBinary,
  AnimationState,
  AnimationStateData,
  Physics,
  TimeKeeper,
  Skeleton,
} from '@esotericsoftware/spine-canvas';

/** public/assets/spine/{name}/ 폴더 기준으로 파일을 로드합니다 */
interface SpinePlayerProps {
  /** public/assets/spine/ 하위 폴더명 ex) "lobby-effect" */
  name: string;
  /** 재생할 애니메이션 이름 */
  animation: string;
  /** 반복 재생 여부 (기본값: true) */
  loop?: boolean;
  /** 스켈레톤 스케일 (기본값: 1) */
  scale?: number;
  /** 캔버스 width (기본값: 400) */
  width?: number;
  /** 캔버스 height (기본값: 400) */
  height?: number;
  /** .skel 바이너리 포맷 사용 여부 (기본값: false → .json 사용) */
  binary?: boolean;
  className?: string;
}

const SPINE_BASE_URL = '/assets/spine';

export function SpinePlayer({
  name,
  animation,
  loop = true,
  scale = 1,
  width = 400,
  height = 400,
  binary = false,
  className,
}: SpinePlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const basePath = `${SPINE_BASE_URL}/${name}/`;
    const skeletonFile = binary ? `${name}.skel` : `${name}.json`;
    const atlasFile = `${name}.atlas`;

    const assetManager = new AssetManager(basePath);
    const timeKeeper = new TimeKeeper();
    const renderer = new SkeletonRenderer(ctx);

    assetManager.loadTextureAtlas(atlasFile);
    if (binary) {
      assetManager.loadBinary(skeletonFile);
    } else {
      assetManager.loadJson(skeletonFile);
    }

    let animationState: AnimationState | null = null;
    let skeleton: Skeleton | null = null;

    function waitForLoad() {
      if (!assetManager.isLoadingComplete()) {
        rafRef.current = requestAnimationFrame(waitForLoad);
        return;
      }

      if (assetManager.hasErrors()) {
        console.error('[SpinePlayer] 로드 실패:', assetManager.getErrors());
        return;
      }

      const atlas = assetManager.require(atlasFile);
      const atlasLoader = new AtlasAttachmentLoader(atlas);

      let skeletonData;
      if (binary) {
        const skeletonBinary = new SkeletonBinary(atlasLoader);
        skeletonBinary.scale = scale;
        skeletonData = skeletonBinary.readSkeletonData(assetManager.require(skeletonFile));
      } else {
        const skeletonJson = new SkeletonJson(atlasLoader);
        skeletonJson.scale = scale;
        skeletonData = skeletonJson.readSkeletonData(assetManager.require(skeletonFile));
      }

      skeleton = new Skeleton(skeletonData);
      // 스켈레톤을 캔버스 하단 중앙에 위치
      skeleton.x = canvas!.width / 2;
      skeleton.y = canvas!.height;
      skeleton.updateWorldTransform(Physics.update);

      const stateData = new AnimationStateData(skeletonData);
      animationState = new AnimationState(stateData);
      animationState.setAnimation(0, animation, loop);

      timeKeeper.update();
      rafRef.current = requestAnimationFrame(renderLoop);
    }

    function renderLoop() {
      if (!ctx || !animationState || !skeleton) return;

      timeKeeper.update();
      const delta = timeKeeper.delta;

      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      animationState.update(delta);
      animationState.apply(skeleton);
      skeleton.updateWorldTransform(Physics.update);

      renderer.draw(skeleton);

      rafRef.current = requestAnimationFrame(renderLoop);
    }

    rafRef.current = requestAnimationFrame(waitForLoad);

    return () => {
      cancelAnimationFrame(rafRef.current);
      assetManager.dispose();
    };
  }, [name, animation, loop, scale, binary]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
    />
  );
}
