import React from 'react';
import useAuth from '../lib/hooks/useAuth';
import { useJobs } from '../lib/hooks/useJobs';
import useQuotes from '../lib/hooks/useQuotes';
import { SZButton } from './ui/SZButton';

export default function ConvertQuoteToJobButton({ quote }) {
  const { role } = useAuth();
  const { createJob } = useJobs();
  const [, { updateQuote }] = useQuotes();

  if ((quote?.status !== 'approved') || !['Sales', 'Admin'].includes(role ?? '')) {
    return null;
  }

  const convert = async () => {
    await createJob({
      client_id: quote.client_id,
      quote_id: quote.id,
      clinic_name: quote.client_name || '',
      contact_name: '',
      contact_phone: '',
      address: '',
      status: 'Scheduled',
    });
    await updateQuote(quote.id, { client_id: quote.client_id, status: 'converted', items: [] });
    alert('Quote converted to job');
  };

  return (
    <SZButton size="sm" onClick={convert}>Convert to Job</SZButton>
  );
}
