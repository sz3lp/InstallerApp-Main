import React from 'react';

export type SZInputProps = {
  id: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
};

export const SZInput: React.FC<SZInputProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  className = '',
}) => {
  const baseClasses = [
    'block w-full rounded border px-3 py-2 focus:outline-none focus:ring-2',
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
      <input
        type="text"
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={baseClasses}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
