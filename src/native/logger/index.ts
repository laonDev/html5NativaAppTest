import { registerPlugin } from '@capacitor/core'
import type { LoggerBridgePlugin } from './definitions'

export const LoggerBridge =
  registerPlugin<LoggerBridgePlugin>('LoggerBridge')