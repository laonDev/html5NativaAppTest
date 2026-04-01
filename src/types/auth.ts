// --- [Phase 2 R&D] 서버 API 패킷 정적 타입 매핑 및 정밀도 검증 (CLI-N04) ---

/**
 * 로그인/초기화 시 서버가 반환하는 핵심 유저 인증 정보
 */
export interface AuthInfo {
    authid: string;
    // C#의 long 타입 대응: JS의 Number.MAX_SAFE_INTEGER 초과 시 오동작 방지를 위해 
    // 내부적으로 string 래핑 처리 권장, 현재는 백엔드 명세에 맞춰 number로 유지하되 파싱 시 검증 필요
    accountidx: number;
    auth_platform: string;
}

/**
 * 로그인 요청 후 응답 패킷 구조
 */
export interface LoginResult {
    authid: string;
    accountidx: number;
    token: string;
    server_group: number;
    useridx: number;
}

/**
 * 계정 삭제(탈퇴) 관련 정보
 */
export interface AccountDeleteInfo {
    deleted: boolean;
    // C# DateTime -> JS ISO 8601 String 포맷 규격화
    deleted_request_date: string;
    deleted_start_date: string;
}

/**
 * 신규 유저 생성 파라미터 
 * (주니어 오타 수정: adress -> address 및 데이터 무결성 강제)
 */
export interface CreateUserParameter {
    userId: string;
    password?: string; // 소셜 로그인 시 null 가능성 배제
    email?: string;
    securityQuestion?: string;
    securityAnswer?: string;
    gender?: string;
    lastName?: string;
    firstName?: string;
    birthDate?: string;
    address: string;   // 오타 수정 (adress -> address)
    currency: string;
    promoCode?: string;
    phoneNumber?: string;
}

/**
 * 시스템 설정 및 버전 관리 정보
 */
export interface ServerInfo {
    status?: number;
    message?: string;
    version?: string;
    multiServerUrl?: string;
    suprStompUrl?: string;
    system?: {
        // 서버 타임 동기화 틱(Tick) 오차 방지용 string 규격
        server_time?: string;
        config?: {
            revision?: number;
            table_server_url?: string;
            table_version?: string;
            table_revision?: number;
        };
    };
    content?: {
        bundle_version?: string;
    };
}