import React from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop, { withDragAndDropProps } from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export interface JobEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  assignedTo: string | null;
}

export interface JobCalendarProps {
  events: JobEvent[];
  onEventDrop?: (event: JobEvent, start: Date) => void;
  editable?: boolean;
}

const statusColors: Record<string, string> = {
  assigned: '#3b82f6',
  in_progress: '#f59e0b',
  needs_qa: '#f97316',
  complete: '#10b981',
  rework: '#ef4444',
};

const DnDCalendar = withDragAndDrop(Calendar as React.ComponentType<withDragAndDropProps<JobEvent>>);

export const JobCalendar: React.FC<JobCalendarProps> = ({ events, onEventDrop, editable = true }) => {
  return (
    <DnDCalendar
      localizer={localizer}
      events={events}
      defaultView={Views.WEEK}
      views={[Views.WEEK, Views.MONTH]}
      style={{ height: '80vh' }}
      onEventDrop={({ event, start }) => onEventDrop?.(event as JobEvent, start)}
      resizable={false}
      draggableAccessor={(event) => editable && !!event.assignedTo}
      eventPropGetter={(event) => {
        const bg = statusColors[event.status] || '#6b7280';
        return { style: { backgroundColor: bg, borderColor: bg } };
      }}
    />
  );
};

export default JobCalendar;
