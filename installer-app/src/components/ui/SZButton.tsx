import React from 'react';

export type SZButtonProps = {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
};

const baseStyles =
  'inline-flex items-center justify-center rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

const variantStyles: Record<NonNullable<SZButtonProps['variant']>, string> = {
  primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  secondary:
    'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-gray-200',
  destructive:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
};

const sizeStyles: Record<NonNullable<SZButtonProps['size']>, string> = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const SZButton: React.FC<SZButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  children,
  onClick,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) {
      e.preventDefault();
      return;
    }
    onClick?.();
  };

  const classes = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? 'w-full' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      role="button"
      aria-disabled={disabled || isLoading ? 'true' : undefined}
      disabled={disabled || isLoading}
      className={classes}
      onClick={handleClick}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 mr-2 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default SZButton;
