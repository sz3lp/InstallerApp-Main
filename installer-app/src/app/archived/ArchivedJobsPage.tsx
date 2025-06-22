import React, { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import { SZInput } from "../../components/ui/SZInput";
import { SZCard } from "../../components/ui/SZCard";

interface Job {
  id: string;
  clinic_name: string;
  completed_at: string;
  contact_name: string;
}

export default function ArchivedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchArchivedJobs = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, clinic_name, contact_name, completed_at")
        .eq("status", "archived")
        .order("completed_at", { ascending: false });

      if (!error) setJobs(data ?? []);
    };

    fetchArchivedJobs();
  }, []);

  const filtered = jobs.filter((j) =>
    `${j.clinic_name} ${j.contact_name}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Archived Jobs</h1>
      <SZInput
        id="search"
        label="Search"
        placeholder="Search by clinic or contact"
        value={query}
        onChange={setQuery}
      />
      <div className="grid gap-3">
        {filtered.map((job) => (
          <SZCard key={job.id}>
            <div className="space-y-1">
              <h2 className="font-semibold">{job.clinic_name}</h2>
              <p className="text-sm">Contact: {job.contact_name}</p>
              <p className="text-xs text-gray-500">
                Completed: {new Date(job.completed_at).toLocaleDateString()}
              </p>
            </div>
          </SZCard>
        ))}
        {!filtered.length && (
          <p className="italic text-sm">No matching jobs found.</p>
        )}
      </div>
    </div>
  );
}
