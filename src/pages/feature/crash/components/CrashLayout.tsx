import '../styles/crash.css';

import { CrashHeader } from './CrashHeader';
import { CrashPlayField } from './CrashPlayField';
import { CrashBottomSheet } from './CrashBottomSheet';

export function CrashLayout() {
  return (
    <div className="crash-layout">
      <CrashHeader />
      
      <CrashBottomSheet />
    </div>
  );
}