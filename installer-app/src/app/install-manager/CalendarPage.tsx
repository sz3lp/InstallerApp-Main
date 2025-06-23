import React, { useMemo, useState } from 'react';
import useJobs from '../../lib/hooks/useJobs';
import useInstallers from '../../lib/hooks/useInstallers';
import { JobCalendar, JobEvent } from '../../components/calendar/JobCalendar';
import { useAuth } from '../../lib/hooks/useAuth';

const CalendarPage: React.FC = () => {
  const { jobs, updateScheduledDate, loading } = useJobs();
  const { installers } = useInstallers();
  const { role } = useAuth();
  const [filter, setFilter] = useState<string>('all');

  const events = useMemo(() => {
    return jobs
      .filter((j) => filter === 'all' || j.assigned_to === filter)
      .map<JobEvent>((j) => ({
        id: j.id,
        title: j.address,
        start: j.scheduled_date ? new Date(j.scheduled_date) : new Date(),
        end: j.scheduled_date ? new Date(j.scheduled_date) : new Date(),
        status: j.status,
        assignedTo: j.assigned_to,
      }));
  }, [jobs, filter]);

  const canEdit = role === 'Manager' || role === 'Admin';

  const handleDrop = async (event: JobEvent, start: Date) => {
    const dateStr = start.toISOString().slice(0, 10);
    await updateScheduledDate(event.id, dateStr);
  };

  return (
    <div className="p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Job Schedule</h1>
        <div>
          <label htmlFor="installer" className="mr-2 text-sm font-medium">
            Filter Installer
          </label>
          <select
            id="installer"
            className="border rounded px-2 py-1"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            {installers.map((i) => (
              <option key={i.id} value={i.id}>
                {i.full_name || i.id}
              </option>
            ))}
          </select>
        </div>
      </header>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <JobCalendar events={events} editable={canEdit} onEventDrop={handleDrop} />
      )}
    </div>
  );
};

export default CalendarPage;
