import { create } from 'zustand';
import type { AuthInfo, LoginResult, ServerInfo, UserAccountData } from '@/types';

interface AuthState {
  serverInfo: ServerInfo | null;
  authInfo: AuthInfo | null;
  loginResult: LoginResult | null;
  userInfo: UserAccountData | null;
  isLoggedIn: boolean;

  setServerInfo: (info: ServerInfo) => void;
  setAuthInfo: (info: AuthInfo) => void;
  setLoginResult: (result: LoginResult) => void;
  setUserInfo: (info: UserAccountData) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  serverInfo: null,
  authInfo: null,
  loginResult: null,
  userInfo: null,
  isLoggedIn: false,

  setServerInfo: (info) => set({ serverInfo: info }),

  setAuthInfo: (info) => {
    localStorage.setItem('authInfo', JSON.stringify(info));
    set({ authInfo: info });
  },

  setLoginResult: (result) => {
    localStorage.setItem('token', result.token);
    set({ loginResult: result, isLoggedIn: true });
  },

  setUserInfo: (info) => set({ userInfo: info }),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authInfo');
    set({ loginResult: null, userInfo: null, isLoggedIn: false });
  },
}));
