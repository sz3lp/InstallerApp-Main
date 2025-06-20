import React from "react";
import { SZModal } from "../../components/ui/SZModal";
import { SZButton } from "../../components/ui/SZButton";

export type ConfirmDeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobId?: string;
};

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  jobId,
}) => (
  <SZModal isOpen={isOpen} onClose={onClose} title="Delete Job">
    <p>Are you sure you want to delete job {jobId}?</p>
    <div className="mt-4 flex justify-end gap-2">
      <SZButton variant="secondary" onClick={onClose}>
        Cancel
      </SZButton>
      <SZButton variant="destructive" onClick={onConfirm}>
        Delete
      </SZButton>
    </div>
  </SZModal>
);

export default ConfirmDeleteModal;
