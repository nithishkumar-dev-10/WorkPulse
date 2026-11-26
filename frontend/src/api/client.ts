import type {
  BatchResponse,
  Employee,
  Explanation,
  Health,
  ModelsResponse,
  Prediction,
  SchemaField,
} from "@/types/api";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export async function apiError(response: Response): Promise<string> {
  const body = await response.json().catch(() => null);
  const detail = body?.detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item: { loc?: unknown[]; msg?: string }) =>
        `${Array.isArray(item.loc) ? item.loc.slice(1).join(".") : "input"}: ${item.msg ?? "invalid"}`,
      )
      .join("; ");
  }
  if (typeof detail === "string") return detail;
  return `Request failed (${response.status})`;
}

export async function refreshSession(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  retryOn401 = true,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });
  } catch {
    throw new Error(`Cannot reach the API at ${API_URL}. Start the backend first.`);
  }

  if (response.status === 401 && retryOn401 && path !== "/api/auth/refresh") {
    if (await refreshSession()) return request<T>(path, init, false);
    unauthorizedHandler?.();
    throw new Error("Your session has expired. Please sign in again.");
  }

  if (!response.ok) throw new Error(await apiError(response));

  return response.json() as Promise<T>;
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export const api = {
  health: () => request<Health>("/health"),
  models: () => request<ModelsResponse>("/models"),
  schema: () => request<SchemaField[]>("/schema"),
  predict: (model: string, employee: Employee) =>
    post<Prediction>("/predict", { model, employee }),
  predictBatch: (model: string, employees: Employee[]) =>
    post<BatchResponse>("/predict/batch", { model, employees }),
  explain: (model: string, employee: Employee) =>
    post<Explanation>("/explain", { model, employee }),
};

export { API_URL, request as apiRequest };
