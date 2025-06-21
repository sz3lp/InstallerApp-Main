import React from "react";
import { SZButton } from "../../components/ui/SZButton";
import { useJobs } from "../../lib/hooks/useJobs";

const ReviewPage: React.FC = () => {
  const { jobs, updateStatus } = useJobs();
  const submitted = jobs.filter((j) => j.status === "submitted");

  const handleComplete = async (id: string) => {
    await updateStatus(id, "complete");
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Submitted Jobs</h1>
      <ul className="space-y-2">
        {submitted.map((j) => (
          <li key={j.id} className="p-2 border rounded flex justify-between">
            <span>{j.clinic_name}</span>
            <SZButton size="sm" onClick={() => handleComplete(j.id)}>
              Mark Complete
            </SZButton>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReviewPage;
