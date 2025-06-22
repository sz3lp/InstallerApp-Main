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

  if (loading) return null;

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  if (!session || !roles.includes(role ?? "")) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
