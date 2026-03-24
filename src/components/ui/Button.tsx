import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonState = 'default' | 'active' | 'disabled' | 'loading';

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
  loading?: boolean;
  loadingLabel?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  bgImage?: string;
  bgImageActive?: string;
  bgImageDisabled?: string;
  bgSize?: CSSProperties['backgroundSize'];
  bgPosition?: CSSProperties['backgroundPosition'];
  bgRepeat?: CSSProperties['backgroundRepeat'];
} & ButtonHTMLAttributes<HTMLButtonElement>;

function joinClassName(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ');
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-[#e94560] text-white',
  secondary: 'bg-[#0f3460] text-white',
  ghost: 'bg-[#1a1a2e] text-gray-300 hover:text-white',
  text: 'bg-transparent text-gray-400 hover:text-white',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-3 text-sm font-bold',
};

export function Button({
  variant = 'primary',
  size = 'md',
  active = false,
  loading = false,
  loadingLabel = '...',
  leftIcon,
  rightIcon,
  fullWidth = false,
  bgImage,
  bgImageActive,
  bgImageDisabled,
  bgSize = 'cover',
  bgPosition = 'center',
  bgRepeat = 'no-repeat',
  disabled,
  className,
  style,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const state: ButtonState = loading ? 'loading' : isDisabled ? 'disabled' : active ? 'active' : 'default';
  const resolvedBgImage =
    (isDisabled && bgImageDisabled) || (active && bgImageActive) || bgImage;
  const mergedStyle: CSSProperties = {
    ...(resolvedBgImage
      ? {
          backgroundImage: `url(${resolvedBgImage})`,
          backgroundSize: bgSize,
          backgroundPosition: bgPosition,
          backgroundRepeat: bgRepeat,
        }
      : {}),
    ...style,
  };

  return (
    <button
      {...rest}
      type={rest.type ?? 'button'}
      disabled={isDisabled}
      aria-busy={loading}
      aria-pressed={active ? true : undefined}
      data-active={active ? 'true' : 'false'}
      data-state={state}
      className={joinClassName(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && 'w-full',
        active && variant === 'ghost' && 'bg-[#e94560] text-white',
        variant === 'text' && '!px-0 !py-0 rounded-none font-medium',
        className,
      )}
      style={mergedStyle}
    >
      {leftIcon ? <span className="inline-flex items-center">{leftIcon}</span> : null}
      <span>{loading ? loadingLabel : children}</span>
      {rightIcon ? <span className="inline-flex items-center">{rightIcon}</span> : null}
    </button>
  );
}
