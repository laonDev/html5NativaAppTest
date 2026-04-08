import type { BottomTab } from '../types/crashUI';

interface BottomTabBarProps {
  activeTab: BottomTab;
  isExpanded: boolean;
  onChangeTab: (tab: BottomTab) => void;
  onToggle: () => void;
}

const tabs: BottomTab[] = ['all', 'top', 'my'];

export function BottomTabBar({
  activeTab,
  isExpanded,
  onChangeTab,
  onToggle,
}: BottomTabBarProps) {
  return (
    <div className="bottom-tab-bar">
      <div className="bottom-tab-buttons">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`bottom-tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => onChangeTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <button className="bottom-toggle-button" onClick={onToggle}>
        {isExpanded ? '⌄' : '⌃'}
      </button>
    </div>
  );
}