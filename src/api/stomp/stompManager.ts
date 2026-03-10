import { Client } from '@stomp/stompjs';
import type { StompWallet } from '@/types';

let stompClient: Client | null = null;

export const stompManager = {
  connect(url: string, onWalletUpdate: (wallet: StompWallet) => void) {
    if (stompClient?.active) return;

    stompClient = new Client({
      brokerURL: url,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    stompClient.onConnect = () => {
      console.log('[STOMP] Connected');

      stompClient?.subscribe('user/exchange/amq.direct/wallet', (message) => {
        try {
          const wallet: StompWallet = JSON.parse(message.body);
          onWalletUpdate(wallet);
        } catch (e) {
          console.error('[STOMP] Parse error:', e);
        }
      }, { id: 'sub-3' });

      stompClient?.subscribe('user/exchange/amq.direct/player', (message) => {
        console.log('[STOMP] Player update:', message.body);
      }, { id: 'sub-4' });
    };

    stompClient.onStompError = (frame) => {
      console.error('[STOMP] Error:', frame.headers['message']);
    };

    stompClient.activate();
  },

  disconnect() {
    stompClient?.deactivate();
    stompClient = null;
  },

  isConnected() {
    return stompClient?.active ?? false;
  },
};
