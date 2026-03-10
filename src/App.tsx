import { Routes, Route, Navigate } from 'react-router-dom';
import { ModalProvider } from './components/Modal/ModalProvider';
import { MainLayout } from './components/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { LobbyPage } from './pages/LobbyPage';
import { SlotPage } from './pages/SlotPage';
import { AccountPage } from './pages/AccountPage';
import { BingoPage } from './pages/BingoPage';
import { DailyMissionPage } from './pages/DailyMissionPage';
import { TournamentPage } from './pages/TournamentPage';
import { HistoryPage } from './pages/HistoryPage';
import { VicconPage } from './pages/VicconPage';
import { TicketPage } from './pages/TicketPage';
import { VoltPage } from './pages/VoltPage';
import { CrashGamePage } from './pages/CrashGamePage';

export default function App() {
  return (
    <ModalProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/slot" element={<SlotPage />} />
        <Route path="/crash" element={<CrashGamePage />} />
        <Route element={<MainLayout />}>
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/bingo" element={<BingoPage />} />
          <Route path="/mission" element={<DailyMissionPage />} />
          <Route path="/tournament" element={<TournamentPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/viccon" element={<VicconPage />} />
          <Route path="/ticket" element={<TicketPage />} />
          <Route path="/volt" element={<VoltPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ModalProvider>
  );
}
