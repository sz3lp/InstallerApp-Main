import React from "react";
import { SZTable } from "../../components/ui/SZTable";
import { useAuth } from "../../lib/hooks/useAuth";
import { Navigate } from "react-router-dom";

const ReportsPage: React.FC = () => {
  const { session, isAuthorized, loading: authLoading } = useAuth();
  const metrics = [
    { label: "Total Jobs", value: 42 },
    { label: "Revenue", value: "$12,000" },
    { label: "Avg Job Size", value: "$300" },
  ];

  if (authLoading) return <p className="p-4">Loading...</p>;
  if (!session) return <Navigate to="/login" replace />;
  if (!isAuthorized("Manager") && !isAuthorized("Admin"))
    return <Navigate to="/unauthorized" replace />;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white shadow rounded p-4">
            <p className="text-sm text-gray-600">{m.label}</p>
            <p className="text-lg font-semibold">{m.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <SZTable headers={["Month", "Jobs"]}>
          <tr className="border-t">
            <td className="p-2 border">Jan</td>
            <td className="p-2 border">5</td>
          </tr>
          <tr className="border-t">
            <td className="p-2 border">Feb</td>
            <td className="p-2 border">8</td>
          </tr>
        </SZTable>
      </div>
      <div className="mt-4 bg-gray-100 h-40 flex items-center justify-center rounded">
        <span className="text-gray-500">Bar chart placeholder</span>
      </div>
    </div>
  );
};

export default ReportsPage;
