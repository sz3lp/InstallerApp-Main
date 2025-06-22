import React from 'react';
import { FaInbox } from 'react-icons/fa';

export type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow">
      <div className="text-gray-400 mb-4 text-4xl">
        {icon ?? <FaInbox />}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-gray-500 text-sm mb-3">{description}</p>}
      {actionLabel && onAction && (
        <button
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
