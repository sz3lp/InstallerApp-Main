import React from "react";
import { JobDetail } from "../jobService";

export interface ClientInfoCardProps {
  job: JobDetail;
}

export default function ClientInfoCard({ job }: ClientInfoCardProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
      <div>
        <p className="font-semibold">Install Date</p>
        <p>{job.installDate}</p>
      </div>
      <div>
        <p className="font-semibold">Location</p>
        <p>{job.location}</p>
      </div>
      <div>
        <p className="font-semibold">Installer</p>
        <p>{job.installer}</p>
      </div>
      <div>
        <p className="font-semibold">System Type</p>
        {job.zones.length ? (
          <div className="space-y-1">
            {job.zones.map((z, idx) => (
              <p key={idx}>
                <strong>{z.zoneName}:</strong> {z.systemType}
              </p>
            ))}
          </div>
        ) : (
          <p>System Type: Unassigned</p>
        )}
      </div>
    </div>
  );
}
