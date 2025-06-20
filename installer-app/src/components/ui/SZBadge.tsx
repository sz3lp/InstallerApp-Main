import React from 'react';

export type SZBadgeProps = {
  label: string;
  variant: 'blue' | 'yellow' | 'orange' | 'green' | 'red' | 'gray';
  rounded?: boolean;
  className?: string;
};

const variantClasses: Record<NonNullable<SZBadgeProps['variant']>, string> = {
  blue: 'bg-blue-100 text-blue-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  orange: 'bg-orange-100 text-orange-800',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-800',
};

export const SZBadge: React.FC<SZBadgeProps> = ({
  label,
  variant,
  rounded = false,
  className = '',
}) => {
  const classes = [
    'inline-block px-2 py-1 text-xs font-semibold',
    rounded ? 'rounded-full' : 'rounded-sm',
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{label}</span>;
};

