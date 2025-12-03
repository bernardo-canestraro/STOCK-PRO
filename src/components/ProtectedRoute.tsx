// ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({
  children,
  program
}: {
  children: JSX.Element;
  program: string;
}) {
  const { isAuthenticated, hasProgram, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Normaliza aqui também (dupla segurança)
  if (program && !hasProgram(program.toLowerCase())) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
