import React from 'react';

export type SZCardProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  elevation?: 0 | 1 | 2;
  className?: string;
};

const shadowMap: Record<NonNullable<SZCardProps['elevation']>, string> = {
  0: 'shadow-none',
  1: 'shadow-md',
  2: 'shadow-xl',
};

export const SZCard: React.FC<SZCardProps> = ({
  children,
  header,
  footer,
  elevation = 1,
  className = '',
}) => {
  const shadow = shadowMap[elevation];

  return (
    <div className={`bg-white rounded p-4 ${shadow} ${className}`.trim()}>
      {header && <div className="mb-2">{header}</div>}
      <div>{children}</div>
      {footer && <div className="mt-2">{footer}</div>}
    </div>
  );
};

export default SZCard;
