import React from "react";
import { SZBadge, SZBadgeProps } from "./ui/SZBadge";

export type JobStatus =
  | "assigned"
  | "in_progress"
  | "needs_qa"
  | "complete"
  | "rework"
  | "archived"
  | "ready_for_invoice"
  | "closed_pending_manager_approval"
  | "approved_ready_for_invoice_payroll"
  | "rejected_sent_back_for_revisions"
  | "on_hold_qa_review"
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
  archived: { label: "Archived", variant: "gray" },
  ready_for_invoice: { label: "Ready for Invoice", variant: "purple" },
  closed_pending_manager_approval: {
    label: "Pending QA Approval",
    variant: "orange",
  },
  approved_ready_for_invoice_payroll: {
    label: "Approved",
    variant: "green",
  },
  rejected_sent_back_for_revisions: {
    label: "Rejected",
    variant: "red",
  },
  on_hold_qa_review: {
    label: "On Hold",
    variant: "yellow",
  },

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
  const fallback: { label: string; variant: SZBadgeProps["variant"] } = {
    label: "Unknown",
    variant: "gray",
  };
  const { label, variant } = statusMap[status] ?? fallback;
  return <SZBadge label={label} variant={variant} className={className} />;
};

export default JobStatusBadge;
