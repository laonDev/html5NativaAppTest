import { registerPlugin } from '@capacitor/core'
import type { StoragePlugin } from './definitions'

export const StorageBridge = registerPlugin<StoragePlugin>('StorageBridge', {
  web: () => import('./web').then((m) => new m.StorageBridgeWeb()),
})

export * from './definitions'