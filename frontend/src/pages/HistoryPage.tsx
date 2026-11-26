import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Clock3, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clearHistory, loadHistory } from "@/lib/history";
import { formatPercent } from "@/lib/utils";
import { riskTone } from "@/lib/risk";
import type { HistoryEntry } from "@/types/api";

export function HistoryPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<HistoryEntry[]>(() => loadHistory());
  const [filter, setFilter] = useState<"all" | "high" | "low">("all");

  const visible = useMemo(
    () =>
      entries.filter((entry) =>
        filter === "all" ? true : filter === "high" ? entry.prediction === "Yes" : entry.prediction === "No",
      ),
    [entries, filter],
  );

  const chartData = useMemo(
    () =>
      [...visible]
        .reverse()
        .map((entry, index) => ({
          index: index + 1,
          probability: entry.probability,
          time: new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        })),
    [visible],
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="accent">Local record</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Assessment history
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Your last 20 single-employee assessments, stored only in this browser. Reopen one to
            edit its inputs and run it again with a different model.
          </p>
        </div>
        {entries.length > 0 && (
          <Button
            variant="secondary"
            onClick={() => {
              clearHistory();
              setEntries([]);
              toast.success("History cleared");
            }}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear history
          </Button>
        )}
      </header>

      {entries.length === 0 ? (
        <Card className="mx-auto max-w-xl p-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <Clock3 className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold">No assessments yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete a prediction in the Predict tab and it will appear here automatically.
          </p>
          <Button className="mt-6" onClick={() => navigate("/")}>
            Start an assessment
          </Button>
        </Card>
      ) : (
        <>
          <div className="flex gap-1 rounded-xl bg-card-muted p-1 sm:w-fit" role="group" aria-label="Filter history">
            {(["all", "high", "low"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  filter === value ? "bg-card text-accent shadow-soft" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {value === "all" ? "All" : value === "high" ? "High risk" : "Low risk"}
              </button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Likelihood trend</CardTitle>
              <CardDescription>Most recent assessments on the right</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -12 }}>
                  <defs>
                    <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 1]} tickFormatter={(v: number) => `${Math.round(v * 100)}%`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value: number) => [formatPercent(value), "Likelihood"]}
                    contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="probability" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#riskFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-3 lg:grid-cols-2">
            {visible.map((entry) => (
              <Card key={entry.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="label-text">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                    <p className="num mt-2 text-2xl font-bold">{formatPercent(entry.probability)}</p>
                  </div>
                  <Badge tone={riskTone(entry.probability, entry.threshold)}>
                    {entry.prediction === "Yes" ? "High risk" : "Low risk"}
                  </Badge>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Model: <span className="num font-semibold text-foreground">{entry.model}</span> · threshold{" "}
                  <span className="num font-semibold text-foreground">{formatPercent(entry.threshold, 0)}</span>
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {Object.entries(entry.employee)
                    .slice(0, 4)
                    .map(([key, value]) => (
                      <span key={key} className="num rounded-lg bg-card-muted px-2 py-1 text-[10px] text-muted-foreground">
                        {key}: {String(value)}
                      </span>
                    ))}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-5"
                  onClick={() => {
                    sessionStorage.setItem("workpulse.reopen", JSON.stringify({ employee: entry.employee, model: entry.model }));
                    navigate("/");
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Reopen in Predict
                </Button>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
