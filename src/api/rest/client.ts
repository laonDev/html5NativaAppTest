import axios from 'axios';
import { setupMockInterceptor } from '@/api/mock/mockInterceptor';

// API 베이스 URL 설정 (환경 변수 우선, 로컬은 프록시 경로인 '/api' 사용)
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || '/api';

/**
 * [Phase 2] Feature Flag: 개발 환경 동적 스위칭
 * - VITE_API_MOCKING 플래그 하나로 Mock 레이어와 실서버/프록시 레이어를 즉시 전환합니다.
 * - Confluence에 보고된 단일화된 아키텍처 가이드라인을 준수합니다.
 */
const USE_MOCK = (import.meta as any).env.VITE_API_MOCKING === 'true';

const APP_VERSION = '0.1.0';
const PLATFORM = -2; // EDITOR 식별자

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

/**
 * [Core Logic] 401 Token Refresh 비동기 대기열(Queue) 관리
 * - 다중 API 호출 시 토큰이 만료되면 모든 요청이 개별적으로 Refresh를 호출하는 'Race Condition'을 방지합니다.
 * - 첫 요청이 Refresh를 수행하는 동안(Lock), 나머지 요청은 Subscribers 배열에 담아 대기시킵니다.
 */
let isRefreshing = false; // 토큰 갱신 진행 여부를 제어하는 플래그
let refreshSubscribers: ((token: string) => void)[] = []; // 새 토큰 발급 시 재발송될 요청들의 콜백 리스트

// 갱신 성공 시 대기 중인 모든 요청에 새 토큰을 배포하고 큐를 비웁니다.
const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
};

// 401 에러가 발생한 요청들을 큐에 등록합니다.
const addRefreshSubscriber = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

// [Interceptor: Request] 전역 세션(Bearer Token) 자동 주입
client.interceptors.request.use((config: any) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// [Network Bridge] 런타임 환경에 따른 통신 레이어 분기 처리
if (USE_MOCK) {
    console.log('[API Core] Mock Mode Active: 로컬 가짜 데이터 레이어를 사용합니다.');
    setupMockInterceptor(client);
} else {
    // 실서버 인프라 정보 로그 (차주 소켓 연동 대비)
    console.log(
        '[API Core] Real API Mode Active\n',
        ' REST :', (import.meta as any).env.VITE_API_BASE_URL, '\n',
        ' SUPR :', (import.meta as any).env.VITE_SUPR_API_BASE_URL ?? '(not set)'
    );

    // [Interceptor: Response] 비즈니스 에러 및 토큰 만료 핸들링
    client.interceptors.response.use(
        (response: any) => {
            const body = response.data;
            if (body?.error) {
                const err = body.error;

                /**
                 * [4/10 보완] action: 2 (세션 완전 만료) 예외 처리
                 * - Refresh Token까지 만료되어 자동 복구가 불가능한 경우입니다.
                 * - 진행 중인 대기열(Queue)을 즉시 파기하여 메모리 누수를 방지하고 세션을 강제 종료합니다.
                 */
                if (err?.action === 2) {
                    console.warn('[API Core] 세션 복구 불가(action:2). 전역 상태를 강제 초기화합니다.');
                    isRefreshing = false;
                    refreshSubscribers = [];
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                return Promise.reject(err);
            }
            return body?.content ?? body;
        },
        async (error: any) => {
            const originalRequest = error.config;

            // 401 Unauthorized 발생 시 세션 복구(Hydration) 시퀀스 진입
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                // 이미 다른 요청에 의해 갱신이 진행 중이라면 큐에서 대기 (중복 호출 방지)
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

                isRefreshing = true;

                try {
                    // [4/10 리팩토링] 하드코딩 제거: 순수 axios 인스턴스로 독립적인 갱신 API 호출
                    const refreshResponse = await axios.post(`${API_BASE_URL}/account/refresh`, {});
                    const newToken = refreshResponse.data?.token ?? refreshResponse.data?.accessToken;

                    localStorage.setItem('token', newToken);
                    isRefreshing = false; // Lock 해제
                    onRefreshed(newToken); // 대기열 해제 및 재발송

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    }
                    return client(originalRequest);

                } catch (refreshError) {
                    // 갱신 실패 시 Fail-safe: 대기열 청소 및 강제 로그아웃
                    isRefreshing = false;
                    refreshSubscribers = [];
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }

            return Promise.reject(error.response?.data?.error ?? error.message);
        },
    );
}

export default client;