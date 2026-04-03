import { useState, useCallback } from 'react';
import client from '@/api/rest/client';
import { LoginResult, AuthInfo } from '@/types/auth';

// --- [Phase 2 R&D] 인증 비즈니스 로직 및 비동기 상태 관리 (CLI-N02) ---
// 기존 C# LoginManager.cs의 코루틴 기반 상태 관리를 
// React 비동기(Promise) 및 지역 상태(State) 기반으로 전면 재설계하여 무결성 확보

export const useAuth = () => {
  // 통신 중 렌더링을 제어하기 위한 상태값들
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [authData, setAuthData] = useState<AuthInfo | null>(null);

  // 로그인 시퀀스 비동기 처리
  const login = useCallback(async (userId: string, userPass: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. 서버 API 호출 (우리가 만든 client.ts의 인터셉터를 무조건 통과함)
      // 제네릭을 사용하여 응답값이 아까 정의한 LoginResult 타입임을 강제함
      const response = await client.post<any, LoginResult>('/api/auth/login', {
        userId,
        userPass
      });

      // 2. 토큰 안전 저장 (향후 HttpOnly 쿠키로 전환 시 로직 변경 예정 - CLI-N03)
      if (response.token) {
        localStorage.setItem('token', response.token);
      }

      // 3. UI/전역 상태에서 사용할 데이터 정제 및 무결성 확보
      const refinedAuthInfo: AuthInfo = {
        authid: response.authid,
        accountidx: response.accountidx,
        auth_platform: 'WEB' 
      };

      setAuthData(refinedAuthInfo);
      return refinedAuthInfo;

    } catch (err: any) {
      // 인터셉터에서 1차로 걸러진 에러를 비즈니스 로직에 맞게 최종 가공
      const errorMessage = err?.message || '로그인 서버 통신 중 알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      throw err; // UI 컴포넌트(View Layer)로 에러 전파하여 화면에 표시되게 함
    } finally {
      // 성공하든 실패하든 로딩 상태 해제 (데이터 정합성 및 무한 로딩 방지)
      setIsLoading(false); 
    }
  }, []);

  // 로그아웃 시퀀스
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAuthData(null);
    window.location.href = '/login';
  }, []);

  return {
    isLoading,
    error,
    authData,
    login,
    logout
  };
};