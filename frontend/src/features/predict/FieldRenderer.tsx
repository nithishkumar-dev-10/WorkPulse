import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import {
  EDUCATION_TIERS,
  MAX_COMMUTE_KM,
  MODEL_DISTANCE_MAX,
  commuteKmToModel,
  commuteModelToKm,
} from "@/lib/modelInputs";
import type { SchemaField } from "@/types/api";
import { cn, formatPercent } from "@/lib/utils";

interface Props {
  field: SchemaField;
  value: number | string;
  onChange: (value: number | string) => void;
  error?: string;
  disabled?: boolean;
}

interface MappedProps {
  id: string;
  value: number | string;
  onChange: (value: number | string) => void;
  describedBy?: string;
  disabled?: boolean;
}

interface EducationProps extends MappedProps {
  tier: number;
}

interface CommuteProps extends MappedProps {
  modelValue: number;
}

function EducationField({ id, tier, onChange, describedBy, disabled }: EducationProps) {
  return (
    <Select
      value={String(tier)}
      onValueChange={(next) => onChange(Number(next))}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        aria-describedby={describedBy}
        className="text-xs sm:text-sm [&>span]:truncate"
      >
        <SelectValue placeholder="Select your qualification" />
      </SelectTrigger>
      <SelectContent>
        {EDUCATION_TIERS.map((item) => (
          <SelectItem key={item.tier} value={String(item.tier)} className="whitespace-normal text-xs">
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CommuteField({ id, modelValue, onChange, describedBy, disabled }: CommuteProps) {
  const [km, setKm] = useState(() => commuteModelToKm(modelValue));
  const lastEmitted = useRef<{ km: number; model: number } | null>(null);

  // Keep the km box in sync with resets, samples and reopened history entries,
  // without overwriting what the user just typed.
  useEffect(() => {
    const emitted = lastEmitted.current;
    if (emitted && emitted.model === modelValue && commuteKmToModel(emitted.km) === modelValue) {
      return;
    }
    setKm(commuteModelToKm(modelValue));
  }, [modelValue]);

  const updateKm = (next: number) => {
    const bounded = Math.min(MAX_COMMUTE_KM, Math.max(0, Math.round(next || 0)));
    const mapped = commuteKmToModel(bounded);
    setKm(bounded);
    lastEmitted.current = { km: bounded, model: mapped };
    onChange(mapped);
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        id={id}
        type="number"
        min={0}
        max={MAX_COMMUTE_KM}
        step={1}
        aria-describedby={describedBy}
        value={km}
        onChange={(event) => updateKm(Number(event.target.value))}
        disabled={disabled}
        className="num w-24"
      />
      <span className="text-sm font-semibold text-muted-foreground">km</span>
    </div>
  );
}

export function FieldRenderer({ field, value, onChange, error, disabled }: Props) {
  const id = `field-${field.name}`;
  const describedBy = error ? `${id}-error` : undefined;
  const isEducation = field.name === "Education";
  const isCommute = field.name === "DistanceFromHome";
  const isMappedField = isEducation || isCommute;
  const tier = Math.min(5, Math.max(1, Math.round(Number(value))));
  const modelValue = Math.min(
    MODEL_DISTANCE_MAX,
    Math.max(1, Math.round(Number(value))),
  );
  const mappedProps: MappedProps = { id, value, onChange, describedBy, disabled };
  const compactBadge = "num shrink-0 whitespace-nowrap normal-case px-2 py-0.5 leading-none";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold">
          {field.label}
        </label>
        {isEducation && (
          <Badge tone="accent" className={compactBadge}>
            Tier: {tier}/5
          </Badge>
        )}
        {isCommute && (
          <Badge tone="accent" className={compactBadge}>
            Model: {modelValue}/{MODEL_DISTANCE_MAX}
          </Badge>
        )}
        {field.type === "integer" && !isMappedField && (
          <span className="num rounded-lg bg-card-muted px-2 py-0.5 text-[11px] font-semibold leading-none text-foreground">
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

      {isEducation ? (
        <EducationField {...mappedProps} tier={tier} />
      ) : isCommute ? (
        <CommuteField {...mappedProps} modelValue={modelValue} />
      ) : field.type === "integer" ? (
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

      {!isMappedField && field.type === "integer" && field.min !== null && field.max !== null && (
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
