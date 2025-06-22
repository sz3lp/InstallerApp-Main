import React, { useState } from "react";
import { SZButton } from "../../components/ui/SZButton";
import { SZTable } from "../../components/ui/SZTable";

interface Log {
  id: string;
  date: string;
  job: string;
  duration: string;
}

const TimeTrackingPanel: React.FC = () => {
  const [clockedIn, setClockedIn] = useState(false);
  const [start, setStart] = useState<number | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);

  const toggleClock = () => {
    if (clockedIn) {
      const end = Date.now();
      if (start) {
        const mins = Math.round((end - start) / 60000);
        setLogs((ls) => [
          ...ls,
          {
            id: Date.now().toString(),
            date: new Date(start).toLocaleString(),
            job: "General",
            duration: `${mins}m`,
          },
        ]);
      }
      setStart(null);
      setClockedIn(false);
    } else {
      setStart(Date.now());
      setClockedIn(true);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <SZButton onClick={toggleClock}>
        {clockedIn ? "Clock Out" : "Clock In"}
      </SZButton>
      <SZTable headers={["Date", "Job", "Duration"]}>
        {logs.map((l) => (
          <tr key={l.id} className="border-t">
            <td className="p-2 border">{l.date}</td>
            <td className="p-2 border">{l.job}</td>
            <td className="p-2 border">{l.duration}</td>
          </tr>
        ))}
      </SZTable>
    </div>
  );
};

export default TimeTrackingPanel;
