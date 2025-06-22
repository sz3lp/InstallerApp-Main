import React from "react";

export interface InstallerActionsPanelProps {
  onChecklist: () => void;
  onDocuments: () => void;
}

export default function InstallerActionsPanel({
  onChecklist,
  onDocuments,
}: InstallerActionsPanelProps) {
  return (
    <div className="absolute bottom-4 right-4 space-x-2">
      <button
        onClick={onChecklist}
        className="bg-green-600 text-white px-4 py-2 rounded hover:opacity-90 active:scale-95"
      >
        Checklist
      </button>
      <button
        onClick={onDocuments}
        className="bg-green-600 text-white px-4 py-2 rounded hover:opacity-90 active:scale-95"
      >
        Documents
      </button>
    </div>
  );
}
