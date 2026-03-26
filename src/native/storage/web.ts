import { WebPlugin } from '@capacitor/core'
import type {
  GetItemOptions,
  GetItemResult,
  RemoveItemOptions,
  SetItemOptions,
  StoragePlugin,
} from './definitions'

export class StorageBridgeWeb extends WebPlugin implements StoragePlugin {
  async setItem(options: SetItemOptions): Promise<void> {
    localStorage.setItem(options.key, options.value)
  }

  async getItem(options: GetItemOptions): Promise<GetItemResult> {
    return {
      value: localStorage.getItem(options.key),
    }
  }

  async removeItem(options: RemoveItemOptions): Promise<void> {
    localStorage.removeItem(options.key)
  }

  async clear(): Promise<void> {
    localStorage.clear()
  }
}