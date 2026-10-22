import React, { createContext, useContext, useState, ReactNode } from "react";
import { User } from "../types";
import { useDatabase } from "./DatabaseContext";

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { db } = useDatabase();
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("sports_auth_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (email: string, pass: string) => {
    const found = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === pass);
    if (found) {
      setUser(found);
      try {
        localStorage.setItem("sports_auth_user", JSON.stringify(found));
      } catch {}
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("sports_auth_user");
    } catch {}
  };

  React.useEffect(() => {
    if (user) {
      const updated = db.users.find(u => u.user_id === user.user_id);
      if (updated) {
        setUser(updated);
        try {
          localStorage.setItem("sports_auth_user", JSON.stringify(updated));
        } catch {}
      }
    }
  }, [db.users]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
