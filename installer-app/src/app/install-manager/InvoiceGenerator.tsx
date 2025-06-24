import React, { useEffect, useState } from 'react';
import supabase from '../../lib/supabaseClient';
import { SZButton } from '../../components/ui/SZButton';
import { SZTable } from '../../components/ui/SZTable';

interface JobRow {
  id: string;
  clinic_name: string;
}

const InvoiceGenerator: React.FC = () => {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from<JobRow>('jobs')
        .select('id, clinic_name')
        .eq('status', 'ready_for_invoice');
      setJobs(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const finalize = async (id: string) => {
    await supabase.rpc('generate_invoice_from_job', { p_job_id: id });
    await supabase.from('jobs').update({ status: 'invoiced' }).eq('id', id);
    setJobs((js) => js.filter((j) => j.id !== id));
  };

  if (loading) return <div className='p-4'>Loading...</div>;

  return (
    <div className='p-4 space-y-4'>
      <h1 className='text-2xl font-bold'>Invoice Generator</h1>
      {jobs.length === 0 ? (
        <p>No jobs ready for invoicing.</p>
      ) : (
        <SZTable headers={['Job', 'Action']}>
          {jobs.map((job) => (
            <tr key={job.id} className='border-t'>
              <td className='p-2 border'>{job.clinic_name}</td>
              <td className='p-2 border'>
                <SZButton size='sm' onClick={() => finalize(job.id)}>
                  Finalize
                </SZButton>
              </td>
            </tr>
          ))}
        </SZTable>
      )}
    </div>
  );
};

export default InvoiceGenerator;
