import { createContext, useContext } from "react";
import type { LoginRequest, SignupRequest, User } from "@/types/api";

export type AuthStatus = "loading" | "authenticated" | "guest";

export interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  login: (values: LoginRequest) => Promise<void>;
  signup: (values: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
