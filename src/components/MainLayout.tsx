import { Outlet } from 'react-router-dom';
import { Header } from './Header/Header';
import { BottomNav } from './BottomNav';

export function MainLayout() {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
