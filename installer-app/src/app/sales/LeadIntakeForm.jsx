import React, { useState } from 'react';
import useAuth from '../../lib/hooks/useAuth';
import useLeads from '../../lib/hooks/useLeads';
import { SZInput } from '../../components/ui/SZInput';
import { SZButton } from '../../components/ui/SZButton';

export default function LeadIntakeForm() {
  const { role } = useAuth();
  const { createLead } = useLeads();
  const [lead, setLead] = useState({ clinic_name: '', contact_name: '', contact_phone: '', contact_email: '', address: '' });
  if (role !== 'Sales' && role !== 'Admin') return <div className="p-4">Access denied</div>;

  const handleChange = (k, v) => setLead(l => ({ ...l, [k]: v }));
  const submit = async () => {
    if (!lead.clinic_name) return;
    await createLead({ ...lead, sales_rep_id: null });
    setLead({ clinic_name: '', contact_name: '', contact_phone: '', contact_email: '', address: '' });
    alert('Lead added');
  };

  return (
    <div className="p-4 space-y-2 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">New Lead</h1>
      <SZInput id="clinic" label="Clinic Name" value={lead.clinic_name} onChange={v => handleChange('clinic_name', v)} />
      <SZInput id="contact" label="Contact Name" value={lead.contact_name} onChange={v => handleChange('contact_name', v)} />
      <SZInput id="phone" label="Phone" value={lead.contact_phone} onChange={v => handleChange('contact_phone', v)} />
      <SZInput id="email" label="Email" value={lead.contact_email} onChange={v => handleChange('contact_email', v)} />
      <SZInput id="address" label="Address" value={lead.address} onChange={v => handleChange('address', v)} />
      <SZButton onClick={submit}>Create Lead</SZButton>
    </div>
  );
}
