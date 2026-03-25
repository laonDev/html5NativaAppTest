import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

type ScrollDirection = 'vertical' | 'horizontal' | 'both';

type ScrollViewProps = {
  children: ReactNode;
  direction?: ScrollDirection;
  hideScrollbar?: boolean;
  safeBottom?: boolean;
} & HTMLAttributes<HTMLDivElement>;

function joinClassName(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ');
}

const DIRECTION_CLASSES: Record<ScrollDirection, string> = {
  vertical: 'overflow-y-auto overflow-x-hidden',
  horizontal: 'overflow-x-auto overflow-y-hidden',
  both: 'overflow-auto',
};

export function ScrollView({
  children,
  direction = 'vertical',
  hideScrollbar = true,
  safeBottom = false,
  className,
  style,
  ...rest
}: ScrollViewProps) {
  const mergedStyle: CSSProperties = {
    ...(hideScrollbar ? { scrollbarWidth: 'none' as const } : {}),
    ...(safeBottom ? { paddingBottom: 'calc(16px + var(--safe-bottom))' } : {}),
    ...style,
  };

  return (
    <div
      {...rest}
      data-scrollbar={hideScrollbar ? 'hidden' : 'visible'}
      className={joinClassName(DIRECTION_CLASSES[direction], className)}
      style={mergedStyle}
    >
      {children}
    </div>
  );
}
