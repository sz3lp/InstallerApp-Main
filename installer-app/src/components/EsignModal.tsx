import React, { useRef, useState } from "react";
import { SZModal } from "./ui/SZModal";
import { SZButton } from "./ui/SZButton";
import supabase from "../lib/supabaseClient";
import { useJobs } from "../lib/hooks/useJobs";

export interface EsignModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
}

const EsignModal: React.FC<EsignModalProps> = ({ isOpen, onClose, jobId }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { updateStatus } = useJobs();

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setHasSignature(false);
  };

  const handleSubmit = async () => {
    if (!jobId || !canvasRef.current || !hasSignature) return;

    setSubmitting(true);
    try {
      const blob: Blob | null = await new Promise((resolve) =>
        canvasRef.current?.toBlob((b) => resolve(b), "image/png")
      );
      if (!blob) throw new Error("Failed to capture signature");

      const fileName = `signature_${Date.now()}.png`;
      const file = new File([blob], fileName, { type: "image/png" });
      const filePath = `${jobId}/${fileName}`;

      const { error } = await supabase.storage
        .from("signatures")
        .upload(filePath, file);
      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("signatures")
        .getPublicUrl(filePath);
      const url = urlData.publicUrl;

      await supabase.from("job_documents").insert({
        job_id: jobId,
        url,
        type: "signature",
      });

      await updateStatus(jobId, "closed");
      clearCanvas();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SZModal isOpen={isOpen} onClose={onClose} title="Job Approval Signature">
      <p className="mb-2 text-sm">Please sign below to approve completion of this job.</p>
      <canvas
        ref={canvasRef}
        width={400}
        height={150}
        className="border w-full"
        onMouseDown={(e) => {
          setDrawing(true);
          setHasSignature(true);
          const ctx = canvasRef.current?.getContext("2d");
          if (ctx) {
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
          }
        }}
        onMouseMove={(e) => {
          if (!drawing) return;
          const ctx = canvasRef.current?.getContext("2d");
          if (ctx) {
            ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
            ctx.stroke();
          }
        }}
        onMouseUp={() => setDrawing(false)}
        onMouseLeave={() => setDrawing(false)}
      />
      <button
        type="button"
        className="text-xs text-gray-500 mt-1"
        onClick={clearCanvas}
      >
        Clear
      </button>
      <div className="mt-4 flex justify-end gap-2">
        <SZButton variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </SZButton>
        <SZButton onClick={handleSubmit} disabled={!hasSignature} isLoading={submitting}>
          Submit Signature
        </SZButton>
      </div>
    </SZModal>
  );
};

export default EsignModal;
