import type { ReactNode } from 'react';

type ListItemTone = 'default' | 'danger';

interface ListItemProps {
  title: ReactNode;
  subtitle?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: ListItemTone;
  className?: string;
}

function joinClassName(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ');
}

export function ListItem({
  title,
  subtitle,
  left,
  right,
  onClick,
  disabled = false,
  tone = 'default',
  className,
}: ListItemProps) {
  const textTone = tone === 'danger' ? 'text-red-300' : 'text-white';
  const baseClassName = joinClassName(
    'flex w-full items-center gap-3 rounded-xl bg-[#16213e] p-4 text-left transition-colors',
    onClick && !disabled && 'active:bg-[#1c2a52]',
    disabled && 'cursor-not-allowed opacity-50',
    className,
  );

  const content = (
    <>
      {left ? <div className="shrink-0">{left}</div> : null}
      <div className="min-w-0 flex-1">
        <p className={joinClassName('truncate text-sm font-medium', textTone)}>{title}</p>
        {subtitle ? <p className="mt-0.5 truncate text-xs text-gray-400">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0 text-gray-500">{right}</div> : null}
    </>
  );

  if (!onClick) {
    return <div className={baseClassName}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={baseClassName}
    >
      {content}
    </button>
  );
}
