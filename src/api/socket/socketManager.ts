import { io, Socket } from 'socket.io-client';
import type { BetRank, SpinResultMessage } from '@/types';

let socket: Socket | null = null;

export interface CrashStateEvent {
  roundIndex: number;
  currentState: number;
  tick: number;
  userCount: number;
  server_time: number;
}

export interface CrashJoinEvent {
  roundIndex: number;
  currentState: number;
  tick: number;
  betRank: BetRank[];
  hash: string;
  userCount: number;
}

export interface CrashEndEvent {
  roundIndex: number;
  tick: number;
  hash: string;
  betRank: BetRank[];
  cashOutRank: BetRank[];
}

export const socketManager = {
  connect(url: string, token: string) {
    if (socket?.connected) return socket;

    socket = io(url, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => console.log('[Socket.IO] Connected'));
    socket.on('disconnect', (reason) => console.log('[Socket.IO] Disconnected:', reason));
    socket.on('connect_error', (err) => console.error('[Socket.IO] Error:', err.message));

    return socket;
  },

  disconnect() {
    socket?.disconnect();
    socket = null;
  },

  getSocket() {
    return socket;
  },

  emit(event: string, data?: unknown) {
    socket?.emit(event, data);
  },

  on<T = unknown>(event: string, callback: (data: T) => void) {
    socket?.on(event, callback as (...args: unknown[]) => void);
  },

  off(event: string) {
    socket?.off(event);
  },

  // Slot events
  slotJoin(slotIndex: number) {
    socket?.emit('slot_join', { slotIndex });
  },

  slotLeave(slotIndex: number) {
    socket?.emit('slot_leave', { slotIndex });
  },

  onSpin(callback: (data: SpinResultMessage) => void) {
    socket?.on('spin', callback);
  },

  // Crash events
  crashJoin() {
    socket?.emit('crash_join');
  },

  crashLeave() {
    socket?.emit('crash_leave');
  },

  onCrashJoin(callback: (data: CrashJoinEvent) => void) {
    socket?.on('crash_join', callback);
  },

  onCrashState(callback: (data: CrashStateEvent) => void) {
    socket?.on('crash_state', callback);
  },

  onCrashBet(callback: (data: { betRank: BetRank[] }) => void) {
    socket?.on('crash_bet', callback);
  },

  onCrashEnd(callback: (data: CrashEndEvent) => void) {
    socket?.on('crash_end', callback);
  },

  onCrashCashOut(callback: (data: { nickname: string; multi: number }) => void) {
    socket?.on('crash_cash_out', callback);
  },
};
