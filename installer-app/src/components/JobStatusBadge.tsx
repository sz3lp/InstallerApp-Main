import React from "react";
import { SZBadge, SZBadgeProps } from "./ui/SZBadge";

export type JobStatus =
  | "assigned"
  | "in_progress"
  | "needs_qa"
  | "complete"
  | "rework"
  | "unassigned";

const statusMap: Record<
  JobStatus,
  { label: string; variant: SZBadgeProps["variant"] }
> = {
  assigned: { label: "Assigned", variant: "blue" },
  in_progress: { label: "In Progress", variant: "yellow" },
  needs_qa: { label: "Needs QA", variant: "orange" },
  complete: { label: "Complete", variant: "green" },
  rework: { label: "Rework", variant: "red" },
  unassigned: { label: "Unassigned", variant: "gray" },
};

export type JobStatusBadgeProps = {
  status: JobStatus;
  className?: string;
};

const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const { label, variant } = statusMap[status];
  return <SZBadge label={label} variant={variant} className={className} />;
};

export default JobStatusBadge;
