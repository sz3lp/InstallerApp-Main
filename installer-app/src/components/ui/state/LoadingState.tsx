import React from 'react';

export type LoadingStateProps = {
  type?: 'list' | 'detail' | 'inline';
  message?: string;
};

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'inline',
  message,
}) => {
  if (type === 'inline') {
    return (
      <div className="flex items-center justify-center p-4" aria-label="Loading">
        <svg
          className="animate-spin h-5 w-5 text-gray-500 mr-2"
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
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        {message && <span className="text-gray-500 text-sm">{message}</span>}
      </div>
    );
  }

  const rows = type === 'list' ? 5 : 3;
  return (
    <div className="space-y-2 p-4 animate-pulse" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded w-full"
          style={{ height: type === 'detail' ? '1.5rem' : '1rem' }}
        />
      ))}
    </div>
  );
};
