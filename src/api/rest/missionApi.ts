import client from './client';
import type {
  DailyMissionGetResponse,
  DailyMissionCollectResponse,
  DailyMissionCollectAllResponse,
  DailyMissionCompleteResponse,
} from '@/types';

export const missionApi = {
  list: () =>
    client.post<unknown, DailyMissionGetResponse>('daily_mission/list', {}),

  collect: (missionIndex: number) =>
    client.post<unknown, DailyMissionCollectResponse>('daily_mission/collect', { missionIndex }),

  collectAll: () =>
    client.post<unknown, DailyMissionCollectAllResponse>('daily_mission/Collect_all'),

  complete: () =>
    client.post<unknown, DailyMissionCompleteResponse>('daily_mission/complete'),
};
