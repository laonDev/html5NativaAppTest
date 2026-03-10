import type {
  ServerInfo,
  AuthInfo,
  LoginResult,
  GetUserAccountResponse,
  GamesCategories,
  GamesResult,
  HouseyReadResponse,
  DailyMissionGetResponse,
  VoltListResponse,
  VicconSlotListResponse,
} from '@/types';

export const mockServerInfo: ServerInfo = {
  status: 1,
  message: 'OK',
  version: '1.0.0',
  multiServerUrl: 'http://localhost:3000',
  suprStompUrl: 'ws://localhost:3000/ws',
};

export const mockAuthInfo: AuthInfo = {
  authid: 'guest_001',
  accountidx: 1,
  auth_platform: 'guest',
};

export const mockLoginResult: LoginResult = {
  authid: 'guest_001',
  accountidx: 1,
  token: 'mock-jwt-token-12345',
  server_group: 1,
  useridx: 1001,
};

export const mockLobbyData: GetUserAccountResponse = {
  userInfo: {
    id: 'guest_001',
    profileUrl: '',
    email: '',
    nickname: 'Guest Player',
    gender: '',
    lastName: '',
    firstName: '',
    birthDate: '',
    adress: '',
    currency: 'GBP',
    phoneNumber: '',
  },
  balanceInfo: {
    cash: 500000,
    bonus: 100000,
  },
  gameBalanceInfo: {
    coinInfo: { viccon: 250000, coin: 150 },
    voltInfo: [
      { voltType: 1, count: 5 },
      { voltType: 2, count: 3 },
      { voltType: 3, count: 1 },
      { voltType: 4, count: 0 },
    ],
    ticketInfo: {
      gauge: 350,
      maxGauge: 1000,
      level: 2,
      ticketList: [
        { ticketIdx: 1, ticketType: 1, ticketName: 'Bronze Ticket', imgUrl: '', value: 5000, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000 * 7).toISOString() },
        { ticketIdx: 2, ticketType: 2, ticketName: 'Silver Ticket', imgUrl: '', value: 15000, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000 * 7).toISOString() },
      ],
    },
  },
  dailyMissionInfo: {
    dailyMissionInfos: [
      { missionIndex: 1, name: 'Spin Master', content: 'Spin 10 times on any slot', minValue: 4, maxValue: 10, target: 10, status: 1, missionType: 1, rewardValue: 500, rewardType: 1 },
      { missionIndex: 2, name: 'Bingo Fan', content: 'Draw 5 times in Bingo', minValue: 5, maxValue: 5, target: 5, status: 2, missionType: 2, rewardValue: 300, rewardType: 1 },
      { missionIndex: 3, name: 'Viccon Player', content: 'Play 3 Viccon games', minValue: 1, maxValue: 3, target: 3, status: 1, missionType: 3, rewardValue: 200, rewardType: 2 },
      { missionIndex: 4, name: 'Volt Opener', content: 'Open 2 Volts', minValue: 0, maxValue: 2, target: 2, status: 1, missionType: 4, rewardValue: 1, rewardType: 3 },
      { missionIndex: 5, name: 'Crash Pilot', content: 'Play 1 Crash game', minValue: 0, maxValue: 1, target: 1, status: 1, missionType: 5, rewardValue: 1000, rewardType: 1 },
    ],
    endDate: new Date(Date.now() + 43200000).toISOString(),
    status: 1,
  },
  Tournament: {
    tournamentData: {
      tournamentId: 101,
      bannerUrl: '',
      startDate: new Date(Date.now() - 86400000).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      lstBenefitData: [
        { benefitId: 1, rankingRangeStart: 1, rankingRangeEnd: 1, prizeType: 1, prizeMoney: 100000 },
        { benefitId: 2, rankingRangeStart: 2, rankingRangeEnd: 3, prizeType: 1, prizeMoney: 50000 },
        { benefitId: 3, rankingRangeStart: 4, rankingRangeEnd: 10, prizeType: 2, prizeMoney: 20000 },
      ],
      lstRankingData: Array.from({ length: 20 }, (_, i) => ({
        userId: 1000 + i,
        userName: `Player${i + 1}`,
        profileUrl: '',
        rank: i + 1,
        point: Math.floor(Math.random() * 50000) + 1000,
        targetBenefit: { benefitId: 1, rankingRangeStart: 1, rankingRangeEnd: 1, prizeType: 1, prizeMoney: 100000 },
      })).sort((a, b) => b.point - a.point).map((p, i) => ({ ...p, rank: i + 1 })),
    },
    currentUserData: {
      received: 0,
      rankingData: { userId: 1001, userName: 'Guest Player', profileUrl: '', rank: 12, point: 3500, targetBenefit: { benefitId: 3, rankingRangeStart: 4, rankingRangeEnd: 10, prizeType: 2, prizeMoney: 20000 } },
    },
  },
  houseyEndDate: new Date(Date.now() + 3600000).toISOString(),
};

