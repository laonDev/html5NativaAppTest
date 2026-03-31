import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { LOADING_MINIMUM_VISIBLE_MS, TOAST_DEFAULT_DURATION_MS } from '@/constants/ui';

type ToastType = 'info' | 'success' | 'error';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface FeedbackContextValue {
  showToast: (message: string, type?: ToastType, durationMs?: number) => void;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: <T>(task: () => Promise<T>, message?: string) => Promise<T>;
}

// 전역 UI 상태(토스트/로딩)를 다루는 컨텍스트
const UiStatusContext = createContext<FeedbackContextValue>({
  showToast: () => {},
  showLoading: () => {},
  hideLoading: () => {},
  withLoading: async <T,>(task: () => Promise<T>) => task(),
});

// 페이지/컴포넌트에서 전역 UI 상태 API를 꺼내 쓰는 훅
export function useUiStatus() {
  return useContext(UiStatusContext);
}

// 앱 전체에서 공통으로 쓰는 로딩 오버레이/토스트를 관리하는 Provider
export function UiStatusProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [loadingVisible, setLoadingVisible] = useState(false);
  const loadingStartRef = useRef<number>(0);

  // 토스트를 띄우고 duration 후 자동 제거
  const showToast = useCallback((message: string, type: ToastType = 'info', durationMs = TOAST_DEFAULT_DURATION_MS) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, durationMs);
  }, []);

  // 전역 로딩 시작
  const showLoading = useCallback((message = 'Loading...') => {
    loadingStartRef.current = Date.now();
    setLoadingMessage(message);
    setLoadingVisible(true);
  }, []);

  // 전역 로딩 종료 (너무 빠른 깜빡임 방지를 위해 최소 노출 시간 보장)
  const hideLoading = useCallback(() => {
    const elapsed = Date.now() - loadingStartRef.current;
    const wait = Math.max(LOADING_MINIMUM_VISIBLE_MS - elapsed, 0);

    window.setTimeout(() => {
      setLoadingVisible(false);
    }, wait);
  }, []);

  // 비동기 작업을 로딩 오버레이와 함께 실행하는 헬퍼
  const withLoading = useCallback(async <T,>(task: () => Promise<T>, message = 'Loading...') => {
    showLoading(message);
    try {
      return await task();
    } finally {
      hideLoading();
    }
  }, [hideLoading, showLoading]);

  const value = useMemo(
    () => ({ showToast, showLoading, hideLoading, withLoading }),
    [hideLoading, showLoading, withLoading],
  );

  return (
    <UiStatusContext.Provider value={value}>
      {children}

      {/* 전역 로딩 레이어 */}
      {loadingVisible && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55">
          <div className="rounded-xl border border-white/20 bg-[#111a3a] px-6 py-5 text-center shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
            <p className="mt-3 text-sm font-semibold text-white">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* 전역 토스트 스택 영역 */}
      <div className="pointer-events-none fixed bottom-[calc(86px+var(--safe-bottom))] left-1/2 z-[75] flex w-[min(90vw,420px)] -translate-x-1/2 flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              'rounded-lg border px-3 py-2 text-sm font-semibold text-white shadow-[0_4px_18px_rgba(0,0,0,0.4)]',
              toast.type === 'success' && 'border-emerald-300/50 bg-emerald-600/85',
              toast.type === 'error' && 'border-red-300/50 bg-red-600/85',
              toast.type === 'info' && 'border-blue-300/50 bg-blue-700/85',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </UiStatusContext.Provider>
  );
}
