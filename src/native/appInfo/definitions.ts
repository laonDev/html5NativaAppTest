export interface AppInfoBridgePlugin {
  getAppInfo(): Promise<{
    isDebug: boolean
    applicationId?: string
    bundleId?: string
    versionName: string
    versionCode: string | number
  }>
}