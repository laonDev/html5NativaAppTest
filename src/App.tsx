import { Routes, Route, Navigate } from 'react-router-dom';
import { ModalProvider } from './components/Modal/ModalProvider';
import { UiStatusProvider } from './components/Feedback/UiStatusProvider';
import { MainLayout } from './components/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { LobbyPage } from './pages/LobbyPage';
import { SlotPage } from './pages/SlotPage';
import { AccountPage } from './pages/AccountPage';
import { SettingPage } from './pages/SettingPage';
import { BingoPage } from './pages/BingoPage';
import { DailyMissionPage } from './pages/DailyMissionPage';
import { FigmaMissionPage } from './pages/FigmaMissionPage';
import { TournamentPage } from './pages/TournamentPage';
import { HistoryPage } from './pages/HistoryPage';
import { VicconPage } from './pages/VicconPage';
import { TicketPage } from './pages/TicketPage';
import { VoltPage } from './pages/VoltPage';
import { CrashGamePageV2 } from './pages/feature/crash/CrashGamePageV2';
import { SpineToolPage } from './pages/SpineToolPage';

export default function App() {
  return (
    <ModalProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/slot" element={<SlotPage />} />
        <Route path="/crash" element={<CrashGamePageV2 />} />
        <Route path="/mission" element={<DailyMissionPage />} />
        <Route path="/figma-mission" element={<FigmaMissionPage />} />
        <Route path="/spine-tool" element={<SpineToolPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/setting" element={<SettingPage />} />
        <Route element={<MainLayout />}>
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/bingo" element={<BingoPage />} />
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
