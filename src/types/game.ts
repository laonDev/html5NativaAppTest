export interface GamesCategories {
  categories: Category[];
}

export interface Category {
  name: string;
  slug: string;
  'game-ids': number[];
  'also-show-latest-games': boolean;
  'also-show-others-in-group': boolean;
  'live-update': boolean;
  'requires-login': boolean;
  'also-show-on-top-of-page': boolean;
}

export interface GamesResult {
  games: Record<string, Game>;
}

export interface Game {
  'game-id': number;
  slug: string;
  title: string;
  'game-Image': GameImage;
  'player-capabilities': string[];
  new: boolean;
  'is-duelz-enabled': boolean;
}

export interface GameImage {
  src: { name: string; ext: string[] };
  srcset: Array<{ name: string; ext: string[] }>;
}

export interface GameDetail {
  'allow-real-play': boolean;
  'game-type': string;
  'vendor-game-id': string;
  'allow-demo-play': boolean;
  title: string;
  'short-description': string;
  'long-description': string;
  'game-id': number;
  'game-image': GameImage;
  slug: string;
  jurisdiction: string;
  'vendor-name': string;
  'launch-mode': string;
  'rg-buttons-enabled': boolean;
  url: string;
  maintenance: boolean;
  hot: boolean;
  mini_game: boolean;
  offline: boolean;
  'is-new': boolean;
  'is-hot': boolean;
  'is-mini-game': boolean;
  'is-live': boolean;
  'iframe-support': string;
}

export interface HistoryResponse {
  items: HistoryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface HistoryItem {
  idx: number;
  type: string;
  amount: number;
  balance: number;
  description: string;
  date: string;
}

export interface VicconGameData {
  gameType: number;
  slotIdx: number;
  slotType: number;
  title: string;
  imgUrl: string;
}

export interface VicconSlotListResponse {
  games: VicconGameData[];
}
