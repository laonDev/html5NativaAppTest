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
                return Promise.reject(body.error);
            }
            return body?.content ?? body;
        },
        async (error: any) => {
            const originalRequest = error.config;

            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                if (isRefreshing) {
                    return new Promise((resolve) => {
                        addRefreshSubscriber((newToken) => {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            resolve(client(originalRequest));
                        });
                    });
                }

                isRefreshing = true;

                try {
                    console.log('[API] 세션 만료. 안전한 토큰 갱신 시퀀스 진입...');
                    let newToken = "";

                    // ✅ 스위치가 켜져 있으면 (팀원들은 무조건 켜짐) 우회 로직 실행
                    if (ENABLE_MOCK_API) {
                        console.log('[API] 개발 모드: 가짜 토큰으로 갱신을 시뮬레이션합니다.');
                        newToken = "NEW_VALID_TOKEN_MOCK_" + Date.now();
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else {
                        console.log('[API] 운영 모드: 실제 서버에 토큰 갱신을 요청합니다.');
                        // TODO: 실제 API 호출 로직 
                        // const refreshResponse = await axios.post('/api/auth/refresh');
                        // newToken = refreshResponse.data.token;
                    }

                    localStorage.setItem('token', newToken);

                    isRefreshing = false;
                    onRefreshed(newToken);

                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return client(originalRequest);

                } catch (refreshError) {
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