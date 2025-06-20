import React from 'react';

export type SZCheckboxProps = {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
};

export const SZCheckbox: React.FC<SZCheckboxProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  error,
  className = '',
}) => {
  const inputClasses = [
    'h-4 w-4 rounded border-gray-300 focus:ring-green-500',
    error ? 'border-red-500 focus:ring-red-500' : '',
    disabled ? 'bg-gray-100 cursor-not-allowed' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const labelClasses = [
    'text-sm font-medium',
    disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="flex items-start space-x-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={inputClasses}
      />
      <div>
        <label htmlFor={id} className={labelClasses}>
          {label}
        </label>
        {description && <p className="text-xs text-gray-500">{description}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
};
