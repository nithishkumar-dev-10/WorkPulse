import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Download,
  FileSpreadsheet,
  Loader2,
  Play,
  RefreshCw,
  Search,
  ShieldAlert,
  UploadCloud,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { coerceRows, downloadCsv, parseCsv, templateRows } from "@/lib/csv";
import { cn, formatPercent } from "@/lib/utils";
import { riskTone } from "@/lib/risk";
import type { Employee, Prediction, SchemaField } from "@/types/api";

interface ResultRow {
  employee: Employee;
  prediction: Prediction;
}

const MAX_BATCH_ROWS = 500;

export function BatchPage() {
  // Refetch on mount so a failed request cached on another page can't leave
  // this page stuck on an error when the API has recovered.
  const schemaQuery = useQuery({
    queryKey: ["schema"],
    queryFn: api.schema,
    retry: 2,
    refetchOnMount: "always",
  });
  const modelsQuery = useQuery({
    queryKey: ["models"],
    queryFn: api.models,
    retry: 2,
    refetchOnMount: "always",
  });
  const fields = schemaQuery.data ?? [];
  const models = modelsQuery.data?.models ?? [];

  const [model, setModel] = useState("");
  const [rows, setRows] = useState<Employee[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"probability" | "prediction" | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeModel = model || modelsQuery.data?.default || "";

  const mutation = useMutation({
    mutationFn: (employees: Employee[]) => api.predictBatch(activeModel, employees),
    onSuccess: (response, employees) => {
      setResults(
        response.predictions.map((prediction, index) => ({
          employee: employees[index],
          prediction,
        })),
      );
      toast.success(`Scored ${response.count} employees`);
    },
    onError: (error) => toast.error(error.message),
  });

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = await parseCsv(file);
      if (parsed.length === 0) throw new Error("The CSV contains no rows.");
      const capped = coerceRows(parsed, fields).slice(0, MAX_BATCH_ROWS);
      setRows(capped);
      setResults([]);
      toast.success(
        `${capped.length} rows loaded${parsed.length > MAX_BATCH_ROWS ? ` (first ${MAX_BATCH_ROWS})` : ""}`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read that CSV.");
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void handleFile(event.dataTransfer.files[0]);
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    void handleFile(event.target.files?.[0]);
  };

  const highRisk = results.filter(
    (row) => row.prediction.prediction === "Yes",
  ).length;
  const average = results.length
    ? results.reduce((sum, row) => sum + row.prediction.probability, 0) / results.length
    : 0;

  const distribution = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => ({
        bucket: `${index * 10}–${(index + 1) * 10}%`,
        count: results.filter(
          (row) => Math.min(9, Math.floor(row.prediction.probability * 10)) === index,
        ).length,
      })),
    [results],
  );

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    let filtered = results.filter((row) =>
      query
        ? Object.values(row.employee).some((value) => String(value).toLowerCase().includes(query))
        : true,
    );
    if (sortKey) {
      filtered = [...filtered].sort((a, b) => {
        const left =
          sortKey === "probability"
            ? a.prediction.probability
            : a.prediction.prediction;
        const right =
          sortKey === "probability"
            ? b.prediction.probability
            : b.prediction.prediction;
        return sortAsc ? left < right ? -1 : 1 : left > right ? -1 : 1;
      });
    }
    return filtered;
  }, [results, search, sortKey, sortAsc]);

  const metadataError =
    (schemaQuery.error instanceof Error && schemaQuery.error.message) ||
    (modelsQuery.error instanceof Error && modelsQuery.error.message) ||
    "";
  const retrying = schemaQuery.isFetching || modelsQuery.isFetching;

  if (schemaQuery.isError || modelsQuery.isError) {
    return (
      <Card className="mx-auto max-w-xl p-8 text-center shadow-float">
        <span className="icon-badge icon-badge-indigo mx-auto mb-4">
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="text-xl font-bold">Couldn&apos;t load batch settings</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {metadataError || "The form schema and model list could not be loaded."}
        </p>
        <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
          Check that the API is running and that this origin is allowed, then retry.
        </p>
        <Button
          className="mt-5"
          onClick={() => {
            void schemaQuery.refetch();
            void modelsQuery.refetch();
          }}
          disabled={retrying}
        >
          {retrying ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          )}
          Retry
        </Button>
      </Card>
    );
  }

  if (schemaQuery.isLoading || modelsQuery.isLoading || fields.length === 0 || models.length === 0) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-72 skeleton-shine rounded-xl" />
        <Card className="p-8 text-sm text-muted-foreground">
          Loading assessment settings…
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <Badge tone="accent">Scale up</Badge>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="text-gradient text-gradient-indigo">Batch assessment</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Upload a CSV with the same columns as the single-employee form. Every row is
          checked before it is scored.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Upload employee data</CardTitle>
          <CardDescription>
            CSV with 30 columns · up to {MAX_BATCH_ROWS} rows per run · Education 1–5 ·
            DistanceFromHome 1–29
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "flex flex-col items-center justify-center rounded-[22px] border-2 border-dashed px-6 py-12 text-center backdrop-blur-xl transition-all duration-300",
              dragging
                ? "border-royal bg-royal-soft/80 shadow-float"
                : "border-border/80 bg-white/60 hover:border-royal/40 hover:shadow-card",
            )}
          >
            <span className="icon-badge icon-badge-blue mb-4 h-12 w-12">
              <UploadCloud className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold">Drop a CSV here, or browse files</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Use the template below to match the expected columns.
            </p>
            <p className="mt-2 max-w-md text-[11px] leading-relaxed text-muted-foreground">
              CSV values go straight to the model: <span className="num">Education</span> 1–5
              (1 = high school / below college, 2 = diploma / associate, 3 = bachelor&apos;s,
              4 = master&apos;s, 5 = doctorate) and <span className="num">DistanceFromHome</span> 1–29.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={onChange}
              aria-label="Upload employee CSV"
            />
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button size="sm" onClick={() => inputRef.current?.click()}>
                <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                Choose file
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={fields.length === 0}
                onClick={() => {
                  downloadCsv("workpulse-template.csv", templateRows(fields));
                  toast.success("Template downloaded");
                }}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download template CSV
              </Button>
            </div>
          </div>

          {rows.length > 0 && (
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="label-text">Preview · first 5 of {rows.length}</p>
                <div className="flex items-center gap-2">
                  <label htmlFor="batch-model" className="label-text">
                    Model
                  </label>
                  <select
                    id="batch-model"
                    value={activeModel}
                    onChange={(event) => setModel(event.target.value)}
                    className="h-9 rounded-xl border border-border/80 bg-white/80 px-3 text-xs font-semibold shadow-soft"
                  >
                    {models.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    onClick={() => mutation.mutate(rows)}
                    disabled={mutation.isPending || !activeModel}
                  >
                    {mutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Play className="h-4 w-4" aria-hidden="true" />
                    )}
                    Run predictions
                  </Button>
                </div>
              </div>
              <div className="glass-panel overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead className="bg-card-muted text-muted-foreground">
                    <tr>
                      {fields.slice(0, 8).map((field: SchemaField) => (
                        <th key={field.name} className="px-3 py-2 font-semibold">
                          {field.name}
                        </th>
                      ))}
                      <th className="px-3 py-2 font-semibold">…</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 5).map((row, index) => (
                      <tr key={index} className="border-t border-border">
                        {fields.slice(0, 8).map((field) => (
                          <td key={field.name} className="num px-3 py-2">
                            {String(row[field.name] ?? "")}
                          </td>
                        ))}
                        <td className="px-3 py-2 text-muted-foreground">…</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Employees scored",
                caption: "Processed",
                value: String(results.length),
                tone: "accent" as const,
                icon: UsersRound,
                accent: "accent-blue",
                badge: "icon-badge-blue",
                gradient: "text-gradient-blue",
              },
              {
                label: "High risk",
                caption: "Above threshold",
                value: String(highRisk),
                tone: "high" as const,
                icon: ShieldAlert,
                accent: "accent-indigo",
                badge: "icon-badge-indigo",
                gradient: "text-gradient-indigo",
              },
              {
                label: "Average likelihood",
                caption: "Across cohort",
                value: formatPercent(average),
                tone: "low" as const,
                icon: Activity,
                accent: "accent-teal",
                badge: "icon-badge-teal",
                gradient: "text-gradient-teal",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className={cn("accent-bar p-5 shadow-float", stat.accent)}>
                  <div className="flex items-start justify-between gap-3">
                    <span className={cn("icon-badge", stat.badge)}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <Badge tone={stat.tone}>{stat.caption}</Badge>
                  </div>
                  <p
                    className={cn(
                      "num mt-5 text-3xl font-extrabold tracking-tight text-gradient",
                      stat.gradient,
                    )}
                  >
                    {stat.value}
                  </p>
                  <p className="label-text mt-1">{stat.label}</p>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Likelihood distribution</CardTitle>
              <CardDescription>Count of employees by risk band</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution}>
                  <defs>
                    <linearGradient id="batchBars" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--indigo))" />
                      <stop offset="100%" stopColor="hsl(var(--cyan))" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 14,
                      border: "1px solid hsl(0 0% 100% / 0.9)",
                      background: "hsl(var(--card) / 0.95)",
                      boxShadow: "0 12px 30px -12px hsl(var(--shadow) / 0.3)",
                      backdropFilter: "blur(12px)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="url(#batchBars)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Results</CardTitle>
                <CardDescription>Search, sort and export your scoring run</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search rows"
                    className="w-48 pl-9"
                    aria-label="Search prediction results"
                  />
                </div>
                <Button
                  variant="secondary"
                  onClick={() =>
                    downloadCsv(
                      "workpulse-results.csv",
                      results.map((row) => ({
                        ...row.employee,
                        Prediction: row.prediction.prediction,
                        Probability: row.prediction.probability,
                        Threshold: row.prediction.threshold,
                      })),
                    )
                  }
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {visible.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No rows match your search.
                </p>
              ) : (
                <div className="glass-panel overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-xs">
                    <thead className="bg-card-muted text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold">#</th>
                        <th className="px-3 py-2.5 font-semibold">Age</th>
                        <th className="px-3 py-2.5 font-semibold">Department</th>
                        <th className="px-3 py-2.5 font-semibold">
                          <button
                            type="button"
                            onClick={() => {
                              setSortKey("probability");
                              setSortAsc(sortKey !== "probability" || !sortAsc);
                            }}
                          >
                            Likelihood {sortKey === "probability" ? (sortAsc ? "↑" : "↓") : ""}
                          </button>
                        </th>
                        <th className="px-3 py-2.5 font-semibold">Verdict</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((row, index) => {
                        const tone = riskTone(
                          row.prediction.probability,
                          row.prediction.threshold,
                        );
                        return (
                          <tr key={index} className="border-t border-border">
                            <td className="num px-3 py-2.5 text-muted-foreground">{index + 1}</td>
                            <td className="num px-3 py-2.5">{String(row.employee.Age ?? "")}</td>
                            <td className="px-3 py-2.5">
                              {String(row.employee.Department ?? "")}
                            </td>
                            <td className="num px-3 py-2.5 font-semibold">
                              {formatPercent(row.prediction.probability)}
                            </td>
                            <td className="px-3 py-2.5">
                              <Badge tone={tone}>
                                {row.prediction.prediction === "Yes" ? "High risk" : "Low risk"}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
