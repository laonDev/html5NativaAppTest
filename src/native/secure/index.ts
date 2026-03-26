import { registerPlugin } from '@capacitor/core'
import type { SecureStoragePlugin } from './definitions'

export const SecureStorage =
  registerPlugin<SecureStoragePlugin>('SecureStorage')