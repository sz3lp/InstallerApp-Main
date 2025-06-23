import React from "react";

export interface DateRange {
  start: string;
  end: string;
}

export interface DateRangeFilterProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ value, onChange }) => {
  return (
    <div className="flex gap-2">
      <div>
        <label className="block text-sm font-medium" htmlFor="start-date">
          From
        </label>
        <input
          id="start-date"
          type="date"
          className="border rounded px-2 py-1"
          value={value.start}
          onChange={(e) => onChange({ ...value, start: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="end-date">
          To
        </label>
        <input
          id="end-date"
          type="date"
          className="border rounded px-2 py-1"
          value={value.end}
          onChange={(e) => onChange({ ...value, end: e.target.value })}
        />
      </div>
    </div>
  );
};

export default DateRangeFilter;
