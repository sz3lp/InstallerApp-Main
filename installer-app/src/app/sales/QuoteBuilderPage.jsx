import React, { useState, useEffect } from 'react';
import useAuth from '../../lib/hooks/useAuth';
import useClients from '../../lib/hooks/useClients';
import supabase from '../../lib/supabaseClient';
import { SZInput } from '../../components/ui/SZInput';
import { SZButton } from '../../components/ui/SZButton';

export default function QuoteBuilderPage() {
  const { role, user } = useAuth();
  const [clients] = useClients();
  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState([{ description: '', quantity: 1, unit_price: 0 }]);
  const [tax, setTax] = useState(0);

  useEffect(() => {
    if (clients.length && !clientId) setClientId(clients[0].id);
  }, [clients, clientId]);

  if (role !== 'Sales' && role !== 'Admin') return <div className="p-4">Access denied</div>;

  const updateItem = (idx, key, value) => {
    setItems(list => list.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  };

  const addItem = () => setItems(i => [...i, { description: '', quantity: 1, unit_price: 0 }]);
  const removeItem = idx => setItems(i => i.filter((_, n) => n !== idx));

  const total = items.reduce((s, it) => s + it.quantity * it.unit_price, 0);
  const totalWithTax = total + total * (tax / 100);

  const saveQuote = async (send = false) => {
    const { data: quote } = await supabase
      .from('quotes')
      .insert({ client_id: clientId, status: send ? 'sent' : 'draft', created_by: user?.id })
      .select()
      .single();
    if (!quote) return;
    const rows = items.map(i => ({ ...i, quote_id: quote.id, total: i.quantity * i.unit_price }));
    if (rows.length) await supabase.from('quote_items').insert(rows);
    alert(`Quote ${send ? 'sent' : 'saved'}!`);
  };

  return (
    <div className="p-6 space-y-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Create Quote</h1>
      <div>
        <label className="block text-sm font-medium" htmlFor="client">Client</label>
        <select id="client" className="border p-2 rounded w-full" value={clientId} onChange={e => setClientId(e.target.value)}>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      {items.map((it, idx) => (
        <div key={idx} className="grid grid-cols-3 gap-2 items-end">
          <SZInput id={`desc_${idx}`} label="Description" value={it.description} onChange={v => updateItem(idx, 'description', v)} />
          <SZInput id={`qty_${idx}`} label="Qty" type="number" value={String(it.quantity)} onChange={v => updateItem(idx, 'quantity', parseInt(v))} />
          <SZInput id={`price_${idx}`} label="Unit Price" type="number" value={String(it.unit_price)} onChange={v => updateItem(idx, 'unit_price', parseFloat(v))} />
          <SZButton size="sm" variant="destructive" onClick={() => removeItem(idx)}>Remove</SZButton>
        </div>
      ))}
      <SZButton size="sm" variant="secondary" onClick={addItem}>Add Line</SZButton>
      <div>
        <SZInput id="tax" label="Tax %" type="number" value={String(tax)} onChange={setTax} />
      </div>
      <div className="font-semibold">Total: ${totalWithTax.toFixed(2)}</div>
      <div className="flex gap-2">
        <SZButton onClick={() => saveQuote(false)}>Save Draft</SZButton>
        <SZButton onClick={() => saveQuote(true)}>Send Quote</SZButton>
      </div>
    </div>
  );
}
