import { useEffect, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/auth";
import { setUnauthorizedHandler } from "@/api/client";
import type { LoginRequest, SignupRequest } from "@/types/api";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
    retry: false,
    staleTime: Infinity,
  });

  const status = isLoading ? "loading" : !isError && data ? "authenticated" : "guest";

  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.setQueryData(["me"], null);
      navigate("/login", { replace: true });
    });
    return () => setUnauthorizedHandler(null);
  }, [navigate, queryClient]);

  const login = async (values: LoginRequest) => {
    const user = await authApi.login(values);
    queryClient.setQueryData(["me"], user);
  };

  const signup = async (values: SignupRequest) => {
    await authApi.signup(values);
    // Signup does not set cookies; log in with the new credentials to start the session.
    await login(values);
  };

  const logout = async () => {
    await authApi.logout();
    queryClient.setQueryData(["me"], null);
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{ user: status === "authenticated" ? data ?? null : null, status, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
