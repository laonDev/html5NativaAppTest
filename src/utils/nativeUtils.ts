/**
 * NativeUtil
 *
 * Capacitor Native Plugin 호출을 통합 관리하는 유틸 클래스
 *
 * - StorageBridge (일반 저장소)
 * - SecureStorage (암호화 저장소)
 * - LoggerBridge (네이티브 로그)
 *
 * Web → Native 호출을 단일 인터페이스로 추상화하여
 * 사용성을 단순화하고 유지보수성을 높이기 위한 목적
 */
import { StorageBridge } from '@/native/storage'
import { SecureStorage } from '@/native/secure'
import { LoggerBridge } from '@/native/logger'

export const NativeUtil = {
  /**
   * 일반 저장소 (SharedPreferences / UserDefaults)
   */
  storage: {
    /**
     * 값 저장
     */
    setItem: (key: string, value: string) =>
      StorageBridge.setItem({ key, value }),

    /**
     * 값 조회
     */
    getItem: (key: string) =>
      StorageBridge.getItem({ key }),

    /**
     * 값 삭제
     */
    removeItem: (key: string) =>
      StorageBridge.removeItem({ key }),
  },

  /**
   * 암호화 저장소 (Android: EncryptedSharedPreferences / iOS: Keychain)
   */
  secureStorage: {
    /**
     * 민감 데이터 저장 (토큰, 인증 정보 등)
     */
    setItem: (key: string, value: string) =>
      SecureStorage.setItem({ key, value }),

    /**
     * 민감 데이터 조회
     */
    getItem: (key: string) =>
      SecureStorage.getItem({ key }),

    /**
     * 민감 데이터 삭제
     */
    removeItem: (key: string) =>
      SecureStorage.removeItem({ key }),
  },

  /**
   * 네이티브 로그 브릿지
   */
  logger: {
    /**
     * 일반 로그 출력
     */
    log: (message: string) =>
      LoggerBridge.log({ message }),

    /**
     * 에러 로그 출력
     */
    error: (message: string) =>
      LoggerBridge.error({ message }),
  },
}