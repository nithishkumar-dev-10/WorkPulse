import { CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function OfflineState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="mx-auto max-w-xl p-10 text-center shadow-float">
      <span className="icon-badge icon-badge-indigo mx-auto mb-5 h-14 w-14">
        <CloudOff className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="text-xl font-bold">Service unavailable</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        We couldn&apos;t load the information needed for this page. Please check your
        connection and try again.
      </p>
      <Button className="mt-6" onClick={onRetry}>
        Try again
      </Button>
    </Card>
  );
}
