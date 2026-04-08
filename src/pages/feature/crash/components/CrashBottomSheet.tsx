import '../styles/crash.css';

import { BetPanel } from './BetPanel';
import { BetMiniPanel } from './BetMiniPanel';
import { BottomTabBar } from './BottomTabBar';
import { AllTab } from '../tab/AllTab';
import { TopTab } from '../tab/TopTab';
import { MyTab } from '../tab/MyTab';
import { useCrashUIStore } from '../store/useCrashUIStore';

export function CrashBottomSheet() {
  const {
    bottomSheetState,
    activeTab,
    betSlots,
    toggleBottomSheet,
    setActiveTab,
  } = useCrashUIStore();

  const isExpanded = bottomSheetState === 'expanded';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'all':
        return <AllTab />;
      case 'top':
        return <TopTab />;
      case 'my':
        return <MyTab />;
      default:
        return null;
    }
  };

  return (
    <div className={`crash-bottom-sheet ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="crash-bottom-sheet-inner">
        {isExpanded ? (
          <>
            <div className="total-bets-box">Total bets: 00/00</div>

            <div className="bet-panel-list">
              {betSlots.map((slot) => (
                <BetPanel key={slot.id} slot={slot} />
              ))}
            </div>
          </>
        ) : (
          <div className="bet-mini-panel-list">
            {betSlots.map((slot) => (
              <BetMiniPanel key={slot.id} slot={slot} />
            ))}
          </div>
        )}

        <BottomTabBar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onToggle={toggleBottomSheet}
          isExpanded={isExpanded}
        />

        {isExpanded && <div className="bottom-tab-content">{renderTabContent()}</div>}
      </div>
    </div>
  );
}