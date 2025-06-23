import React from 'react';

export interface EmptyStateProps {
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => (
  <div className="text-center text-gray-500 py-6">{message}</div>
);

export default EmptyState;
