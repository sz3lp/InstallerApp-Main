import React, { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export interface Quote {
  id: string;
  status: string;
  total: number;
}

export interface Job {
  id: string;
  status: string;
  technician: string | null;
  scheduled_for: string | null;
}

export interface Invoice {
  id: string;
  amount: number;
  due_date: string | null;
  payment_status: string;
}

interface CustomerProfile {
  id: string;
  name: string | null;
  email: string | null;
}

const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      const { data: customer } = await supabase
        .from("customers")
        .select("id, name, email")
        .eq("user_id", userId)
        .single();
      if (customer) setProfile(customer as CustomerProfile);

      const { data: quoteRows } = await supabase
        .from("quotes")
        .select("id, status, total")
        .eq("client_id", customer?.id);
      setQuotes((quoteRows as Quote[]) || []);

      const { data: jobRows } = await supabase
        .from("jobs")
        .select("id, status, technician, scheduled_for")
        .eq("client_id", customer?.id);
      setJobs((jobRows as Job[]) || []);

      const { data: invoiceRows } = await supabase
        .from("invoices")
        .select("id, invoice_total, due_date, payment_status")
        .eq("client_id", customer?.id);
      const mapped = (invoiceRows || []).map((i: any) => ({
        id: i.id,
        amount: i.invoice_total,
        due_date: i.due_date,
        payment_status: i.payment_status,
      }));
      setInvoices(mapped as Invoice[]);

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {profile?.name}</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">Quotes</h2>
        {quotes.length === 0 ? (
          <p>No quotes found.</p>
        ) : (
          <ul className="space-y-2">
            {quotes.map((q) => (
              <li key={q.id} className="p-2 border rounded">
                <span className="font-medium">Quote #{q.id}</span> - {q.status} -
                ${q.total.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Jobs</h2>
        {jobs.length === 0 ? (
          <p>No jobs scheduled.</p>
        ) : (
          <ul className="space-y-2">
            {jobs.map((j) => (
              <li key={j.id} className="p-2 border rounded">
                <span className="font-medium">Job #{j.id}</span> - {j.status}
                {j.scheduled_for && (
                  <> scheduled for {new Date(j.scheduled_for).toLocaleDateString()}</>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Invoices</h2>
        {invoices.length === 0 ? (
          <p>No invoices.</p>
        ) : (
          <ul className="space-y-2">
            {invoices.map((inv) => (
              <li key={inv.id} className="p-2 border rounded">
                <span className="font-medium">Invoice #{inv.id}</span> - {inv.payment_status}
                {inv.due_date && <>
                  {" due " + new Date(inv.due_date).toLocaleDateString()}
                </>}
                - ${inv.amount.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
