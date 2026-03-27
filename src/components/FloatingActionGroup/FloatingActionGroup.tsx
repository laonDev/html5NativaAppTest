import type { ReactNode } from 'react';

interface FloatingActionItem {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

interface FloatingActionGroupProps {
  items: FloatingActionItem[];
  bottomOffset?: string;
}

export function FloatingActionGroup({ items, bottomOffset = 'calc(72px + var(--safe-bottom))' }: FloatingActionGroupProps) {
  return (
    <div className="fixed right-3 z-30 flex flex-col gap-2" style={{ bottom: bottomOffset }}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={item.onClick}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#7d85a8]/30 bg-[#2f3448]/90 text-xl text-[#f2f5ff] shadow-[0_4px_12px_rgba(0,0,0,0.45)] backdrop-blur-[1px] transition-transform active:scale-95"
          aria-label={item.label}
          title={item.label}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}
