import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAuth from '../../lib/hooks/useAuth';
import useClients from '../../lib/hooks/useClients';
import useQuotes from '../../lib/hooks/useQuotes';
import { useJobs } from '../../lib/hooks/useJobs';
import useInvoices from '../../lib/hooks/useInvoices';
import usePayments from '../../lib/hooks/usePayments';
import { SZTable } from '../../components/ui/SZTable';
import { GlobalLoading, GlobalEmpty, GlobalError } from '../../components/global-states';

export default function ClientProfilePage() {
  const { role } = useAuth();
  const { id } = useParams();
  const [clients, { loading: clientsLoading, error: clientsError }] = useClients();
  const [quotes, { loading: quotesLoading, error: quotesError }] = useQuotes();
  const { jobs, loading: jobsLoading, error: jobsError } = useJobs();
  const [invoices, { loading: invoicesLoading, error: invoicesError }] = useInvoices();
  const [payments, { loading: paymentsLoading, error: paymentsError }] = usePayments();
  const client = clients.find(c => c.id === id);

  if (!role) return null;
  if (clientsLoading || quotesLoading || jobsLoading || invoicesLoading || paymentsLoading)
    return <GlobalLoading />;
  if (clientsError || quotesError || jobsError || invoicesError || paymentsError)
    return (
      <GlobalError message={clientsError || quotesError || jobsError || invoicesError || paymentsError} />
    );
  if (!client) return <div className="p-4">Client not found</div>;

  const clientQuotes = quotes.filter(q => q.client_id === id);
  const clientJobs = jobs.filter(j => j.client_id === id);
  const clientInvoices = invoices.filter(i => i.client_id === id);
  const clientPayments = payments.filter(p => clientInvoices.some(i => i.id === p.invoice_id));

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{client.name}</h1>
      <div>
        <p>Contact: {client.contact_name}</p>
        <p>Email: {client.contact_email}</p>
        <p>Address: {client.address}</p>
      </div>
      <section>
        <h2 className="font-semibold">Quotes</h2>
        {clientQuotes.length === 0 ? (
          <GlobalEmpty message="No Quotes" />
        ) : (
          <SZTable headers={["Title", "Status", "Total"]}>
            {clientQuotes.map(q => (
              <tr key={q.id} className="border-t">
                <td className="p-2 border">{q.title}</td>
                <td className="p-2 border">{q.status}</td>
                <td className="p-2 border">${(q.total ?? 0).toFixed(2)}</td>
              </tr>
            ))}
          </SZTable>
        )}
      </section>
      <section>
        <h2 className="font-semibold">Jobs</h2>
        {clientJobs.length === 0 ? (
          <GlobalEmpty message="No Jobs" />
        ) : (
          <SZTable headers={["Clinic", "Status"]}>
            {clientJobs.map(j => (
              <tr key={j.id} className="border-t">
                <td className="p-2 border">{j.clinic_name}</td>
                <td className="p-2 border">{j.status}</td>
              </tr>
            ))}
          </SZTable>
        )}
      </section>
      <section>
        <h2 className="font-semibold">Invoices</h2>
        {clientInvoices.length === 0 ? (
          <GlobalEmpty message="No Invoices" />
        ) : (
          <SZTable headers={["Amount", "Status"]}>
            {clientInvoices.map(i => (
              <tr key={i.id} className="border-t">
                <td className="p-2 border">${i.amount.toFixed(2)}</td>
                <td className="p-2 border">{i.status}</td>
              </tr>
            ))}
          </SZTable>
        )}
      </section>
      <section>
        <h2 className="font-semibold">Payments</h2>
        {clientPayments.length === 0 ? (
          <GlobalEmpty message="No Payments" />
        ) : (
          <SZTable headers={["Amount", "Method", "Date"]}>
            {clientPayments.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-2 border">${p.amount.toFixed(2)}</td>
                <td className="p-2 border">{p.payment_method}</td>
                <td className="p-2 border">{new Date(p.payment_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </SZTable>
        )}
      </section>
    </div>
  );
}
