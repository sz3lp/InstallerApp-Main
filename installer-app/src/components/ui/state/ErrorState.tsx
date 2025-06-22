import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

export type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
  icon?: React.ReactNode;
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Something went wrong',
  onRetry,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow">
      <div className="text-red-500 mb-4 text-4xl">
        {icon ?? <FaExclamationCircle />}
      </div>
      <p className="text-gray-700 mb-3">{message}</p>
      {onRetry && (
        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );
};
