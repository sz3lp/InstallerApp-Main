import React, { useState } from 'react';
import ModalWrapper from '../installer/components/ModalWrapper';
import { SZButton } from './ui/SZButton';
import { SZInput } from './ui/SZInput';
import usePayments from '../lib/hooks/usePayments';
import useAuth from '../lib/hooks/useAuth';

export default function PaymentLoggingModal({ invoiceId, open, onClose }) {
  const { role } = useAuth();
  const [, { createPayment }] = usePayments();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');

  if (role !== 'Admin') return null;
  const save = async () => {
    await createPayment({ invoice_id: invoiceId, amount: Number(amount), method });
    onClose();
  };

  return (
    <ModalWrapper isOpen={open} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-2">Log Payment</h2>
      <SZInput id="amt" label="Amount" type="number" value={amount} onChange={setAmount} />
      <div className="my-2">
        <label className="block text-sm font-medium" htmlFor="method">Method</label>
        <select id="method" className="border rounded px-2 py-1 w-full" value={method} onChange={e => setMethod(e.target.value)}>
          <option value="cash">Cash</option>
          <option value="credit">Credit</option>
          <option value="check">Check</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <SZButton variant="secondary" onClick={onClose}>Cancel</SZButton>
        <SZButton onClick={save}>Save</SZButton>
      </div>
    </ModalWrapper>
  );
}
