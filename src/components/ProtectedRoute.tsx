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

  // ⏳ Enquanto o AuthProvider ainda está carregando o estado
  if (loading) return null; // ou pode colocar um spinner

  // ❌ Não logado → voltar para "/"
  if (!isAuthenticated) return <Navigate to="/" replace />;

  // ❌ Logado mas sem permissão → enviar ao 403 sem cair no NotFound
  if (program && !hasProgram(program)) return <Navigate to="/403" replace />;

  // ✅ OK → pode acessar
  return children;
}
