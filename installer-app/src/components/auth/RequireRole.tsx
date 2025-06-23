import { useAuth } from "../../lib/hooks/useAuth";
import { Navigate } from "react-router-dom";
import React from "react";

export default function RequireRole({ children, allowed }: { children: JSX.Element; allowed: string[] }) {
  const { session, role } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (!allowed.includes(role ?? "")) return <Navigate to="/unauthorized" replace />;
  return children;
}
