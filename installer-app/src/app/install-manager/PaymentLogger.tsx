import React, { useEffect, useState } from 'react';
import supabase from '../../lib/supabaseClient';
import { SZButton } from '../../components/ui/SZButton';
import { SZInput } from '../../components/ui/SZInput';

interface Invoice {
  id: string;
  client_id: string | null;
}

const PaymentLogger: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [form, setForm] = useState({ invoiceId: '', amount: '', method: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from<Invoice>('invoices')
        .select('id, client_id')
        .eq('status', 'invoiced');
      setInvoices(data ?? []);
    }
    load();
  }, []);

  const save = async () => {
    if (!form.invoiceId || !form.amount) return;
    setSaving(true);
    await supabase.from('payments').insert({
      invoice_id: form.invoiceId,
      amount: Number(form.amount),
      payment_method: form.method,
    });
    await supabase
      .from('invoices')
      .update({ status: 'paid' })
      .eq('id', form.invoiceId);
    await supabase
      .from('jobs')
      .update({ status: 'paid' })
      .eq('id', (await supabase.from('invoices').select('job_id').eq('id', form.invoiceId).single()).data?.job_id);
    setForm({ invoiceId: '', amount: '', method: '' });
    setSaving(false);
  };

  return (
    <div className='p-4 space-y-4'>
      <h1 className='text-2xl font-bold'>Log Payment</h1>
      <SZInput id='pay_amt' label='Amount' value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} />
      <SZInput id='pay_method' label='Method' value={form.method} onChange={(v) => setForm({ ...form, method: v })} />
      <div>
        <label className='block text-sm font-medium'>Invoice</label>
        <select
          className='border rounded px-3 py-2 w-full'
          value={form.invoiceId}
          onChange={(e) => setForm({ ...form, invoiceId: e.target.value })}
        >
          <option value=''>Select</option>
          {invoices.map((i) => (
            <option key={i.id} value={i.id}>
              {i.id}
            </option>
          ))}
        </select>
      </div>
      <SZButton onClick={save} isLoading={saving} disabled={!form.invoiceId || !form.amount}>
        Save Payment
      </SZButton>
    </div>
  );
};

export default PaymentLogger;
