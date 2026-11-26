import { ServerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function OfflineState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="mx-auto max-w-xl p-10 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-risk-high-soft text-risk-high">
        <ServerOff className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-bold">The API is offline</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Start the backend from the <code className="num rounded bg-card-muted px-1.5 py-0.5">workpulse</code>{" "}
        directory, then retry:
      </p>
      <pre className="num mx-auto mt-4 max-w-full overflow-x-auto rounded-xl bg-card-muted px-4 py-3 text-left text-xs">
        venv/bin/uvicorn api:app --reload --port 8000
      </pre>
      <Button className="mt-6" onClick={onRetry}>
        Retry connection
      </Button>
    </Card>
  );
}
