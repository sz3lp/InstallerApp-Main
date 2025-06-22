import React from "react";
import InstallerChecklistWizard from "../../../installer/components/InstallerChecklistWizard";
import { JobDetail } from "../jobService";

export interface JobChecklistFormProps {
  job: JobDetail;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function JobChecklistForm({
  job,
  open,
  onClose,
  onSubmit,
}: JobChecklistFormProps) {
  return (
    <InstallerChecklistWizard
      isOpen={open}
      onClose={onClose}
      onSubmit={onSubmit}
      job={job as any}
    />
  );
}
