import React, { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { loginApi, registerApi } from "../services/auth.service";
import { decodeJwt } from "../utils/jwt";

type User = {
  correo: string;
  rol?: string | null;
  id?: string | null;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (payload: {
    correo: string;
    contrasena: string;
  }) => Promise<void>;

  register: (payload: {
    id_rol: string;
    usuario: string;
    contrasena: string;
    nombres: string;
    apellidos: string;
    correo: string;
    estado?: boolean; // ✅ AÑADIDO
  }) => Promise<void>;

  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function tokenToUser(token: string): User | null {
  const payload = decodeJwt(token);
  if (!payload) return null;

  // payload firmado como: { id, correo, rol }
  return {
    id: payload.id ?? null,
    correo: payload.correo ?? "",
    rol: payload.rol ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("auth_token")
  );

  const [user, setUser] = useState<User | null>(() => {
    const t = localStorage.getItem("auth_token");
    return t ? tokenToUser(t) : null;
  });

  const login = async (payload: {
    correo: string;
    contrasena: string;
  }) => {
    const token = await loginApi(payload);
    setToken(token);
    setUser(tokenToUser(token));
    localStorage.setItem("auth_token", token);
  };

  const register = async (payload: {
    id_rol: string;
    usuario: string;
    contrasena: string;
    nombres: string;
    apellidos: string;
    correo: string;
    estado?: boolean;
  }) => {
    const token = await registerApi(payload);
    setToken(token);
    setUser(tokenToUser(token));
    localStorage.setItem("auth_token", token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
  };

  const value = useMemo(
    () => ({ user, token, login, register, logout }),
    [user, token]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
