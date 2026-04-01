import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

// --- [Phase 2 R&D] 전역 세션 상태 캡슐화 및 보안 아키텍처 (CLI-N03) ---
// 프롭 드릴링(Prop Drilling) 방지 및 브라우저 새로고침 시 세션 파편화 방지를 위한 중앙 상태 관리

// useAuth 훅의 리턴 타입을 그대로 추출하여 Context의 타입으로 사용 (타입 안정성 확보)
type AuthContextType = ReturnType<typeof useAuth>;

// 1. Context 생성 (초기값은 null)
const AuthContext = createContext<AuthContextType | null>(null);

// 2. Provider 컴포넌트: 앱의 최상단을 감싸서 하위 컴포넌트들에 상태를 공급
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const auth = useAuth(); // 아까 만든 비즈니스 로직 훅을 여기서 단 한 번만 실행

    // 브라우저 새로고침 시 세션 복구(Auto-Login) 시퀀스
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !auth.authData) {
            // TODO: (Phase 2) 실제 서버 연동 시 /api/auth/me 등의 검증 API를 호출하여 
            // 토큰 위변조 여부를 확인하고 authData를 복구하는 로직 추가 예정
            console.log('[Security] 로컬 세션 감지. 무결성 검증 시퀀스 대기 중...');
        }
    }, [auth.authData]);

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. 커스텀 훅: UI 팀원들이 안전하고 쉽게 상태를 가져다 쓰도록 제공하는 인터페이스
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        // Provider 외부에서 접근하려는 잘못된 참조를 런타임에서 강력하게 차단
        throw new Error('useAuthContext는 반드시 AuthProvider 내부에서만 사용되어야 합니다.');
    }
    return context;
};