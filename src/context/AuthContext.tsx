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
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, pass: string) => {
    const found = db.users.find(u => u.email === email && u.password === pass);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

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
