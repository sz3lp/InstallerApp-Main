import React from "react";

const UnauthorizedPage: React.FC = () => (
  <div className="p-4 text-center">
    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
    <p>You do not have permission to view this page.</p>
  </div>
);

export default UnauthorizedPage;
