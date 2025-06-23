import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useJobs } from '../../lib/hooks/useJobs';

const CalendarPage = () => {
  const { jobs, updateJob } = useJobs();

  const handleEventDrop = async ({ event }: any) => {
    const newDate = event.start;
    await updateJob(event.id, { scheduled_date: newDate.toISOString() });
  };

  return (
    <div>
      <h2>Job Scheduling Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        editable={true}
        events={jobs.map((job) => ({
          id: job.id,
          title: job.client_name ?? 'Unnamed Job',
          start: job.scheduled_date ?? undefined,
        }))}
        eventDrop={handleEventDrop}
      />
    </div>
  );
};

export default CalendarPage;
