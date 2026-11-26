import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  GitCompare,
  Loader2,
  RotateCcw,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { OfflineState } from "@/components/OfflineState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultSkeleton } from "@/components/ui/skeleton";
import { FieldRenderer } from "@/features/predict/FieldRenderer";
import { FactorChart } from "@/features/predict/FactorChart";
import { ModelCompare } from "@/features/predict/ModelCompare";
import { RiskGauge } from "@/features/predict/RiskGauge";
import { addHistory } from "@/lib/history";
import { cn } from "@/lib/utils";
import type { Employee, Explanation, Prediction, SchemaField } from "@/types/api";

type FormValues = Employee;

function buildResolver(fields: SchemaField[]): Resolver<FormValues> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if (field.type === "categorical") {
      const options = field.options ?? [];
      shape[field.name] = options.length
        ? z.enum(options as [string, ...string[]], {
            errorMap: () => ({ message: `Choose a valid ${field.label.toLowerCase()}.` }),
          })
        : z.string();
    } else {
      shape[field.name] = z
        .number({ invalid_type_error: `${field.label} must be a number.` })
        .int(`${field.label} must be a whole number.`)
        .min(field.min ?? 0, `${field.label} must be at least ${field.min}.`)
        .max(field.max ?? 100, `${field.label} must be at most ${field.max}.`);
    }
  }

  return zodResolver(z.object(shape) as z.ZodType<FormValues>);
}

