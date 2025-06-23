import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../lib/hooks/useAuth";

export const RequireAuth: React.FC = () => {
  const { session, loading } = useAuth();
  if (loading) return <p>Loading...</p>;
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export default RequireAuth;
