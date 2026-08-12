import * as React from "react";
import { ChoiceJourneyOption } from "../models/ChoiceJourneyModels";

interface JourneyLabelRecord {
  Label?: string;
  label?: string;
  UserLocalizedLabel?: { Label?: string };
  LocalizedLabels?: { Label?: string }[];
}

interface JourneyOptionRecord {
  Value?: number | string;
  value?: number | string;
  Label?: string | JourneyLabelRecord;
  label?: string | JourneyLabelRecord;
  Color?: string;
  color?: string;
}

interface JourneyOptionSetMetadata {
  Options?: unknown;
  options?: unknown;
}

interface JourneyOptionProperty extends ComponentFramework.PropertyTypes.OptionSetProperty {
  options?: unknown;
  Options?: unknown;
  attributes?: ComponentFramework.PropertyTypes.OptionSetProperty["attributes"] & JourneyOptionSetMetadata;
}

function readLabel(label: JourneyOptionRecord["Label"]): string | undefined {
  if (typeof label === "string" && label.trim().length > 0) {
    return label;
  }

  if (isJourneyLabelRecord(label)) {
    const record = label;
    if (typeof record.Label === "string" && record.Label.trim().length > 0) return record.Label;
    if (typeof record.label === "string" && record.label.trim().length > 0) return record.label;
    if (typeof record.UserLocalizedLabel?.Label === "string" && record.UserLocalizedLabel.Label.trim().length > 0) {
      return record.UserLocalizedLabel.Label;
    }
    const firstLocalized = record.LocalizedLabels?.[0]?.Label;
    if (typeof firstLocalized === "string" && firstLocalized.trim().length > 0) return firstLocalized;
  }

  return undefined;
}

function readValue(value: JourneyOptionRecord["Value"]): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function readColor(color: string | undefined): string | undefined {
  if (typeof color !== "string") return undefined;
  const trimmed = color.trim();
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed) ? trimmed : undefined;
}

function isJourneyLabelRecord(value: unknown): value is JourneyLabelRecord {
  return Boolean(value && typeof value === "object");
}

function isJourneyOptionRecord(item: unknown): item is JourneyOptionRecord {
  return Boolean(item && typeof item === "object");
}

export function useJourneyOptions(choiceProperty: JourneyOptionProperty | undefined): ChoiceJourneyOption[] {
  return React.useMemo(() => {
    if (!choiceProperty) return [];
    const sources: unknown[] = [choiceProperty.attributes?.Options, choiceProperty.attributes?.options, choiceProperty.Options, choiceProperty.options];

    for (const source of sources) {
      if (!Array.isArray(source)) continue;

      const options = source.flatMap((item) => {
        if (!isJourneyOptionRecord(item)) return [];
        const option = item;
        const value = readValue(option.Value ?? option.value);
        const label = readLabel(option.Label ?? option.label);
        const color = readColor(option.Color ?? option.color);
        if (value === undefined || !label) return [];
        return [{ value, label, color }];
      });

      if (options.length > 0) return options;
    }

    return [];
  }, [choiceProperty]);
}
