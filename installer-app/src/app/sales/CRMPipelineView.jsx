import React from 'react';
import useAuth from '../../lib/hooks/useAuth';
import useLeads from '../../lib/hooks/useLeads';
import supabase from '../../lib/supabaseClient';

const stages = ['new', 'appointment_scheduled', 'proposal_sent', 'won', 'lost'];

export default function CRMPipelineView() {
  const { role, user } = useAuth();
  const { leads, fetchLeads } = useLeads();

  if (!['Sales', 'Manager'].includes(role ?? '')) return <div className="p-4">Access denied</div>;

  const onDrop = async (e, status) => {
    const id = e.dataTransfer.getData('text');
    await supabase.from('leads').update({ status }).eq('id', id);
    fetchLeads();
  };

  return (
    <div className="flex overflow-x-auto gap-4 p-4">
      {stages.map(stage => (
        <div
          key={stage}
          onDragOver={e => e.preventDefault()}
          onDrop={e => onDrop(e, stage)}
          className="min-w-[200px] flex-1 bg-gray-50 border rounded p-2"
        >
          <h3 className="font-semibold capitalize mb-2">{stage.replace('_', ' ')}</h3>
          {leads.filter(l => l.status === stage && (role !== 'Sales' || l.sales_rep_id === user?.id)).map(l => (
            <div
              key={l.id}
              draggable
              onDragStart={e => e.dataTransfer.setData('text', l.id)}
              className="p-2 mb-2 bg-white border rounded shadow-sm text-sm"
            >
              {l.clinic_name}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
