import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

const RADIUS = 72;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function toneFor(probability: number, threshold: number) {
  if (probability >= threshold) return "high" as const;
  if (probability >= threshold - 0.1) return "medium" as const;
  return "low" as const;
}

const stroke: Record<ReturnType<typeof toneFor>, string> = {
  high: "hsl(var(--risk-high))",
  medium: "hsl(var(--risk-medium))",
  low: "hsl(var(--risk-low))",
};

export function RiskGauge({
  probability,
  threshold,
}: {
  probability: number;
  threshold: number;
}) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, probability, {
      duration: reduced ? 0 : 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: setDisplay,
    });
    return () => controls.stop();
  }, [probability, reduced]);

  const tone = toneFor(probability, threshold);
  const angle = (-90 + threshold * 360) * (Math.PI / 180);
  const markerX = 100 + RADIUS * Math.cos(angle);
  const markerY = 100 + RADIUS * Math.sin(angle);

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative"
        role="img"
        aria-label={`${Math.round(probability * 100)} percent attrition likelihood. Decision threshold ${Math.round(threshold * 100)} percent.`}
      >
        <svg viewBox="0 0 200 200" className="h-48 w-48 sm:h-56 sm:w-56">
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="hsl(var(--card-muted))"
            strokeWidth="12"
            transform="rotate(-90 100 100)"
          />
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke={stroke[tone]}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - display)}
            transform="rotate(-90 100 100)"
          />
          <circle cx={markerX} cy={markerY} r="5" fill="hsl(var(--foreground))" />
          <circle cx={markerX} cy={markerY} r="9" fill="hsl(var(--foreground))" opacity="0.14" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="num text-4xl font-bold tracking-tight sm:text-5xl">
            {(display * 100).toFixed(1)}%
          </span>
          <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            attrition likelihood
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Badge tone={probability >= threshold ? "high" : "low"}>
          {probability >= threshold ? "High risk" : "Low risk"}
        </Badge>
        <span className="num rounded-full bg-card-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
          threshold {(threshold * 100).toFixed(0)}%
        </span>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        The dark marker on the ring is this model&apos;s decision threshold.
      </p>
      <span className="sr-only">The threshold marker on the gauge is at {Math.round(threshold * 100)} percent.</span>
    </div>
  );
}
