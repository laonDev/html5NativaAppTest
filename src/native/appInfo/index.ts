import { registerPlugin } from '@capacitor/core'
import type { AppInfoBridgePlugin } from './definitions'

export const AppInfoBridge =
  registerPlugin<AppInfoBridgePlugin>('AppInfoBridge')