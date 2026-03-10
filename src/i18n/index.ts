import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      login: { title: 'Welcome', guest_login: 'Play as Guest', version: 'Version' },
      header: { balance: 'Balance', volt: 'Volt', profile: 'Profile' },
      lobby: { home: 'Home', hot: 'Hot', slot: 'Slot', live: 'Live', promo: 'Promo', myPick: 'My Pick', search: 'Search games...', filter: 'Filter', noGames: 'No games found' },
      bingo: { title: 'Bingo', draw: 'DRAW', bronze: 'Bronze', silver: 'Silver', gold: 'Gold', fullHouse: 'Full House!', lineComplete: 'Line Complete!' },
      mission: { title: 'Daily Mission', collect: 'Collect', collectAll: 'Collect All', complete: 'Complete', completed: 'Completed' },
      tournament: { title: 'Tournament', present: 'Present', previous: 'Previous', leaderboard: 'Leaderboard', reward: 'Reward', rank: 'Rank', points: 'Points' },
      account: { title: 'My Account', profile: 'Profile', history: 'Earned', nickname: 'Nickname', save: 'Save' },
      history: { cash: 'Cash', bonus: 'Bonus', viccon: 'Viccon', ticket: 'Ticket' },
      viccon: { title: 'Viccon', slot: 'Slot', crash: 'Crash' },
      ticket: { title: 'Ticket', use: 'Use Ticket', gauge: 'Gauge' },
      volt: { title: 'Volt', open: 'Open', openAll: 'Open All', common: 'Common', prime: 'Prime', elite: 'Elite', luxe: 'Luxe' },
      crash: { title: 'Crash', bet: 'Bet', cashOut: 'Cash Out', waiting: 'Waiting...', starting: 'Starting...', crashed: 'Crashed!' },
      common: { loading: 'Loading...', error: 'An error occurred', retry: 'Retry', ok: 'OK', cancel: 'Cancel' },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
