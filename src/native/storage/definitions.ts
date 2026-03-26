export interface SetItemOptions {
  key: string;
  value: string;
}

export interface GetItemOptions {
  key: string;
}

export interface RemoveItemOptions {
  key: string;
}

export interface GetItemResult {
  value: string | null;
}

export interface StoragePlugin {
  setItem(options: SetItemOptions): Promise<void>;
  getItem(options: GetItemOptions): Promise<GetItemResult>;
  removeItem(options: RemoveItemOptions): Promise<void>;
  clear(): Promise<void>;
}