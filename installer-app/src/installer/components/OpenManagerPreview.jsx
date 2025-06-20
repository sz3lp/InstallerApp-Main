import React, { useState } from "react";
import ManagerPreviewModal from "./ManagerPreviewModal.tsx";

export default function OpenManagerPreview() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow hover:opacity-90 active:scale-95"
        onClick={() => setOpen(true)}
      >
        Open SZ Manager View
      </button>
      <ManagerPreviewModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
