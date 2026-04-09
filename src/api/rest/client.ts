import axios from 'axios';
import { setupMockInterceptor } from '@/api/mock/mockInterceptor';

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || '/api';
const USE_MOCK = !(import.meta as any).env.VITE_API_BASE_URL;

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

// --- [Phase 2 R&D] 토큰 갱신 시 Race Condition 방지용 대기 큐(Queue) ---
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

//  핵심 스위치: .env에 명시적으로 false라고 적지 않는 이상 무조건 우회(Mock) 작동
const ENABLE_MOCK_API = (import.meta as any).env.VITE_ENABLE_MOCK_API === 'true';

// [요청 인터셉터]
client.interceptors.request.use((config: any) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

if (USE_MOCK) {
    console.log('[API] Mock mode enabled — no VITE_API_BASE_URL set');
    setupMockInterceptor(client);
} else {
    console.log(
        '[API] Real server mode\n',
        ' REST :', (import.meta as any).env.VITE_API_BASE_URL, '\n',
        ' SUPR :', (import.meta as any).env.VITE_SUPR_API_BASE_URL ?? '(not set)', '\n',
        ' Socket:', (import.meta as any).env.VITE_SOCKET_URL ?? '(not set)', '\n',
        ' STOMP :', (import.meta as any).env.VITE_STOMP_URL ?? '(not set)',
    );

    // [응답 인터셉터]
    client.interceptors.response.use(
        (response: any) => {
            const body = response.data;
            if (body?.error) {
                const err = body.error;
                // action: 2 = 재로그인 필요 (expired_token 등)
                if (err?.action === 2) {
                    console.warn('[API] 세션 만료 — 로그인 페이지로 이동합니다.', err);
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                return Promise.reject(err);
            }
            return body?.content ?? body;
        },
        async (error: any) => {
            const originalRequest = error.config;

            // 401 에러이고, 아직 재시도를 하지 않은 패킷일 경우
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                // 이미 누군가 갱신 중이라면 큐(Queue)에 들어가서 대기
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

                // 내가 최초의 401 패킷이라면 갱신 프로세스 시작
                isRefreshing = true;

                try {
                    console.log('[API] 세션 만료. 안전한 토큰 갱신 시퀀스 진입...');
                    let newToken = "";

                    // 스위치가 켜져 있으면 우회 로직 실행
                    if (ENABLE_MOCK_API) {
                        console.log('[API] 개발 모드: 가짜 토큰으로 갱신을 시뮬레이션합니다.');
                        newToken = "NEW_VALID_TOKEN_MOCK_" + Date.now();
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else {
                        console.log('[API] 운영 모드: 실제 서버에 토큰 갱신을 요청합니다.');

                        // 중요: 여기서 client 인스턴스를 쓰면 401 무한 루프에 빠질 수 있으므로 순수 axios 사용
                        const refreshResponse = await axios.post(`${API_BASE_URL}/account/refresh`, {
                            // 필요 시 백엔드 스펙에 맞춰 refreshToken 파라미터 추가
                            // refreshToken: localStorage.getItem('refreshToken') 
                        });

                        // 백엔드 응답 스펙에 맞춰 수정 (예: data.token 또는 data.accessToken)
                        newToken = refreshResponse.data?.token ?? refreshResponse.data?.accessToken;
                    }

                    // 새 토큰 저장
                    localStorage.setItem('token', newToken);

                    isRefreshing = false;
                    onRefreshed(newToken); // 큐에 대기 중이던 애들한테 새 토큰 뿌리고 출발시킴

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    }
                    return client(originalRequest); // 처음 실패했던 내 패킷 재발송

                } catch (refreshError) {
                    // 리프레시마저 실패하면 완전 로그아웃
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