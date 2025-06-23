import React, { useState } from 'react';
import { SZButton } from './ui/SZButton';

interface Props {
  invoiceId: string;
}

const PayInvoiceButton: React.FC<Props> = ({ invoiceId }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url as string;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SZButton size="sm" onClick={handleClick} disabled={loading}>
      {loading ? 'Loading...' : 'Pay with Card'}
    </SZButton>
  );
};

export default PayInvoiceButton;
