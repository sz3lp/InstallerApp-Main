import React from "react";
import { useAuth } from "../../lib/hooks/useAuth";

const SalesDashboard: React.FC = () => {
  const { role, user } = useAuth();
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Sales Dashboard</h1>
      <p>Welcome to the sales dashboard.</p>
    </div>
  );
};

export default SalesDashboard;
