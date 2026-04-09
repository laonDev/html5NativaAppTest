import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BANNER_AUTOPLAY_ENABLED,
  BANNER_AUTOPLAY_INTERVAL_MS,
  BANNER_AUTOPLAY_RESTART_DELAY_MS,
} from '@/constants/ui';

export interface BannerItem {
  key: string;
  imageUrl: string;
  alt: string;
  onClick?: () => void;
}

interface BannerCarouselProps {
  items: BannerItem[];
  className?: string;
  paddingClassName?: string;
  rounded?: boolean;
  autoPlay?: boolean;
  autoPlayIntervalMs?: number;
  itemAspectClass?: string;
}

function joinClassName(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function BannerCarousel({
  items,
  className,
  paddingClassName = 'px-3 pt-2',
  rounded = true,
  autoPlay = BANNER_AUTOPLAY_ENABLED,
  autoPlayIntervalMs = BANNER_AUTOPLAY_INTERVAL_MS,
  itemAspectClass = 'aspect-[358/130]',
}: BannerCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const restartTimerRef = useRef<number | null>(null);

  const count = items.length;

  const canScroll = count > 1;

  const activeIndex = useMemo(() => {
    if (count === 0) return 0;
    if (index < 0) return count - 1;
    if (index >= count) return 0;
    return index;
  }, [count, index]);

  const moveTo = useCallback(
    (nextIndex: number) => {
      if (count === 0) return;
      if (nextIndex < 0) {
        setIndex(count - 1);
        return;
      }
      if (nextIndex >= count) {
        setIndex(0);
        return;
      }
      setIndex(nextIndex);
    },
    [count],
  );

  const pauseAndScheduleResume = useCallback(() => {
    setIsPaused(true);
    if (restartTimerRef.current) {
      window.clearTimeout(restartTimerRef.current);
    }
    restartTimerRef.current = window.setTimeout(() => {
      setIsPaused(false);
      restartTimerRef.current = null;
    }, BANNER_AUTOPLAY_RESTART_DELAY_MS);
  }, []);

  useEffect(() => {
    if (!autoPlay || isPaused || !canScroll) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, autoPlayIntervalMs);
    return () => window.clearInterval(timer);
  }, [autoPlay, autoPlayIntervalMs, canScroll, count, isPaused]);

  useEffect(() => {
    return () => {
      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current);
      }
    };
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={joinClassName(paddingClassName, className)}>
      <div
        className={joinClassName(
          'relative overflow-hidden border border-[#4153a0] bg-[#0e1d4f] shadow-[0_8px_20px_rgba(3,8,24,0.45)]',
          rounded && 'rounded-xl',
        )}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={(event) => {
          touchStartX.current = event.changedTouches[0]?.clientX ?? null;
          pauseAndScheduleResume();
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current == null || !canScroll) return;
          const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
          const deltaX = endX - touchStartX.current;
          touchStartX.current = null;

          if (Math.abs(deltaX) < 40) return;
          if (deltaX < 0) moveTo(activeIndex + 1);
          else moveTo(activeIndex - 1);
        }}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              className={joinClassName('relative block w-full shrink-0 overflow-hidden', itemAspectClass)}
              onClick={() => {
                pauseAndScheduleResume();
                item.onClick?.();
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.alt}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: 'center bottom' }}
                loading="lazy"
              />
            </button>
          ))}
        </div>

        {canScroll && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/35 px-2 py-1">
            {items.map((item, dotIndex) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  pauseAndScheduleResume();
                  moveTo(dotIndex);
                }}
                className={joinClassName(
                  'h-1.5 w-1.5 rounded-full transition-all',
                  dotIndex === activeIndex ? 'w-4 bg-white' : 'bg-white/45',
                )}
                aria-label={`Go to banner ${dotIndex + 1}`}
                aria-pressed={dotIndex === activeIndex}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
