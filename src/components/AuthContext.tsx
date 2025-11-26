import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: number;
  username: string;
  profileId: number;
  profileName?: string;
  programs: string[]; // ex: ["produtos","entrada"]
} | null;

type AuthContextType = {
  user: User;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasProgram: (programKey: string) => boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const s = sessionStorage.getItem("user");
    return s ? JSON.parse(s) : null;
  });

  useEffect(() => {
    if (user) sessionStorage.setItem("user", JSON.stringify(user));
    else sessionStorage.removeItem("user");
  }, [user]);

  const login = async (username: string, password: string) => {
    const res = await fetch("http://localhost:3001/login", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({error: "Erro"}));
      throw new Error(err.error || "Erro no login");
    }
    const data = await res.json();
    setUser(data); // data: {id, username, profileId, profileName, programs}
  };

  const logout = () => {
    setUser(null);
  };

  const hasProgram = (programKey: string) => {
    if (!user) return false;
    return user.programs?.includes(programKey);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasProgram, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
