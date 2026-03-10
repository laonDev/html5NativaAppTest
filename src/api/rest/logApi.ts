import client from './client';

export const logApi = {
  clientLog: (params: {
    useridx: number;
    logLevel: string;
    category: string;
    message: string;
    call_stack?: string;
  }) => client.post<unknown, void>('log/client', params),

  clientActionLog: (params: {
    useridx: number;
    category: string;
    category_info?: string;
    action: string;
    action_info?: string;
    stay_time?: number;
    isplaynow?: boolean;
  }) => client.post<unknown, void>('log/client_action', params),
};
