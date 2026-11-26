import { Activity } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-soft">
        <Activity className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="text-[17px] font-extrabold tracking-tight">
          WorkPulse
        </span>
      )}
    </div>
  );
}
