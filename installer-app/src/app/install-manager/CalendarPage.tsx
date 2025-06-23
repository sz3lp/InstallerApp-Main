
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import React, { useMemo, useState } from "react";
import useJobs from "../../lib/hooks/useJobs";
import useInstallers from "../../lib/hooks/useInstallers";
import { JobCalendar, JobEvent } from "../../components/calendar/JobCalendar";
import { useAuth } from "../../lib/hooks/useAuth";
import { LoadingState } from "../../components/states";
import supabase from "../../lib/supabaseClient";


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
        <LoadingState />
      ) : (
        <JobCalendar
          events={events}
          editable={canEdit}
          onEventDrop={handleDrop}
        />
      )}
      {toast && (
        <div
          className={`fixed top-4 right-4 text-white px-4 py-2 rounded ${toast.success ? "bg-green-600" : "bg-red-600"}`}
        >
          {toast.message}
        </div>
      )}

    </div>
    </div>
  );
};

export default CalendarPage;
