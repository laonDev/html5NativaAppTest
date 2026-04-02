import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from './Header/Header';
import { BottomNav } from './BottomNav';
import { MissionClearToast } from './MissionClearToast/MissionClearToast';

export function MainLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="relative flex-1 overflow-hidden">
        {/* 미션 클리어 토스트 — 탭 시 미션 페이지로 이동 */}
        <MissionClearToast onTap={() => navigate('/mission')} />
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
