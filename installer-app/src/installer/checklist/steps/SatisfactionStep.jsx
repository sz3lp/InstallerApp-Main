import React, { useState, useEffect, useRef } from "react";
import useJobChecklist from "../../../lib/hooks/useJobChecklist";
import supabase from "../../../lib/supabaseClient";

const SatisfactionStep = ({ jobId, onNext, onBack, step }) => {
  const { items, upsertEntry } = useJobChecklist(jobId);
  const existing = items.find((i) => i.step_name === "customer_satisfaction");
  const initial = existing?.notes
    ? JSON.parse(existing.notes)
    : { name: "", clean: false, happy: false, signature: null };
  const [name, setName] = useState(initial.name);
  const [clean, setClean] = useState(initial.clean);
  const [happy, setHappy] = useState(initial.happy);
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    const signature = canvasRef.current?.toDataURL() ?? initial.signature;
    const payload = JSON.stringify({ name, clean, happy, signature });
    const completed = !!signature && name.trim() !== "";
    upsertEntry("customer_satisfaction", { notes: payload, completed });
  }, [name, clean, happy, canvasRef.current?.toDataURL, upsertEntry]);

  const startDraw = (e) => {
    setDrawing(true);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    const { offsetX, offsetY } = e.nativeEvent;
    ctx.moveTo(offsetX, offsetY);
  };
  const draw = (e) => {
    if (!drawing) return;
    const ctx = canvasRef.current.getContext("2d");
    const { offsetX, offsetY } = e.nativeEvent;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };
  const endDraw = () => setDrawing(false);

  const handleFinish = async () => {
    const signature = canvasRef.current?.toDataURL();
    const payload = JSON.stringify({ name, clean, happy, signature });
    await upsertEntry("customer_satisfaction", {
      notes: payload,
      completed: true,
    });
    await supabase
      .from("jobs")
      .update({ signature_captured: true, status: "complete" })
      .eq("id", jobId);
    onNext();
  };

  return (
    <div className="p-4 pb-20">
      <h2 className="text-xl font-semibold mb-4">Customer Satisfaction</h2>
      <div className="mb-2">
        <label className="block text-sm font-semibold">Name</label>
        <input
          type="text"
          className="border rounded w-full p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <label className="block mb-1">
        <input
          type="checkbox"
          className="mr-1"
          checked={clean}
          onChange={(e) => setClean(e.target.checked)}
        />
        Was the job clean?
      </label>
      <label className="block mb-2">
        <input
          type="checkbox"
          className="mr-1"
          checked={happy}
          onChange={(e) => setHappy(e.target.checked)}
        />
        Were they happy?
      </label>
      <p className="text-sm font-semibold mb-1">Signature</p>
      <canvas
        ref={canvasRef}
        width={300}
        height={100}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        className="border w-full mb-2"
      />
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between">
        <button onClick={onBack} className="text-sm">
          Back
        </button>
        <span>Checklist Step {step} of 6</span>
        <button
          onClick={handleFinish}
          className="bg-green-600 text-white px-4 py-1 rounded"
        >
          Finish
        </button>
      </div>
    </div>
  );
};

export default SatisfactionStep;
