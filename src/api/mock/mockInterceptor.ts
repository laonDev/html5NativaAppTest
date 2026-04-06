import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import {
  mockServerInfo,
  mockAuthInfo,
  mockLoginResult,
  mockLobbyData,
  mockCategories,
  mockGames,
  mockHousey,
  mockDailyMissions,
  mockVoltList,
  mockVicconGames,
} from './mockData';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface MockRoute {
  match: (url: string, method: string) => boolean;
  handler: (config: InternalAxiosRequestConfig) => unknown;
}

// Deep clone helper
const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

// Mutable state for bingo
let bingoState = clone(mockHousey.houseyInfo);

// Mutable state for daily missions
let missionInfos: typeof mockDailyMissions.dailyMissionInfos = clone(mockDailyMissions.dailyMissionInfos);
let missionOverallStatus = mockDailyMissions.status;

const routes: MockRoute[] = [
  // Account
  {
    match: (url) => url.includes('account/server_info'),
    handler: () => mockServerInfo,
  },
  {
    match: (url) => url.includes('account/create_guest'),
    handler: () => ({ create_result: mockAuthInfo }),
  },
  {
    match: (url) => url.includes('account/create_dev'),
    handler: () => ({ create_result: mockAuthInfo }),
  },
  {
    match: (url) => url.includes('account/login'),
    handler: () => ({ login_result: mockLoginResult }),
  },
  {
    match: (url) => url.includes('account/change_nickname'),
    handler: () => ({}),
  },
  {
    match: (url) => url.includes('account/check_nickname_duplication'),
    handler: () => ({}),
  },
  {
    match: (url) => url.includes('account/change_profile'),
    handler: () => ({}),
  },

  // Game
  {
    match: (url) => url.includes('game/enter_lobby'),
    handler: () => clone(mockLobbyData),
  },
  {
    match: (url) => url.includes('games/list'),
    handler: () => clone(mockGames),
  },
  {
    match: (url) => url.includes('games/search'),
    handler: () => clone(mockGames),
  },
  {
    match: (url) => url.includes('games/favorite/create'),
    handler: () => ({}),
  },
  {
    match: (url) => url.includes('games/favorite/delete'),
    handler: () => ({}),
  },

  // Casino / Slot
  {
    match: (url) => url.includes('casino/slot/enter'),
    handler: () => ({
      userInfo: { balance: 500000 },
      slotInfo: { slotType: 1, betRange: [100, 200, 500, 1000], lineCount: 20, payoutArray: [], reelArray: [], jackpot: 0, jackpotInitMulti: 0, jackpotForDisplay: 0, isJackpotParty: false, isMultiJackpot: false, multiJackpots: [], multiJackpotsForDisplay: [], buyFeatures: {}, extraPays: {} },
      slotState: {},
    }),
  },

  // Housey / Bingo
  {
    match: (url) => url.includes('housey/read'),
    handler: () => ({ houseyInfo: clone(bingoState) }),
  },
  {
    match: (url) => url.includes('housey/play'),
    handler: () => {
      // Pick a random number from the grid that hasn't been drawn yet
      const allNums = bingoState.houseyArray.flat().filter((n: number) => n > 0);
      const unhit: number[] = [];
      bingoState.houseyArray.forEach((row: number[], r: number) => {
        row.forEach((num: number, c: number) => {
          if (num > 0 && bingoState.houseyHitArray[r][c] === 0) unhit.push(num);
        });
      });

      let drawnNum: number;
      if (unhit.length > 0) {
        drawnNum = unhit[Math.floor(Math.random() * unhit.length)];
      } else {
        drawnNum = Math.floor(Math.random() * 50) + 1;
      }

      // Mark hit
      bingoState.houseyArray.forEach((row: number[], r: number) => {
        row.forEach((num: number, c: number) => {
          if (num === drawnNum) bingoState.houseyHitArray[r][c] = 1;
        });
      });

      bingoState.resultNum.push(drawnNum);
      bingoState.houseyHistory.push(drawnNum);

      // Check lines
      bingoState.hitLines = [];
      for (let r = 0; r < 5; r++) {
        const rowNums = bingoState.houseyArray[r].filter((n: number) => n > 0);
        const rowHits = bingoState.houseyArray[r].filter((n: number, c: number) => n > 0 && bingoState.houseyHitArray[r][c] === 1);
        if (rowNums.length > 0 && rowNums.length === rowHits.length) {
          bingoState.hitLines.push(r);
        }
      }

      const awardInfo = bingoState.hitLines.length >= 3
        ? { awardType: 1, awardValue: 5000 }
        : bingoState.hitLines.length > 0
        ? { awardType: 1, awardValue: 500 * bingoState.hitLines.length }
        : { awardType: 0, awardValue: 0 };

      return { houseyInfo: clone(bingoState), awardInfo };
    },
  },
  {
    match: (url) => url.includes('housey/reset'),
    handler: () => {
      bingoState = clone(mockHousey.houseyInfo);
      // Regenerate random board
      const nums = Array.from({ length: 50 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
      let idx = 0;
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          // ~60% cells have numbers
          bingoState.houseyArray[r][c] = Math.random() > 0.4 ? nums[idx++] || 0 : 0;
        }
      }
      return { houseyInfo: clone(bingoState) };
    },
  },

  // Daily Mission
  {
    match: (url) => url.includes('daily_mission/list'),
    handler: () => ({
      dailyMissionInfos: clone(missionInfos),
      endDate: mockDailyMissions.endDate,
      status: missionOverallStatus,
    }),
  },
  {
    match: (url, method) => url.includes('daily_mission/collect') && !url.includes('Collect_all'),
    handler: (config) => {
      const body = config.data ? JSON.parse(config.data) : {};
      const idx: number = body.missionIndex;
      const mission = missionInfos.find((m) => m.missionIndex === idx);
      if (mission) {
        mission.status = 3; // COLLECTED
        mission.minValue = mission.maxValue; // 완료 처리
      }
      return { missionRewardType: 1, missionRewardValue: mission?.rewardValue ?? 500 };
    },
  },
  {
    match: (url) => url.includes('daily_mission/Collect_all'),
    handler: () => {
      const rewards: { missionIndex: number; missionRewardType: number; missionRewardValue: number }[] = [];
      missionInfos.forEach((m) => {
        if (m.status === 2) { // ACHIEVED → COLLECTED
          rewards.push({ missionIndex: m.missionIndex, missionRewardType: 1, missionRewardValue: m.rewardValue });
          m.status = 3;
          m.minValue = m.maxValue;
        }
      });
      return { missionRewards: rewards };
    },
  },
  {
    match: (url) => url.includes('daily_mission/complete'),
    handler: () => {
      missionOverallStatus = 3; // ALL DONE
      return { voltType: 2, voltValue: 1 };
    },
  },

  // Tournament
  {
    match: (url) => url.includes('tournament/info'),
    handler: () => ({ tournament: clone(mockLobbyData.Tournament) }),
  },
  {
    match: (url) => url.includes('tournament/history'),
    handler: () => ({ lstHistoryData: [] }),
  },
  {
    match: (url) => url.includes('tournament/ranking'),
    handler: () => ({ lstRankingData: clone(mockLobbyData.Tournament?.tournamentData.lstRankingData ?? []) }),
  },
  {
    match: (url) => url.includes('tournament/award'),
    handler: () => ({ awardData: null, lstBenefitData: [], lstRankingData: [], remainTime: 0 }),
  },

  // History
  {
    match: (url) => url.includes('history/'),
    handler: () => ({
      items: Array.from({ length: 10 }, (_, i) => ({
        idx: i + 1,
        type: 'spin',
        amount: (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 10000),
        balance: 500000 + Math.floor(Math.random() * 50000),
        description: ['Slot Spin', 'Bonus Win', 'Deposit', 'Withdrawal', 'Tournament Prize'][Math.floor(Math.random() * 5)],
        date: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      })),
      totalCount: 10,
      page: 1,
      pageSize: 50,
    }),
  },

  // Volt
  {
    match: (url) => url.includes('volt/list'),
    handler: () => clone(mockVoltList),
  },
  {
    match: (url) => url.includes('volt/open_all'),
    handler: () => ({
      voltRewards: [
        { voltType: 1, vicconReward: 3000, coinReward: 5 },
        { voltType: 1, vicconReward: 2000, coinReward: 3 },
      ],
    }),
  },
  {
    match: (url) => url.includes('volt/open'),
    handler: () => ({
      voltReward: { voltType: 1, vicconReward: 2500, coinReward: 4 },
    }),
  },

  // Ticket
  {
    match: (url) => url.includes('ticket/list'),
    handler: () => clone(mockLobbyData.gameBalanceInfo.ticketInfo),
  },
  {
    match: (url) => url.includes('ticket/use'),
    handler: () => ({ cash: 5000 }),
  },

  // Viccon
  {
    match: (url) => url.includes('viccon/game/list'),
    handler: () => clone(mockVicconGames),
  },
  {
    match: (url) => url.includes('viccon/slot/enter'),
    handler: () => ({
      userInfo: { balance: 250000 },
      slotInfo: { slotType: 100, betRange: [100, 200], lineCount: 10, payoutArray: [], reelArray: [], jackpot: 0, jackpotInitMulti: 0, jackpotForDisplay: 0, isJackpotParty: false, isMultiJackpot: false, multiJackpots: [], multiJackpotsForDisplay: [], buyFeatures: {}, extraPays: {} },
      slotState: {},
    }),
  },
  {
    match: (url) => url.includes('viccon/crash_enter'),
    handler: () => ({}),
  },

  // Crash
  {
    match: (url) => url.includes('crash/join'),
    handler: () => ({
      roundHistory: {
        roundInfo: { idx: 100, crash_time: '', game_start_time: '', hash: 'abc123', multi: 3.45, round_end_time: '', round_start_time: '' },
        userInfo: { round_idx: 100, bets: [], date: new Date().toISOString() },
      },
      userHistory: [],
    }),
  },
  {
    match: (url) => url.includes('crashgame/bet'),
    handler: () => ({}),
  },
  {
    match: (url) => url.includes('crashgame/cashout'),
    handler: () => ({ bet_idx: 0, bet_money: 1000, auto_multi: 0, out_multi: 2.5, out_money: 2500 }),
  },
  {
    match: (url) => url.includes('crashgame/cancel'),
    handler: () => ({}),
  },

  // SuprNation
  {
    match: (url) => url.includes('v1/games/categories'),
    handler: () => clone(mockCategories),
  },
  {
    match: (url) => url.includes('v1/games') && !url.includes('categories') && !url.includes('history'),
    handler: () => clone(mockGames),
  },

  // Log (silently accept)
  {
    match: (url) => url.includes('log/'),
    handler: () => ({}),
  },
];

export function setupMockInterceptor(client: import('axios').AxiosInstance) {
  client.interceptors.request.use(async (config) => {
    const url = config.url || '';
    const method = config.method || 'get';

    for (const route of routes) {
      if (route.match(url, method)) {
        await delay(200 + Math.random() * 300);
        const data = route.handler(config);

        // Abort the real request and return mock data
        const error = new Error('MOCK') as any;
        error.config = config;
        error.response = {
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          data,
        };
        error.isMock = true;
        throw error;
      }
    }

    return config;
  });

  // Intercept the mock "errors" and convert them to successful responses
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.isMock) {
        return error.response.data;
      }
      // Re-throw real errors
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error.response?.data || error.message);
    },
  );
}
