/**
 * Human-readable inputs -> the exact raw integer domains used by the trained
 * IBM HR models. These helpers only affect what the user sees and types; the
 * values sent to /predict, /predict/batch and /explain stay unchanged.
 */

/** IBM HR ordinal encoding for Education (src/schemas.py: ge=1, le=5). */
export const EDUCATION_TIERS = [
  { tier: 1, label: "High School / Below College (10th / 12th)" },
  { tier: 2, label: "Diploma / Associate Degree (College)" },
  { tier: 3, label: "Bachelor's Degree (B.Tech / B.E. / B.Sc / B.A.)" },
  { tier: 4, label: "Master's Degree (M.Tech / M.Sc / MBA / M.A.)" },
  { tier: 5, label: "Doctorate (Ph.D. / Post-Doctoral)" },
] as const;

export function educationTierLabel(tier: number): string {
  const rounded = Math.round(tier);
  return EDUCATION_TIERS.find((item) => item.tier === rounded)?.label ?? `Model tier ${rounded}`;
}

/** DistanceFromHome is constrained to 1–29 by the API schema and model artifacts. */
export const MODEL_DISTANCE_MIN = 1;
export const MODEL_DISTANCE_MAX = 29;
export const MAX_COMMUTE_KM = 100;

/**
 * Piecewise linear anchors: 0–3 km -> 1–2, 15 km -> 8, 30 km -> 15,
 * 50+ km -> 29. Values are clamped to the trained [1, 29] domain.
 */
const COMMUTE_ANCHORS = [
  { km: 0, model: 1 },
  { km: 3, model: 2 },
  { km: 15, model: 8 },
  { km: 30, model: 15 },
  { km: 50, model: 29 },
] as const;

export const COMMUTE_PRESETS = [
  { label: "Local (< 5 km)", km: 3 },
  { label: "City Commute (10–20 km)", km: 15 },
  { label: "Suburban (25–40 km)", km: 30 },
  { label: "Long Commute (50+ km)", km: 50 },
] as const;

export const COMMUTE_MAPPING_NOTE =
  "0–3 km → 1–2 · 15 km → 8 · 30 km → 15 · 50+ km → 29";

function clampModel(value: number): number {
  return Math.min(MODEL_DISTANCE_MAX, Math.max(MODEL_DISTANCE_MIN, Math.round(value)));
}

/** Convert a real-world commute distance in km into the model's 1–29 scale. */
export function commuteKmToModel(km: number): number {
  const bounded = Math.min(MAX_COMMUTE_KM, Math.max(0, Number.isFinite(km) ? km : 0));
  for (let i = 1; i < COMMUTE_ANCHORS.length; i += 1) {
    const previous = COMMUTE_ANCHORS[i - 1];
    const next = COMMUTE_ANCHORS[i];
    if (bounded <= next.km) {
      const ratio = (bounded - previous.km) / (next.km - previous.km);
      return clampModel(previous.model + ratio * (next.model - previous.model));
    }
  }
  return MODEL_DISTANCE_MAX;
}

/** Best-effort inverse so stored model values can be shown as realistic km. */
export function commuteModelToKm(modelValue: number): number {
  const bounded = clampModel(Number.isFinite(modelValue) ? modelValue : MODEL_DISTANCE_MIN);
  for (let i = 1; i < COMMUTE_ANCHORS.length; i += 1) {
    const previous = COMMUTE_ANCHORS[i - 1];
    const next = COMMUTE_ANCHORS[i];
    if (bounded <= next.model) {
      const ratio = (bounded - previous.model) / (next.model - previous.model);
      return Math.round(previous.km + ratio * (next.km - previous.km));
    }
  }
  return COMMUTE_ANCHORS[COMMUTE_ANCHORS.length - 1].km;
}
