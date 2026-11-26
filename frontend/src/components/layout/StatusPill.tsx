import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { api } from "@/api/client";
import { cn } from "@/lib/utils";

export function StatusPill() {
  const { data, isError, isFetching, refetch } = useQuery({
    queryKey: ["health"],
    queryFn: api.health,
    refetchInterval: 5000,
    retry: 1,
  });

  const online = !isError && data?.status === "ok";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
        online
          ? "border-risk-low/20 bg-risk-low-soft text-risk-low"
          : "border-risk-high/20 bg-risk-high-soft text-risk-high",
      )}
      role="status"
      aria-live="polite"
      aria-label={online ? "API connected" : "API offline"}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          online ? "bg-risk-low" : "bg-risk-high",
        )}
      />
      {online ? "Connected" : "Offline"}
      <button
        type="button"
        onClick={() => void refetch()}
        className="rounded-full p-0.5 transition-transform hover:rotate-45"
        aria-label="Retry API status check"
      >
        <RefreshCw className={cn("h-3 w-3", isFetching && "animate-spin")} aria-hidden="true" />
      </button>
    </div>
  );
}
