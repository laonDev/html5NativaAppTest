import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

interface TooltipPayload {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface TooltipContextValue {
  showTooltip: (payload: TooltipPayload) => void;
  hideTooltip: (id?: string) => void;
}

const TooltipContext = createContext<TooltipContextValue>({
  showTooltip: () => {},
  hideTooltip: () => {},
});

export function useTooltipController() {
  return useContext(TooltipContext);
}

export function TooltipControllerProvider({ children }: { children: ReactNode }) {
  const [tooltip, setTooltip] = useState<TooltipPayload | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const hideTooltip = useCallback((id?: string) => {
    setTooltip((prev) => {
      if (!prev) return null;
      if (id && prev.id !== id) return prev;
      return null;
    });
  }, []);

  const showTooltip = useCallback((payload: TooltipPayload) => {
    clearTimer();
    setTooltip(payload);
    hideTimerRef.current = window.setTimeout(() => {
      hideTooltip(payload.id);
    }, 1500);
  }, [clearTimer, hideTooltip]);

  const value = useMemo(() => ({ showTooltip, hideTooltip }), [hideTooltip, showTooltip]);

  return (
    <TooltipContext.Provider value={value}>
      {children}

      {tooltip && (
        <div
          className="pointer-events-none fixed z-[70] -translate-x-1/2 rounded-md border border-white/20 bg-black/75 px-2 py-1 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.45)]"
          style={{ left: tooltip.x, top: tooltip.y }}
          role="tooltip"
        >
          {tooltip.label}
        </div>
      )}
    </TooltipContext.Provider>
  );
}
