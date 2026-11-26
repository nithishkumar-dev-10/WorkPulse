import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton-shine rounded-xl", className)} {...props} />;
}

export function ResultSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading prediction" role="status">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-40 w-40 rounded-full" />
        <Skeleton className="h-7 w-28" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="h-56" />
    </div>
  );
}
