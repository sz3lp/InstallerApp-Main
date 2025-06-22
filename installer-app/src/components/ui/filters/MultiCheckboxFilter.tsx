import React from "react";
import { SZCheckbox } from "../SZCheckbox";

export interface Option {
  label: string;
  value: string;
}

export interface MultiCheckboxFilterProps {
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
}

export const MultiCheckboxFilter: React.FC<MultiCheckboxFilterProps> = ({
  options,
  values,
  onChange,
}) => {
  const toggle = (val: string, checked: boolean) => {
    if (checked) {
      onChange([...values, val]);
    } else {
      onChange(values.filter((v) => v !== val));
    }
  };

  return (
    <div className="space-y-2">
      {options.map((o) => (
        <SZCheckbox
          key={o.value}
          id={o.value}
          label={o.label}
          checked={values.includes(o.value)}
          onChange={(c) => toggle(o.value, c)}
        />
      ))}
    </div>
  );
};

export default MultiCheckboxFilter;
