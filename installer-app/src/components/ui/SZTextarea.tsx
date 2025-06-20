import React from 'react';

export type SZTextareaProps = {
  id: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
  rows?: number;
};

export const SZTextarea: React.FC<SZTextareaProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  className = '',
  rows = 3,
}) => {
  const baseClasses = [
    'block w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2',
    error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500',
    disabled ? 'bg-gray-100 cursor-not-allowed' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={baseClasses}
        rows={rows}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

