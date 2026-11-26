import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ExplainFactor } from "@/types/api";
import { formatSigned } from "@/lib/utils";

interface Datum extends ExplainFactor {
  signed: number;
}

function FactorTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Datum }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lift">
      <p className="font-semibold">{item.label}</p>
      <p className="num mt-1 text-muted-foreground">
        {formatSigned(item.signed)} SHAP impact — pushes risk{" "}
        {item.direction === "increases" ? "up" : "down"}
      </p>
    </div>
  );
}

export function FactorChart({ factors }: { factors: ExplainFactor[] }) {
  const data: Datum[] = factors.map((factor) => ({
    ...factor,
    signed: factor.direction === "increases" ? factor.value : -factor.value,
  }));
  const max = Math.max(0.01, ...data.map((item) => Math.abs(item.signed)));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
          <XAxis
            type="number"
            domain={[-max * 1.15, max * 1.15]}
            tickFormatter={(value: number) => value.toFixed(2)}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={175}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine x={0} stroke="hsl(var(--border))" />
          <ChartTooltip content={<FactorTooltip />} cursor={{ fill: "hsl(var(--card-muted) / 0.6)" }} />
          <Bar dataKey="signed" radius={[5, 5, 5, 5]} barSize={14}>
            {data.map((item) => (
              <Cell
                key={item.feature}
                fill={
                  item.direction === "increases"
                    ? "hsl(var(--risk-high))"
                    : "hsl(var(--risk-low))"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap gap-4 text-[11px] font-medium text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <ArrowUpRight className="h-3.5 w-3.5 text-risk-high" aria-hidden="true" />
          Pushes attrition risk up
        </span>
        <span className="flex items-center gap-1.5">
          <ArrowDownRight className="h-3.5 w-3.5 text-risk-low" aria-hidden="true" />
          Pushes attrition risk down
        </span>
      </div>
    </div>
  );
}
