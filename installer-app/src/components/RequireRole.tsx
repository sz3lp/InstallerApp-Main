import React, { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/hooks/useAuth";

interface Props {
  role: string | string[];
  children: ReactElement;
  redirectTo?: string;
}

export default function RequireRole({
  role: requiredRole,
  children,
  redirectTo = "/",
}: Props) {
  const { role, session, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const allowed = roles.map((r) => r.toLowerCase());
  if (!session || !allowed.includes((role ?? "").toLowerCase())) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
