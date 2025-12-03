import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: number;
  username: string;
  profileId: number;
  profileName?: string;
  programs: string[]; // ex: ["produtos", "entrada"]
} | null;

type AuthContextType = {
  user: User;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  hasProgram: (programKey: string) => boolean;
  isAuthenticated: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// função utilitária central para normalizar um array de programas
function normalizePrograms(progs: any): string[] {
  if (!Array.isArray(progs)) return [];
  return progs
    .map((p) => (typeof p === "string" ? p.trim().toLowerCase() : ""))
    .filter((p) => p.length > 0);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // Carrega sessão ao iniciar e normaliza programas (IMPORTANTE)
  useEffect(() => {
    const saved = sessionStorage.getItem("user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // se houver programs, normalize antes de setar
        const normalized = {
          ...parsed,
          programs: normalizePrograms(parsed.programs),
        };
        setUser(normalized);
      } catch (err) {
        console.warn("AuthProvider: erro ao parsear sessionStorage user", err);
        sessionStorage.removeItem("user");
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // salva sessão — os programas já devem estar normalizados
  useEffect(() => {
    if (user) sessionStorage.setItem("user", JSON.stringify(user));
    else sessionStorage.removeItem("user");
  }, [user]);

  // Login — transforma os programs para minúsculo e sem espaços
 const login = async (username: string, password: string): Promise<User> => {
  const res = await fetch("http://localhost:3001/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Erro no login");
  }

  // 🔥 NORMALIZA OS PROGRAMAS AQUI
  const normalizedPrograms = (data.programs || [])
    .map((p: string) => String(p).trim().toLowerCase())
    .filter(Boolean);

  // 🔥 Cria o user já normalizado
  const user: User = {
    id: data.id,
    username: data.username,
    profileId: data.profileId,
    profileName: data.profileName,
    programs: normalizedPrograms,
  };

  sessionStorage.setItem("user", JSON.stringify(user));
  setUser(user);

  console.log("🔥 USER NORMALIZADO SALVO:", user);

  return user;
};


  const logout = () => {
    setUser(null);
    // opcional: faça fetch para /logout no backend se necessário
  };

// dentro do AuthContext (substitua a função existente)
const hasProgram = (programKey: string) => {
  if (!user) return false;
  if (!programKey) return false;
  // user.programs já está normalizado p/ lower-case no login/bootstrap
  return user.programs.includes(programKey.trim().toLowerCase());
};


  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        hasProgram,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
