export interface SecureStoragePlugin {
  setItem(options: { key: string; value: string }): Promise<void>
  getItem(options: { key: string }): Promise<{ value: string }>
  removeItem(options: { key: string }): Promise<void>
}