import { type JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireRole({
  allow,
  children,
}: {
  allow: string[];
  children: JSX.Element;
}): JSX.Element {
  const { user } = useAuth();
  const role = (user?.rol || "").toUpperCase();

  if (!role) return <Navigate to="/dashboard" replace />;

  const ok = allow.map((r) => r.toUpperCase()).includes(role);
  if (!ok) return <Navigate to="/dashboard" replace />;

  return children;
}
