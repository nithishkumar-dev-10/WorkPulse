import type {
  LoginRequest,
  MessageResponse,
  SignupRequest,
  User,
} from "@/types/api";
import { API_URL, apiError, apiRequest, networkErrorMessage, refreshSession } from "./client";

async function authFetch<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    throw new Error(await networkErrorMessage());
  }

  if (!response.ok) throw new Error(await apiError(response));
  return response.json() as Promise<T>;
}

export const authApi = {
  signup: (payload: SignupRequest) =>
    authFetch<User>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload: LoginRequest) =>
    authFetch<User>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  logout: () => authFetch<MessageResponse>("/api/auth/logout", { method: "POST" }),
  // Uses the shared client so an expired access token is refreshed and retried once.
  me: () => apiRequest<User>("/api/auth/me"),
  refresh: async (): Promise<void> => {
    if (!(await refreshSession())) throw new Error("Session expired");
  },
};
