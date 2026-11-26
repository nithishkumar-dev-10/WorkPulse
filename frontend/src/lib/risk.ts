export type RiskTone = "low" | "medium" | "high";

export function riskTone(probability: number, threshold: number): RiskTone {
  if (probability >= threshold) return "high";
  if (probability >= threshold - 0.1) return "medium";
  return "low";
}
