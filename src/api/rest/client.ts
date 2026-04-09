import axios from 'axios';
import { setupMockInterceptor } from '@/api/mock/mockInterceptor';

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || '/api';

// [Phase 2 코어: Feature Flag 단일화] Confluence 보고서와 100% 일치
const USE_MOCK = (import.meta as any).env.VITE_API_MOCKING === 'true';

const APP_VERSION = '0.1.0';
// OS_PLATFORM: NONE=0, PC=-1, EDITOR=-2, IOS=1, AOS=2
const PLATFORM = -2;

const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Version': APP_VERSION,
        'BundleVersion': APP_VERSION,
        'Platform': String(PLATFORM),
    },
});

// --- [Phase 2 코어 아키텍처] 401 Token Refresh 비동기 대기열(Queue) ---
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = []; // 처리 후 큐 비우기
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};
// ------------------------------------------------------------------------

// [요청 인터셉터] 전역 세션 토큰 주입
client.interceptors.request.use((config: any) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// [네트워크 브릿지] Feature Flag에 따른 런타임 동적 라우팅
if (USE_MOCK) {
    console.log('[API Core] Feature Flag (VITE_API_MOCKING) 활성화: 로컬 Mock Data 레이어로 우회합니다.');
    setupMockInterceptor(client);
} else {
    // 동료분이 추가하신 유용한 소켓 로그 유지
    console.log(
        '[API Core] 실서버 라우팅 환경 활성화\n',
        ' REST :', (import.meta as any).env.VITE_API_BASE_URL, '\n',
        ' SUPR :', (import.meta as any).env.VITE_SUPR_API_BASE_URL ?? '(not set)', '\n',
        ' Socket:', (import.meta as any).env.VITE_SOCKET_URL ?? '(not set)', '\n',
        ' STOMP :', (import.meta as any).env.VITE_STOMP_URL ?? '(not set)',
    );

    // [응답 인터셉터] Error Boundary 및 토큰 갱신 큐 통합
    client.interceptors.response.use(
        (response: any) => {
            const body = response.data;
            if (body?.error) {
                const err = body.error;
                // [Merge] 동료분이 추가한 세션 만료 예외 처리 로직 유지
                if (err?.action === 2) {
                    console.warn('[API Core] 세션 완전 만료(action:2) — 로그인 페이지로 이동합니다.', err);
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                return Promise.reject(err);
            }
            return body?.content ?? body;
        },
        async (error: any) => {
            const originalRequest = error.config;

            // 401 Unauthorized 발생 및 재시도 패킷이 아닌 경우
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                // 이미 갱신 시퀀스가 동작 중이라면 Queue에 적재하여 대기
                if (isRefreshing) {
                    return new Promise((resolve) => {
                        addRefreshSubscriber((newToken) => {
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            }
                            resolve(client(originalRequest));
                        });
                    });
                }

                // 갱신 시퀀스 락(Lock) 활성화
                isRefreshing = true;

                try {
                    console.log('[API Core] 세션 만료 감지. 안전한 토큰 갱신(Hydration) 시퀀스 진입...');

                    // [Refactor] 동료분의 이상한 가짜 토큰 로직 제거. 실서버 환경이므로 무조건 순수 axios로 백엔드 호출.
                    const refreshResponse = await axios.post(`${API_BASE_URL}/account/refresh`, {
                        // 필요 시 refreshToken Payload 추가
                    });

                    const newToken = refreshResponse.data?.token ?? refreshResponse.data?.accessToken;

                    // 전역 스토어 상태 동기화
                    localStorage.setItem('token', newToken);

                    // 락(Lock) 해제 및 Queue 대기열 순차적 해제
                    isRefreshing = false;
                    onRefreshed(newToken);

                    // 최초 실패 패킷 재발송
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    }
                    return client(originalRequest);

                } catch (refreshError) {
                    // [Error Boundary] 토큰 갱신 완전 실패 시 무한 루프 차단 및 세션 강제 초기화
                    console.error('[API Core] Token Refresh 완전 실패. 전역 세션을 초기화합니다.', refreshError);
                    isRefreshing = false;
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }

            return Promise.reject(error.response?.data?.error ?? error.response?.data ?? error.message);
        },
    );
}

export default client;