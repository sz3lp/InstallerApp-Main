import React from "react";
import { Link } from "react-router-dom";
import { SZTable } from "../../components/ui/SZTable";

interface Job {
  id: string;
  clinic_name: string | null;
  completed_at: string | null;
}

const QAReviewJobList: React.FC<{ jobs: Job[] }> = ({ jobs }) => {
  if (!jobs.length) return <p>No jobs pending manager approval.</p>;
  return (
    <SZTable headers={["Clinic", "Completed", "Actions"]}>
      {jobs.map((job) => (
        <tr key={job.id} className="border-t">
          <td className="p-2 border">{job.clinic_name}</td>
          <td className="p-2 border">
            {job.completed_at
              ? new Date(job.completed_at).toLocaleDateString()
              : ""}
          </td>
          <td className="p-2 border">
            <Link
              to={`/manager/qa/job/${job.id}`}
              className="text-blue-600 underline"
            >
              Review
            </Link>
          </td>
        </tr>
      ))}
    </SZTable>
  );
};

export default QAReviewJobList;
