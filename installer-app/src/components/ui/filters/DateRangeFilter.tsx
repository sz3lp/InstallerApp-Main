import React from "react";
import { SZInput } from "../SZInput";

export interface DateRange {
  start: string;
  end: string;
}

export interface DateRangeFilterProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <SZInput
        id="start"
        type="date"
        label="From"
        value={value.start}
        onChange={(v) => onChange({ ...value, start: v })}
      />
      <SZInput
        id="end"
        type="date"
        label="To"
        value={value.end}
        onChange={(v) => onChange({ ...value, end: v })}
      />
    </div>
  );
};

export default DateRangeFilter;
