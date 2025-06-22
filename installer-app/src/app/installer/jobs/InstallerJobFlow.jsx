import React, { useState } from 'react';
import useAuth from '../../../lib/hooks/useAuth';
import { useJobs } from '../../../lib/hooks/useJobs';
import { useChecklist } from '../../../lib/hooks/useChecklist';
import { SZButton } from '../../../components/ui/SZButton';
import uploadDocument from '../../../lib/uploadDocument';
import supabase from '../../../lib/supabaseClient';

export default function InstallerJobFlow() {
  const { session, role } = useAuth();
  const { jobs } = useJobs();
  const [activeId, setActiveId] = useState(null);
  const myJobs = jobs.filter(j => j.assigned_to === session?.user?.id);
  const activeJob = myJobs.find(j => j.id === activeId) || null;
  const checklist = useChecklist(activeId || '');
  const [feedback, setFeedback] = useState('');

  if (role !== 'Installer') {
    return <div className="p-4">Not authorized</div>;
  }

  const toggle = async (id, completed) => {
    await checklist.toggleItem(id, completed);
  };

  const upload = async e => {
    const file = e.target.files?.[0];
    if (!file || !activeId) return;
    const doc = await uploadDocument(file);
    if (!doc) return;
    await supabase.from('documents').insert({
      job_id: activeId,
      name: doc.name,
      url: doc.url,
    });
    e.target.value = '';
  };

  const submitFeedback = async () => {
    if (!feedback.trim() || !activeId) return;
    await supabase.from('feedback').insert({ job_id: activeId, notes: feedback });
    setFeedback('');
  };

  return (
    <div className="p-4 space-y-4">
      {!activeJob && (
        <div>
          <h1 className="text-xl font-bold mb-2">My Jobs</h1>
          <ul className="space-y-2">
            {myJobs.map(j => (
              <li key={j.id} className="border p-2 rounded" onClick={() => setActiveId(j.id)}>
                {j.clinic_name}
              </li>
            ))}
          </ul>
        </div>
      )}
      {activeJob && (
        <div className="space-y-4">
          <SZButton size="sm" variant="secondary" onClick={() => setActiveId(null)}>
            Back
          </SZButton>
          <h2 className="text-xl font-semibold">{activeJob.clinic_name}</h2>
          <div>
            <h3 className="font-medium mb-2">Checklist</h3>
            {checklist.items.map(item => (
              <label key={item.id} className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={e => toggle(item.id, e.target.checked)}
                />
                {item.description}
              </label>
            ))}
          </div>
          <div>
            <input type="file" onChange={upload} />
          </div>
          <div className="space-y-2">
            <textarea
              className="border rounded w-full p-2"
              placeholder="Leave feedback"
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
            />
            <SZButton onClick={submitFeedback}>Submit Feedback</SZButton>
          </div>
        </div>
      )}
    </div>
  );
}
