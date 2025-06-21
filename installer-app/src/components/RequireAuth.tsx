import React, { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/hooks/useAuth";

interface Props {
  children: ReactElement;
  redirectTo?: string;
}

export default function RequireAuth({ children, redirectTo = "/login" }: Props) {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (!session) return <Navigate to={redirectTo} replace />;
  return children;
}
