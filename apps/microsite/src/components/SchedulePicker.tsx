import React, { useEffect } from "react";

export interface SchedulePickerProps {
  selectedDate: string | null;
  selectedWindow: "AM" | "PM" | null;
  setSelectedDate: (date: string) => void;
  setSelectedWindow: (window: "AM" | "PM") => void;
  availableDates: string[];
}

export default function SchedulePicker({
  selectedDate,
  selectedWindow,
  setSelectedDate,
  setSelectedWindow,
  availableDates,
}: SchedulePickerProps) {
  // Set default date on mount if none selected
  useEffect(() => {
    if (!selectedDate && availableDates.length > 0) {
      setSelectedDate(availableDates[0]);
    }
  }, [selectedDate, availableDates, setSelectedDate]);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    // reset time window selection
    (setSelectedWindow as unknown as (w: "AM" | "PM" | null) => void)(null);
  };

  const handleWindowClick = (window: "AM" | "PM") => {
    setSelectedWindow(window);
  };

  const formatDay = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {availableDates.map((d) => (
          <div
            key={d}
            onClick={() => handleDateClick(d)}
            className={`rounded-lg px-4 py-2 border text-center cursor-pointer select-none hover:bg-gray-100 border-gray-300${
              selectedDate === d ? " bg-blue-600 text-white border-blue-600 font-semibold" : ""
            }`}
          >
            {formatDay(d)}
          </div>
        ))}
      </div>

      {selectedDate && (
        <div className="flex gap-2">
          {(["AM", "PM"] as const).map((w) => (
            <button
              key={w}
              onClick={() => handleWindowClick(w)}
              className={`flex-1 py-3 px-6 rounded-lg border font-medium cursor-pointer select-none text-sm transition-colors duration-200 border-gray-300 text-gray-700 hover:bg-gray-100${
                selectedWindow === w ? " bg-blue-600 text-white border-blue-600" : ""
              }`}
            >
              {w === "AM" ? "AM (8–10am)" : "PM (1–3pm)"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

