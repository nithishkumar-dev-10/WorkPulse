import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip } from "@/components/ui/tooltip";
import type { SchemaField } from "@/types/api";
import { cn, formatPercent } from "@/lib/utils";

interface Props {
  field: SchemaField;
  value: number | string;
  onChange: (value: number | string) => void;
  error?: string;
  disabled?: boolean;
}

export function FieldRenderer({ field, value, onChange, error, disabled }: Props) {
  const id = `field-${field.name}`;
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold">
          {field.label}
        </label>
        {field.type === "integer" && (
          <span className="num rounded-lg bg-card-muted px-2 py-1 text-xs font-semibold text-foreground">
            {String(value)}
          </span>
        )}
        {field.type === "categorical" && field.ui !== "toggle" && (
          <Tooltip content={`Choose a value for ${field.label.toLowerCase()}.`}>
            <button type="button" aria-label={`About ${field.label}`}>
              <Info className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            </button>
          </Tooltip>
        )}
      </div>

      {field.type === "integer" ? (
        <div className="flex items-center gap-4">
          <Slider
            id={id}
            aria-label={field.label}
            aria-describedby={describedBy}
            min={field.min ?? 0}
            max={field.max ?? 100}
            step={1}
            value={[Number(value)]}
            onValueChange={([next]) => onChange(next)}
            disabled={disabled}
            className="flex-1"
          />
          <Input
            type="number"
            aria-label={`${field.label} exact value`}
            min={field.min ?? undefined}
            max={field.max ?? undefined}
            value={Number(value)}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isFinite(next)) onChange(next);
            }}
            disabled={disabled}
            className={cn("num w-24", error && "border-risk-high")}
          />
        </div>
      ) : field.ui === "toggle" ? (
        <div className="flex items-center justify-between rounded-xl border border-border bg-card-muted/50 px-3.5 py-2.5">
          <span className="num text-sm font-semibold">{String(value)}</span>
          <Switch
            id={id}
            aria-label={field.label}
            aria-describedby={describedBy}
            checked={value === "Yes"}
            onCheckedChange={(checked) => onChange(checked ? "Yes" : "No")}
            disabled={disabled}
          />
        </div>
      ) : (
        <Select
          value={String(value)}
          onValueChange={(next) => onChange(next)}
          disabled={disabled}
        >
          <SelectTrigger id={id} aria-describedby={describedBy}>
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {field.type === "integer" && field.min !== null && field.max !== null && (
        <div className="num flex justify-between text-[10px] text-muted-foreground">
          <span>{field.min}</span>
          <span>
            typical {formatPercent((Number(value) - field.min) / (field.max - field.min), 0)} of range
          </span>
          <span>{field.max}</span>
        </div>
      )}

      {error && (
        <p id={describedBy} role="alert" className="text-xs font-medium text-risk-high">
          {error}
        </p>
      )}
    </div>
  );
}
