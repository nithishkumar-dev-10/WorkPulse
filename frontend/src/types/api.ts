export type Employee = Record<string, string | number>;

export interface Prediction {
  prediction: "Yes" | "No";
  probability: number;
  threshold: number;
  model: string;
}

export interface Health {
  status: string;
  models: string[];
  explain_enabled: boolean;
}

export interface ModelInfo {
  id: string;
  name: string;
  threshold: number;
}

export interface ModelsResponse {
  default: string;
  models: ModelInfo[];
}

export interface SchemaField {
  name: string;
  label: string;
  type: "integer" | "categorical";
  group: string;
  ui: "slider" | "select" | "toggle";
  options: string[] | null;
  min: number | null;
  max: number | null;
  default: number | string;
}

export interface ExplainFactor {
  feature: string;
  label: string;
  value: number;
  direction: "increases" | "decreases";
}

export interface Explanation {
  model: string;
  prediction: string;
  probability: number;
  top_factors: ExplainFactor[];
}

export interface BatchResponse {
  count: number;
  predictions: Prediction[];
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  model: string;
  prediction: "Yes" | "No";
  probability: number;
  threshold: number;
  employee: Employee;
}

export interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface MessageResponse {
  message: string;
}
