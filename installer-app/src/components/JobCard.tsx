import React from "react";
import { SZCard } from "./ui/SZCard";
import JobStatusBadge, { JobStatus } from "./JobStatusBadge";
import { SZButton } from "./ui/SZButton";

export type Job = {
  id: string;
  address: string;
  assignedTo: string | null;
  status: JobStatus;
  scheduledDate: string;
};

export type JobCardProps = {
  job: Job;
  onViewDetails?: () => void;
  className?: string;
};

const JobCard: React.FC<JobCardProps> = ({
  job,
  onViewDetails,
  className = "",
}) => {
  const header = (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">{job.address}</h3>
      <JobStatusBadge status={job.status} />
    </div>
  );

  const footer = (
    <div className="flex justify-end">
      <SZButton size="sm" onClick={onViewDetails}>
        View Details
      </SZButton>
    </div>
  );

  return (
    <SZCard header={header} footer={footer} className={className}>
      <p className="text-sm text-gray-600">Scheduled: {job.scheduledDate}</p>
      <p className="text-sm text-gray-600">
        Assigned To: {job.assignedTo ?? "Unassigned"}
      </p>
    </SZCard>
  );
};

export default JobCard;