export const mockCategories: GamesCategories = {
  categories: [
    { name: 'Hot', slug: 'hot', 'game-ids': [1, 2, 3, 4, 5], 'also-show-latest-games': false, 'also-show-others-in-group': false, 'live-update': false, 'requires-login': false, 'also-show-on-top-of-page': false },
    { name: 'Slot', slug: 'slot', 'game-ids': [1, 2, 3, 6, 7, 8, 9], 'also-show-latest-games': false, 'also-show-others-in-group': false, 'live-update': false, 'requires-login': false, 'also-show-on-top-of-page': false },
    { name: 'Live', slug: 'live', 'game-ids': [10, 11, 12], 'also-show-latest-games': false, 'also-show-others-in-group': false, 'live-update': true, 'requires-login': true, 'also-show-on-top-of-page': false },
    { name: 'Promo', slug: 'promo', 'game-ids': [4, 5, 13], 'also-show-latest-games': false, 'also-show-others-in-group': false, 'live-update': false, 'requires-login': false, 'also-show-on-top-of-page': true },
  ],
};

const GAME_TITLES = [
  'Starburst', 'Book of Dead', 'Gonzo\'s Quest', 'Mega Moolah', 'Sweet Bonanza',
  'Wolf Gold', 'Fire Joker', 'Reactoonz', 'Dead or Alive 2', 'Lightning Roulette',
  'Crazy Time', 'Monopoly Live', 'Rise of Merlin', 'Gates of Olympus', 'Big Bass Bonanza',
];

export const mockGames: GamesResult = {
  games: Object.fromEntries(
    GAME_TITLES.map((title, i) => [
      String(i + 1),
      {
        'game-id': i + 1,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title,
        'game-Image': { src: { name: '', ext: [] }, srcset: [] },
        'player-capabilities': ['real-play'],
        new: i % 5 === 0,
        'is-duelz-enabled': false,
      },
    ]),
  ),
};

export const mockHousey: HouseyReadResponse = {
  houseyInfo: {
    houseyHistory: [12, 34, 7, 45],
    houseyArray: [
      [3, 0, 22, 0, 41],
      [8, 17, 0, 33, 0],
      [0, 14, 25, 0, 48],
      [6, 0, 29, 38, 0],
      [0, 11, 0, 36, 44],
    ],
    houseyHitArray: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    hitLines: [],
    type: 1,
    resultNum: [],
    activated: 1,
    endTime: new Date(Date.now() + 3600000).toISOString(),
  },
};

export const mockDailyMissions: DailyMissionGetResponse = mockLobbyData.dailyMissionInfo;

export const mockVoltList: VoltListResponse = {
  voltInfo: mockLobbyData.gameBalanceInfo.voltInfo,
};

export const mockVicconGames: VicconSlotListResponse = {
  games: [
    { gameType: 1, slotIdx: 100, slotType: 100, title: 'Viccon Slot A', imgUrl: '' },
    { gameType: 1, slotIdx: 101, slotType: 101, title: 'Viccon Slot B', imgUrl: '' },
    { gameType: 2, slotIdx: 200, slotType: 200, title: 'Crash Game', imgUrl: '' },
  ],
};
