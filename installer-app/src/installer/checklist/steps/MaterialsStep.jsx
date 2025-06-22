import React, { useEffect, useState } from "react";
import useJobChecklist from "../../../lib/hooks/useJobChecklist";
import useJobMaterials from "../../../lib/hooks/useJobMaterials";

const MaterialsStep = ({ jobId, onNext, onBack, step }) => {
  const { items, upsertEntry } = useJobChecklist(jobId);
  const existing = items.find((i) => i.step_name === "materials");
  const { items: materials, updateUsed } = useJobMaterials(jobId);
  const [colors, setColors] = useState(() => {
    const obj = {};
    materials.forEach((m) => {
      obj[m.id] = "";
    });
    return obj;
  });

  useEffect(() => {
    const payload = JSON.stringify({ colors });
    upsertEntry("materials", { notes: payload, completed: true });
  }, [colors, upsertEntry]);

  const handleColor = (id, val) => {
    setColors((c) => ({ ...c, [id]: val }));
  };

  return (
    <div className="p-4 pb-20">
      <h2 className="text-xl font-semibold mb-4">Materials Used</h2>
      <table className="w-full text-sm mb-4">
        <thead>
          <tr>
            <th className="text-left p-1">Material</th>
            <th className="p-1">Qty Used</th>
            <th className="p-1">Color</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((m) => (
            <tr key={m.id}>
              <td className="p-1 border">{m.material_id}</td>
              <td className="p-1 border">
                <input
                  type="number"
                  className="border w-16 px-1"
                  value={m.used_quantity || 0}
                  onChange={(e) => updateUsed(m.id, Number(e.target.value))}
                />
              </td>
              <td className="p-1 border">
                <input
                  type="text"
                  className="border px-1"
                  value={colors[m.id] || ""}
                  onChange={(e) => handleColor(m.id, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between">
        <button onClick={onBack} className="text-sm">
          Back
        </button>
        <span>Checklist Step {step} of 6</span>
        <button
          onClick={onNext}
          className="bg-green-600 text-white px-4 py-1 rounded"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default MaterialsStep;
