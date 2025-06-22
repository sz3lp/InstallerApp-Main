import React from "react";
import Header from "../../../installer/components/Header";

export interface JobHeaderProps {
  jobNumber: string;
  onMenuClick: () => void;
}

export default function JobHeader({ jobNumber, onMenuClick }: JobHeaderProps) {
  return <Header title={jobNumber} onMenuClick={onMenuClick} />;
}
