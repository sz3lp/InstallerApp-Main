import React, { useState, useEffect } from 'react';
import { SZModal } from './ui/SZModal';
import { SZButton } from './ui/SZButton';
import supabase from '../lib/supabaseClient';
import useAuth from '../lib/hooks/useAuth';

export default function MaterialUsageLogger({ jobId, open, onClose }) {
  const { session, role } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [rows, setRows] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !jobId) return;
    supabase
      .from('job_materials')
      .select('id, material_id, quantity, used_quantity')
      .eq('job_id', jobId)
      .then(({ data }) => {
        setMaterials(data || []);
        const q = {};
        (data || []).forEach(m => { q[m.id] = 0; });
        setRows(q);
      });
  }, [open, jobId]);

  if (role !== 'Installer') return null;
  const updateQty = (id, qty) => setRows(r => ({ ...r, [id]: qty }));

  const submit = async () => {
    setSaving(true);
    for (const id of Object.keys(rows)) {
      const qty = rows[id];
      if (qty > 0) {
        const jm = materials.find(m => m.id === id);
        await supabase.from('job_materials_used').insert({
          job_id: jobId,
          product_service_id: jm.material_id,
          quantity: qty,
          cost_snapshot: 0,
          user_id: session?.user?.id,
        });
        await supabase.from('job_materials').update({ used_quantity: jm.used_quantity + qty }).eq('id', id);
      }
    }
    setSaving(false);
    onClose();
  };

  const canSubmit = Object.values(rows).some(q => q > 0);

  return (
    <SZModal isOpen={open} onClose={onClose} title="Log Materials Used" footer={null}>
      {materials.length === 0 ? (
        <p>No materials assigned.</p>
      ) : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">Material</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Use</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(m => (
              <tr key={m.id} className="border-t">
                <td className="p-2 border">{m.material_id}</td>
                <td className="p-2 border text-right">{m.quantity}</td>
                <td className="p-2 border">
                  <input type="number" className="border rounded px-2 py-1 w-20" value={rows[m.id] || 0} onChange={e => updateQty(m.id, Number(e.target.value))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <SZButton variant="secondary" onClick={onClose}>Cancel</SZButton>
        <SZButton onClick={submit} disabled={!canSubmit} isLoading={saving}>Save</SZButton>
      </div>
    </SZModal>
  );
}