function friendlyFieldLabel(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export function PredictPage() {
  const reduced = useReducedMotion();
  const schemaQuery = useQuery({ queryKey: ["schema"], queryFn: api.schema });
  const modelsQuery = useQuery({ queryKey: ["models"], queryFn: api.models });
  const healthQuery = useQuery({ queryKey: ["health"], queryFn: api.health });

  const fields = useMemo(() => schemaQuery.data ?? [], [schemaQuery.data]);
  const groups = useMemo(
    () => Array.from(new Set(fields.map((field) => field.group))),
    [fields],
  );
  const defaults = useMemo<FormValues>(
    () => Object.fromEntries(fields.map((field) => [field.name, field.default])),
    [fields],
  );

  const {
    control,
    handleSubmit,
    trigger,
    reset,
    getValues,
  } = useForm<FormValues>({
    resolver: buildResolver(fields),
    defaultValues: defaults,
    mode: "onChange",
  });

  const [step, setStep] = useState(0);
  const [model, setModel] = useState("");
  const [result, setResult] = useState<{
    prediction: Prediction;
    explanation: Explanation | null;
  } | null>(null);
  const [comparison, setComparison] = useState<Prediction[]>([]);

  useEffect(() => {
    if (!fields.length) return;
    const reopened = sessionStorage.getItem("workpulse.reopen");
    if (reopened) {
      sessionStorage.removeItem("workpulse.reopen");
      try {
        const payload = JSON.parse(reopened) as { employee: Employee; model: string };
        reset(payload.employee);
        if (payload.model) setModel(payload.model);
        toast.info("Reopened a prediction from history");
        return;
      } catch {
        sessionStorage.removeItem("workpulse.reopen");
      }
    }
    reset(defaults);
  }, [fields.length, defaults, reset]);

  useEffect(() => {
    if (!model && modelsQuery.data) setModel(modelsQuery.data.default);
  }, [modelsQuery.data, model]);

  const stepFields = fields.filter((field) => field.group === groups[step]);
  const models = modelsQuery.data?.models ?? [];

  const predictMutation = useMutation({
    mutationFn: async (employee: Employee) => {
      const prediction = await api.predict(model, employee);
      let explanation: Explanation | null = null;
      if (healthQuery.data?.explain_enabled) {
        try {
          explanation = await api.explain(model, employee);
        } catch {
          toast.warning("Prediction ready, but explanations are unavailable.");
        }
      }
      return { prediction, explanation };
    },
    onSuccess: (data, employee) => {
      setResult(data);
      setComparison([]);
      addHistory({
        id: `${Date.now()}`,
        timestamp: new Date().toISOString(),
        model,
        prediction: data.prediction.prediction,
        probability: data.prediction.probability,
        threshold: data.prediction.threshold,
        employee,
      });
      toast.success("Prediction ready");
    },
    onError: (error) => toast.error(error.message),
  });

  const compareMutation = useMutation({
    mutationFn: (employee: Employee) =>
      Promise.all(models.map((item) => api.predict(item.id, employee))),
    onSuccess: (results) => {
      setComparison(results);
      toast.success("Compared all models");
    },
    onError: (error) => toast.error(error.message),
  });

  const goNext = async () => {
    const valid = await trigger(stepFields.map((field) => field.name));
    if (!valid) {
      toast.error("Check the highlighted fields before continuing.");
      return;
    }
    setStep((current) => Math.min(current + 1, groups.length - 1));
  };

  const loadSample = async () => {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}examples/employee.json`);
      if (!response.ok) throw new Error("sample unavailable");
      // The preset stores model-domain values: Education 3 (Bachelor's) and
      // DistanceFromHome 15 (a 15 km city commute on the normalized scale).
      const sample = (await response.json()) as Employee;
      const allowed = new Set(fields.map((field) => field.name));
      reset(Object.fromEntries(Object.entries(sample).filter(([key]) => allowed.has(key))));
      setStep(0);
      setResult(null);
      toast.success("Typical employee loaded");
    } catch {
      toast.error("Could not load the sample employee.");
    }
  };

  if (schemaQuery.isError) {
    return <OfflineState onRetry={() => void schemaQuery.refetch()} />;
  }

  if (schemaQuery.isLoading || !fields.length) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-80 skeleton-shine rounded-xl" />
        <div className="h-64 skeleton-shine rounded-2xl" />
        <div className="h-48 skeleton-shine rounded-2xl" />
      </div>
    );
  }

  const isLastStep = step === groups.length - 1;
  const busy = predictMutation.isPending || compareMutation.isPending;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="accent">Primary analysis</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="text-gradient text-gradient-indigo">Attrition risk assessment</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Estimate how likely an employee is to leave, based on their profile. Enter a
            real qualification and commute distance in km — both are translated to the
            exact numeric scale the model was trained on.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => void loadSample()} disabled={busy}>
            <UserRoundCheck className="h-4 w-4" aria-hidden="true" />
            Load typical employee
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              reset(defaults);
              setStep(0);
              setResult(null);
              setComparison([]);
            }}
            disabled={busy}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader className="gap-4 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Employee profile</CardTitle>
              <CardDescription>
                Step {step + 1} of {groups.length} · {groups[step]}
              </CardDescription>
            </div>
            <fieldset className="flex flex-wrap gap-1 rounded-2xl border border-white/70 bg-card-muted/70 p-1 shadow-soft backdrop-blur" aria-label="Prediction model">
              {models.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={busy}
                  onClick={() => setModel(item.id)}
                  aria-pressed={model === item.id}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-300",
                    model === item.id
                      ? "segment-active"
                      : "text-muted-foreground hover:bg-white/70 hover:text-foreground",
                  )}
                >
                  {item.name}
                </button>
              ))}
            </fieldset>
          </div>
          <div className="flex gap-1.5" aria-hidden="true">
            {groups.map((group, index) => (
              <span
                key={group}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-300",
                  index <= step
                    ? "bg-gradient-to-r from-indigo via-royal to-teal shadow-[0_2px_8px_-2px_hsl(var(--royal)/0.6)]"
                    : "bg-card-muted",
                )}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit((values) => predictMutation.mutate(values))}
            noValidate
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={reduced ? false : { opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? undefined : { opacity: 0, x: -18 }}
                transition={{ duration: reduced ? 0 : 0.25 }}
                className="grid min-h-[270px] gap-x-8 gap-y-6 sm:grid-cols-2"
              >
                {stepFields.map((field) => (
                  <Controller
                    key={field.name}
                    name={field.name}
                    control={control}
                    render={({ field: controlField, fieldState }) => (
                      <FieldRenderer
                        field={field}
                        value={controlField.value ?? field.default}
                        onChange={controlField.onChange}
                        error={fieldState.error?.message}
                        disabled={busy}
                      />
                    )}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                disabled={step === 0 || busy}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </Button>
              {isLastStep ? (
                <Button type="submit" size="lg" disabled={busy || !model}>
                  {predictMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  )}
                  Assess risk
                </Button>
              ) : (
                <Button type="button" onClick={() => void goNext()}>
                  Continue
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {(predictMutation.isPending || result) && (
        <Card className="overflow-hidden border-royal/25 shadow-float">
          <CardHeader>
            <CardTitle>Assessment</CardTitle>
            <CardDescription>
              {result
                ? `${models.find((item) => item.id === result.prediction.model)?.name ?? result.prediction.model} · tuned threshold ${(result.prediction.threshold * 100).toFixed(0)}%`
                : "Running the model and preparing explanations…"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {predictMutation.isPending && !result ? (
              <ResultSkeleton />
            ) : result ? (
              <div className="space-y-8">
                <div className="grid gap-8 lg:grid-cols-[minmax(260px,0.85fr)_1.15fr] lg:items-center">
                  <RiskGauge
                    probability={result.prediction.probability}
                    threshold={result.prediction.threshold}
                  />
                  <div className="space-y-4">
                    <div className="glass-panel relative overflow-hidden p-5">
                      <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-indigo via-royal to-teal" aria-hidden="true" />
                      <p className="label-text">Interpretation</p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {result.prediction.prediction === "Yes"
                          ? `This profile crosses the model's ${(result.prediction.threshold * 100).toFixed(0)}% decision threshold. Treat it as a prompt to start a supportive retention conversation — not a conclusion.`
                          : `This profile sits below the model's ${(result.prediction.threshold * 100).toFixed(0)}% decision threshold. Continue with normal check-ins and manager judgement.`}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => compareMutation.mutate(getValues())}
                      disabled={busy || models.length === 0}
                    >
                      {compareMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <GitCompare className="h-4 w-4" aria-hidden="true" />
                      )}
                      Compare models
                    </Button>
                  </div>
                </div>

                {comparison.length > 0 && (
                  <div>
                    <p className="label-text mb-3">Side-by-side models</p>
                    <ModelCompare models={models} results={comparison} />
                  </div>
                )}

                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="text-sm font-bold">Why this result?</h3>
                    <Badge tone="neutral">SHAP</Badge>
                  </div>
                  {result.explanation ? (
                    <div className="glass-panel p-4">
                      <FactorChart factors={result.explanation.top_factors} />
                    </div>
                  ) : (
                    <p className="glass-panel p-4 text-sm text-muted-foreground">
                      Contributing factors aren&apos;t available on this server right now.
                    </p>
                  )}
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    Values show how each factor moved this individual prediction relative
                    to the model average. {friendlyFieldLabel("SHAP")} values are not
                    causal claims.
                  </p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
