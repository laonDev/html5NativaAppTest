import { create } from 'zustand';
import type { Category, Game } from '@/types';

interface GameState {
  categories: Category[];
  games: Record<string, Game>;
  favorites: number[];
  searchQuery: string;

  setCategories: (categories: Category[]) => void;
  setGames: (games: Record<string, Game>) => void;
  setSearchQuery: (query: string) => void;
  addFavorite: (gameIdx: number) => void;
  removeFavorite: (gameIdx: number) => void;
  loadFavorites: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  categories: [],
  games: {},
  favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
  searchQuery: '',

  setCategories: (categories) => set({ categories }),
  setGames: (games) => set({ games }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  addFavorite: (gameIdx) => {
    const favorites = [...get().favorites, gameIdx];
    localStorage.setItem('favorites', JSON.stringify(favorites));
    set({ favorites });
  },

  removeFavorite: (gameIdx) => {
    const favorites = get().favorites.filter((id) => id !== gameIdx);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    set({ favorites });
  },

  loadFavorites: () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    set({ favorites });
  },
}));
