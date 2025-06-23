import { Navigate } from "react-router-dom";
import { useAuth } from "../../lib/hooks/useAuth";
import React from "react";

type RequireRoleProps = {
  allowed: string[];
  children: JSX.Element;
};

export default function RequireRole({ children, allowed }: RequireRoleProps) {
  const { session, role } = useAuth();

  if (!session) return <Navigate to="/login" replace />;
  if (!role || !allowed.includes(role)) return <Navigate to="/unauthorized" replace />;

  return children;
}
