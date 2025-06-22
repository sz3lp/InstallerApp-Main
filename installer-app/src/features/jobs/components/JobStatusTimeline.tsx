import React from "react";

export interface JobStatusTimelineProps {
  status: string;
}

const steps = ["assigned", "in_progress", "complete"];

export default function JobStatusTimeline({ status }: JobStatusTimelineProps) {
  const current = steps.indexOf(status);
  return (
    <ul className="flex gap-2 text-sm mb-4">
      {steps.map((s, i) => (
        <li key={s} className={i <= current ? "font-bold" : "text-gray-400"}>
          {s.replace(/_/g, " ")}
        </li>
      ))}
    </ul>
  );
}
