import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useBalanceStore, formatBalance } from '@/stores/balanceStore';
import { accountApi } from '@/api/rest';
import { Button } from '@/components/ui/Button';
import { ListItem } from '@/components/ListItem/ListItem';

export function AccountPage() {
  const navigate = useNavigate();
  const userInfo = useAuthStore((s) => s.userInfo);
  const logout = useAuthStore((s) => s.logout);
  const balance = useBalanceStore((s) => s.balance);
  const viccon = useBalanceStore((s) => s.viccon);
  const [nickname, setNickname] = useState(userInfo?.nickname || '');
  const [editing, setEditing] = useState(false);

  const handleSaveNickname = async () => {
    try {
      await accountApi.checkNicknameDuplication(nickname);
      await accountApi.changeNickname(nickname);
      useAuthStore.getState().setUserInfo({ ...userInfo!, nickname });
      setEditing(false);
    } catch (err) {
      console.error('Nickname change error:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#16213e] px-4 py-3">
        <Button onClick={() => navigate(-1)} variant="text" size="sm">← Back</Button>
        <h2 className="text-lg font-bold">My Account</h2>
        <div className="w-12" />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Profile Card */}
        <div className="mb-6 rounded-xl bg-[#16213e] p-6 text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#0f3460]">
            {userInfo?.profileUrl ? (
              <img src={userInfo.profileUrl} alt="profile" className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl">👤</span>
            )}
          </div>

          {editing ? (
            <div className="flex items-center justify-center gap-2">
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="rounded-lg bg-[#1a1a2e] px-3 py-1.5 text-sm text-white outline-none"
                maxLength={20}
              />
              <Button onClick={handleSaveNickname} variant="primary" size="sm">Save</Button>
              <Button onClick={() => setEditing(false)} variant="text" size="sm">Cancel</Button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="text-lg font-bold">
              {userInfo?.nickname || 'Guest'}
              <span className="ml-2 text-xs text-gray-400">✏️</span>
            </button>
          )}
        </div>

        {/* Balance Info */}
        <div className="mb-4 rounded-xl bg-[#16213e] p-4">
          <h3 className="mb-3 text-sm font-medium text-gray-400">Balance</h3>
          <div className="ui-section-stack">
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Cash + Bonus</span>
              <span className="font-bold text-yellow-400">{formatBalance(balance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Viccon</span>
              <span className="font-bold text-purple-400">{(viccon / 1000).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="ui-section-stack">
          <ListItem
            onClick={() => navigate('/history')}
            title="Earned History"
            subtitle="View cash, bonus and ticket history"
            right="→"
          />
          <Button
            onClick={handleLogout}
            variant="secondary"
            size="lg"
            fullWidth
            className="!rounded-xl"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
