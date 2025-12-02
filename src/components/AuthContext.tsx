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
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasProgram: (programKey: string) => boolean;
  isAuthenticated: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Carrega sessão ao iniciar
  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false); // Fim do carregamento inicial
  }, []);

  // 💾 Salva sessão sempre que user mudar
  useEffect(() => {
    if (user) sessionStorage.setItem("user", JSON.stringify(user));
    else sessionStorage.removeItem("user");
  }, [user]);

  // 🔐 Login
  const login = async (username: string, password: string) => {
  const res = await fetch("http://localhost:3001/login", {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include"
  });

  if (!res.ok) {
    const err = await res.json().catch(()=>({error: "Erro"}));
    throw new Error(err.error || "Erro no login");
  }

  const data = await res.json();

  // 🔥 ADICIONE ESTA LINHA AQUI
  console.log("LOGIN DATA:", data);

  setUser(data);
};


  // 🚪 Logout
  const logout = () => {
    setUser(null);
  };

  // 🔑 Verificar permissão
  const hasProgram = (programKey: string) => {
    if (!user) return false;
    return user.programs?.includes(programKey);
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        login,
        logout,
        hasProgram,
        isAuthenticated: !!user,
        loading
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
