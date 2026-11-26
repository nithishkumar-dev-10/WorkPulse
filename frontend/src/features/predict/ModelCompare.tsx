import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ModelInfo, Prediction } from "@/types/api";
import { formatPercent } from "@/lib/utils";
import { riskTone } from "@/lib/risk";

export function ModelCompare({
  models,
  results,
}: {
  models: ModelInfo[];
  results: Prediction[];
}) {
  const reduced = useReducedMotion();
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {results.map((result, index) => {
        const info = models.find((model) => model.id === result.model);
        const tone = riskTone(result.probability, result.threshold);
        return (
          <motion.div
            key={result.model}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : index * 0.08 }}
          >
            <Card className="h-full p-4">
              <p className="text-sm font-bold">{info?.name ?? result.model}</p>
              <p className="num mt-2 text-2xl font-bold">
                {formatPercent(result.probability)}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <Badge tone={tone}>
                  {result.prediction === "Yes" ? "High risk" : "Low risk"}
                </Badge>
                <span className="num text-[10px] text-muted-foreground">
                  @ {(result.threshold * 100).toFixed(0)}%
                </span>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
