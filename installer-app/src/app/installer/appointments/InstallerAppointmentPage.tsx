import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../lib/hooks/useAuth";
import useInstallerAppointments from "../../lib/hooks/useInstallerAppointments";
import JobStatusBadge from "../../components/JobStatusBadge";

const InstallerAppointmentPage: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const { appointments, loading } = useInstallerAppointments(userId);

  const today = new Date();
  const isPast = (dateStr: string) => new Date(dateStr) < new Date(today.toDateString());

  const upcoming = appointments.filter((a) => !isPast(a.start_time));
  const past = appointments.filter((a) => isPast(a.start_time));

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Appointments</h1>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Today & Upcoming</h2>
        {upcoming.length === 0 ? (
          <p>No upcoming appointments.</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((a) => (
              <li
                key={a.id}
                className="p-2 border rounded flex justify-between items-center"
              >
                <Link to={`/installer/jobs/${a.id}`} className="flex flex-col">
                  <span className="font-medium">{a.clinic_name}</span>
                  <span className="text-sm text-gray-600">{formatDate(a.start_time)}</span>
                </Link>
                <JobStatusBadge status={a.status as any} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Completed & Past</h2>
        {past.length === 0 ? (
          <p>No past jobs.</p>
        ) : (
          <ul className="space-y-2">
            {past.map((a) => (
              <li
                key={a.id}
                className="p-2 border rounded flex justify-between items-center"
              >
                <Link to={`/installer/jobs/${a.id}`} className="flex flex-col">
                  <span className="font-medium">{a.clinic_name}</span>
                  <span className="text-sm text-gray-600">{formatDate(a.start_time)}</span>
                </Link>
                <JobStatusBadge status={a.status as any} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default InstallerAppointmentPage;
