import { useQuery } from "@tanstack/react-query";
import {
  Brain,
  Database,
  Gauge,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Trees,
  TrendingUp,
  Zap,
} from "lucide-react";
import { api } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatPercent } from "@/lib/utils";

const pillars = [
  {
    icon: Database,
    title: "Transparent inputs",
    body: "The form adapts to the model's data requirements. Every range and category you see reflects the data the model was trained on.",
  },
  {
    icon: Gauge,
    title: "Tuned thresholds",
    body: "Each model uses a decision threshold chosen during training to balance false positives and false negatives — not a generic 50% cut-off.",
  },
  {
    icon: Brain,
    title: "Explainable factors",
    body: "SHAP values show which profile factors pushed an individual prediction up or down relative to the model's average.",
  },
  {
    icon: HeartHandshake,
    title: "Human-first decisions",
    body: "A prediction is a prompt for a supportive conversation. It is never a verdict about a person and should never be used in isolation.",
  },
];

const pillarBadges = [
  "icon-badge-indigo",
  "icon-badge-blue",
  "icon-badge-teal",
  "icon-badge-cyan",
];

const modelStyles = [
  {
    match: "logistic",
    icon: TrendingUp,
    accent: "accent-indigo",
    badge: "icon-badge-indigo",
    text: "text-gradient-indigo",
    bar: "bg-gradient-to-r from-indigo to-royal",
  },
  {
    match: "forest",
    icon: Trees,
    accent: "accent-blue",
    badge: "icon-badge-blue",
    text: "text-gradient-blue",
    bar: "bg-gradient-to-r from-royal to-cyan",
  },
  {
    match: "xgboost",
    icon: Zap,
    accent: "accent-teal",
    badge: "icon-badge-teal",
    text: "text-gradient-teal",
    bar: "bg-gradient-to-r from-teal to-cyan",
  },
] as const;

function styleForModel(name: string) {
  return modelStyles.find((style) => name.toLowerCase().includes(style.match)) ?? modelStyles[2];
}

export function AboutPage() {
  const modelsQuery = useQuery({ queryKey: ["models"], queryFn: api.models });
  const models = modelsQuery.data?.models ?? [];

  return (
    <div className="space-y-8">
      <header>
        <Badge tone="accent">Methodology</Badge>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="text-gradient text-gradient-indigo">About WorkPulse</span>
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          WorkPulse estimates employee attrition risk from the IBM HR Analytics dataset. It
          combines three trained classifiers with per-model tuned thresholds and individual
          explanations, then presents the result as decision support for people leaders.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {pillars.map(({ icon: Icon, title, body }, index) => (
          <Card key={title} className="p-6">
            <div className={cn("icon-badge mb-4", pillarBadges[index])}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trained models</CardTitle>
          <CardDescription>
            Default: <span className="num font-semibold text-foreground">{modelsQuery.data?.default ?? "xgboost"}</span> ·
            thresholds tuned during training for balanced decisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {models.map((model, index) => {
              const style = styleForModel(model.name);
              const Icon = style.icon;
              return (
                <div key={model.id} className={cn("card-surface accent-bar p-5 shadow-float", style.accent)}>
                  <div className="flex items-start justify-between gap-3">
                    <span className={cn("icon-badge", style.badge)}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="rounded-full bg-white/75 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                      Model {index + 1}
                    </span>
                  </div>
                  <p className="mt-5 text-sm font-bold">{model.name}</p>
                  <p
                    className={cn(
                      "num mt-1.5 text-3xl font-extrabold tracking-tight text-gradient",
                      style.text,
                    )}
                  >
                    {formatPercent(model.threshold, 0)}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">tuned decision threshold</p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-card-muted/90">
                    <div
                      className={cn("h-full rounded-full", style.bar)}
                      style={{ width: `${Math.min(100, Math.max(0, model.threshold * 100))}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {models.length === 0 && (
              <p className="text-sm text-muted-foreground">Loading models…</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="accent-bar accent-indigo p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="icon-badge icon-badge-indigo">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-base font-bold">Privacy &amp; scope</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Prediction requests are processed in memory and are not written to a database.
            Single-employee history lives in your browser's local storage only. Batch CSV files
            are parsed locally and the rows are sent for scoring; results stay in this tab until
            you export or close it.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The underlying data describes a specific historical population. Performance on other
            organisations, roles or time periods has not been validated.
          </p>
        </Card>
        <Card className="accent-bar accent-teal p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="icon-badge icon-badge-teal">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-base font-bold">How to use it</h2>
          </div>
          <ol className="list-inside list-decimal space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>Enter or load a typical employee profile in the Predict tab.</li>
            <li>Review the likelihood gauge against the tuned threshold marker.</li>
            <li>Read the SHAP factors to understand what moved the prediction.</li>
            <li>Compare models, or upload a CSV to score a whole team.</li>
            <li>Discuss results with the employee and apply human judgement.</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
