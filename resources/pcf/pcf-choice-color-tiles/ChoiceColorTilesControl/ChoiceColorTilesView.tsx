import * as React from "react";
import { IInputs } from "./generated/ManifestTypes";

interface ChoiceOption {
  value: number;
  label: string;
  color?: string;
}

type ColorMapping = Record<string, string>;
type FinalColorSource = "metadata" | "mapping" | "fallback";

interface ResolvedColorInfo {
  metadataColor?: string;
  mappingColor?: string;
  finalColor: string;
  finalColorSource: FinalColorSource;
}

interface ContextAvailability {
  hasSelectedChoiceParameter: boolean;
  hasRawValue: boolean;
  hasAttributes: boolean;
  hasOptions: boolean;
  optionCount: number;
  isDesignerFallback: boolean;
  colorSource: FinalColorSource | "mixed" | "none";
}

export interface ChoiceColorTilesViewProps {
  context: ComponentFramework.Context<IInputs>;
  selectedValue: number | null;
  onSelectionChange: (value: number | null) => void;
}

const FALLBACK_COLORS = ["#2563EB", "#0F766E", "#7C3AED", "#DB2777", "#CA8A04", "#EA580C", "#0891B2", "#334155"];

const styles: Record<string, React.CSSProperties> = {
  root: {
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "'Segoe UI', sans-serif",
    color: "#201f1e",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  group: {
    display: "grid",
    gap: "8px",
  },
  tile: {
    borderRadius: "8px",
    border: "1px solid #d1d1d1",
    backgroundColor: "#ffffff",
    padding: "10px 12px",
    minHeight: "52px",
    textAlign: "left",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxSizing: "border-box",
    transition: "all 120ms ease",
    outline: "none",
  },
  tileCompact: {
    minHeight: "42px",
    padding: "8px 10px",
  },
  tileLabel: {
    fontSize: "13px",
    lineHeight: "18px",
    fontWeight: 600,
    color: "#201f1e",
  },
  tileSelected: {
    borderWidth: "2px",
    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.03)",
  },
  tileDisabled: {
    cursor: "not-allowed",
    opacity: 0.7,
  },
  tileReadOnlySelected: {
    opacity: 1,
  },
  selectedHint: {
    marginTop: "6px",
    fontSize: "11px",
    color: "#323130",
  },
  empty: {
    padding: "10px",
    border: "1px solid #e1dfdd",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#605e5c",
    backgroundColor: "#faf9f8",
  },
  clearButton: {
    border: "1px solid #8a8886",
    borderRadius: "4px",
    backgroundColor: "#ffffff",
    color: "#323130",
    padding: "6px 10px",
    fontSize: "12px",
    cursor: "pointer",
    width: "fit-content",
  },
};

function getBooleanInput(input: ComponentFramework.PropertyTypes.TwoOptionsProperty | undefined, defaultValue: boolean): boolean {
  const raw = input?.raw;
  if (typeof raw === "boolean") return raw;
  return defaultValue;
}

function getNumberInput(input: ComponentFramework.PropertyTypes.WholeNumberProperty | undefined, defaultValue: number): number {
  const raw = input?.raw;
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return raw;
  return defaultValue;
}

function normalizeColor(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) return trimmed;
  return undefined;
}

function parseColorMapping(raw: string | null | undefined): ColorMapping {
  if (!raw || raw.trim().length === 0) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const mapping: ColorMapping = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof key !== "string") continue;
      if (typeof value !== "string") continue;
      const color = normalizeColor(value);
      if (color) mapping[key.toLowerCase()] = color;
    }
    return mapping;
  } catch {
    if (typeof console !== "undefined") {
      console.debug("[ChoiceColorTilesControl] Invalid colorMappingJson. Using fallback palette.");
    }
    return {};
  }
}

function readOptionColor(option: Record<string, unknown>): string | undefined {
  const candidates = ["Color", "color", "ColorHexValue", "colorHexValue", "hexColor"];
  for (const candidate of candidates) {
    const raw = option[candidate];
    if (typeof raw === "string") {
      const color = normalizeColor(raw);
      if (color) return color;
    }
  }
  return undefined;
}

function readOptionLabel(option: Record<string, unknown>): string | undefined {
  const label = option.Label ?? option.label;
  if (typeof label === "string" && label.trim().length > 0) return label;
  if (label && typeof label === "object") {
    const userLocalizedLabel = (label as { UserLocalizedLabel?: { Label?: unknown } }).UserLocalizedLabel;
    if (userLocalizedLabel && typeof userLocalizedLabel.Label === "string" && userLocalizedLabel.Label.trim().length > 0) {
      return userLocalizedLabel.Label;
    }
    const localLabel = (label as { LocalizedLabels?: { Label?: unknown }[] }).LocalizedLabels;
    if (Array.isArray(localLabel) && localLabel.length > 0) {
      const first = localLabel[0]?.Label;
      if (typeof first === "string" && first.trim().length > 0) return first;
    }
  }
  return undefined;
}

function readOptionValue(option: Record<string, unknown>): number | undefined {
  const rawValue = option.Value ?? option.value;
  if (typeof rawValue === "number") return rawValue;
  if (typeof rawValue === "string" && rawValue.trim().length > 0) {
    const parsed = Number(rawValue);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function extractChoiceOptions(choiceProperty: ComponentFramework.PropertyTypes.OptionSetProperty): ChoiceOption[] {
  try {
    const attributes = choiceProperty.attributes as unknown as Record<string, unknown> | undefined;
    const sources: unknown[] = [
      attributes?.Options,
      attributes?.options,
      (choiceProperty as unknown as Record<string, unknown>).options,
      (choiceProperty as unknown as Record<string, unknown>).Options,
    ];

    for (const source of sources) {
      if (!Array.isArray(source)) continue;
      const result: ChoiceOption[] = source
        .map((optionRaw) => {
          if (!optionRaw || typeof optionRaw !== "object") return undefined;
          const option = optionRaw as Record<string, unknown>;
          const value = readOptionValue(option);
          const label = readOptionLabel(option);
          if (value === undefined || !label) return undefined;
          return {
            value,
            label,
            color: readOptionColor(option),
          } as ChoiceOption;
        })
        .filter((item): item is ChoiceOption => item !== undefined);

      if (result.length > 0) return result;
    }
  } catch (error) {
    console.warn("[ChoiceColorTilesControl] Failed to parse choice option metadata.", error);
  }

  return [];
}

function colorToTint(hexColor: string): string {
  const normalized = hexColor.replace("#", "");
  const full = normalized.length === 3 ? normalized.split("").map((c) => c + c).join("") : normalized;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, 0.12)`;
}

function getFallbackColor(optionValue: number): string {
  const index = Math.abs(optionValue) % FALLBACK_COLORS.length;
  return FALLBACK_COLORS[index];
}

function resolveTileColorInfo(option: ChoiceOption, useChoiceColors: boolean, mapping: ColorMapping): ResolvedColorInfo {
  const labelKey = option.label.toLowerCase();
  const valueKey = String(option.value).toLowerCase();
  const metadataColor = useChoiceColors ? normalizeColor(option.color) : undefined;
  const mappingColor = mapping[labelKey] ?? mapping[valueKey];

  if (metadataColor) {
    return {
      metadataColor,
      mappingColor,
      finalColor: metadataColor,
      finalColorSource: "metadata",
    };
  }

  if (mappingColor) {
    return {
      metadataColor,
      mappingColor,
      finalColor: mappingColor,
      finalColorSource: "mapping",
    };
  }

  return {
    metadataColor,
    mappingColor,
    finalColor: getFallbackColor(option.value),
    finalColorSource: "fallback",
  };
}

function getRequiredLevel(choiceProperty: ComponentFramework.PropertyTypes.OptionSetProperty): string {
  const attributes = choiceProperty.attributes as unknown as Record<string, unknown> | undefined;
  const requiredLevel = attributes?.RequiredLevel ?? attributes?.requiredLevel;
  return typeof requiredLevel === "string" ? requiredLevel : "none";
}

function getIsEditable(choiceProperty: ComponentFramework.PropertyTypes.OptionSetProperty, isControlDisabled: boolean): boolean {
  if (isControlDisabled) return false;
  const security = (choiceProperty.security as unknown as { editable?: boolean } | undefined) ?? undefined;
  if (security && security.editable === false) return false;
  return true;
}

function getOptionsSource(choiceProperty: ComponentFramework.PropertyTypes.OptionSetProperty | undefined): unknown[] {
  if (!choiceProperty) return [];
  const attributes = choiceProperty.attributes as unknown as Record<string, unknown> | undefined;
  return [
    attributes?.Options,
    attributes?.options,
    (choiceProperty as unknown as Record<string, unknown>).options,
    (choiceProperty as unknown as Record<string, unknown>).Options,
  ];
}

function inferDesignerMode(context: ComponentFramework.Context<IInputs>): boolean {
  const mode = context.mode as unknown as Record<string, unknown> | undefined;
  if (!mode) return false;
  const authoringCandidates = ["isAuthoringMode", "isControlInError", "isDesignMode"];
  for (const key of authoringCandidates) {
    if (mode[key] === true) return true;
  }
  return false;
}

function resolveColorSourceSummary(values: ResolvedColorInfo[]): FinalColorSource | "mixed" | "none" {
  if (values.length === 0) return "none";
  const sources = new Set(values.map((value) => value.finalColorSource));
  if (sources.size === 1) {
    const first = values[0];
    return first?.finalColorSource ?? "none";
  }
  return "mixed";
}

export function ChoiceColorTilesView({ context, selectedValue, onSelectionChange }: ChoiceColorTilesViewProps): React.ReactElement {
  const choiceProperty = context.parameters?.selectedChoice;
  const options = React.useMemo(() => {
    if (!choiceProperty) return [];
    return extractChoiceOptions(choiceProperty);
  }, [choiceProperty]);
  const columnsPerRow = Math.max(1, Math.min(4, getNumberInput(context.parameters.columnsPerRow, 4)));
  const useChoiceColors = getBooleanInput(context.parameters.useChoiceColors, true);
  const showSelectedIcon = getBooleanInput(context.parameters.showSelectedIcon, true);
  const allowClear = getBooleanInput(context.parameters.allowClear, false);
  const compactMode = getBooleanInput(context.parameters.compactMode, false);
  const showOnlySelectedWhenReadOnly = getBooleanInput(context.parameters.showOnlySelectedWhenReadOnly, false);
  const colorMapping = React.useMemo(() => parseColorMapping(context.parameters.colorMappingJson.raw), [context.parameters.colorMappingJson.raw]);
  const debugEnabledRef = React.useRef(
    typeof window !== "undefined" && window.location.search.includes("choiceColorTilesDebug=1")
  );
  const isEditable = choiceProperty ? getIsEditable(choiceProperty, context.mode?.isControlDisabled === true) : false;
  const isRequired = choiceProperty ? getRequiredLevel(choiceProperty) !== "none" : false;
  const tileRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const optionSources = React.useMemo(() => getOptionsSource(choiceProperty), [choiceProperty]);
  const hasOptionsInMetadata = React.useMemo(() => optionSources.some((source) => Array.isArray(source)), [optionSources]);
  const hasAttributes = Boolean(
    choiceProperty && (choiceProperty.attributes as unknown as Record<string, unknown> | undefined)
  );
  const isDesignerLike = inferDesignerMode(context);
  const isDesignerFallback = (!choiceProperty || !hasAttributes || !hasOptionsInMetadata) && options.length === 0;

  const displayedOptions = React.useMemo(() => {
    if (isEditable || !showOnlySelectedWhenReadOnly || selectedValue === null) return options;
    return options.filter((option) => option.value === selectedValue);
  }, [isEditable, options, selectedValue, showOnlySelectedWhenReadOnly]);

  const resolvedColorsByValue = React.useMemo(() => {
    const map = new Map<number, ResolvedColorInfo>();
    for (const option of displayedOptions) {
      map.set(option.value, resolveTileColorInfo(option, useChoiceColors, colorMapping));
    }
    return map;
  }, [colorMapping, displayedOptions, useChoiceColors]);

  React.useEffect(() => {
    const shouldLog = debugEnabledRef.current || isDesignerLike || isDesignerFallback;
    if (!shouldLog) return;

    let fallbackWithoutMetadataOrMapping = false;
    const debugColorValues: ResolvedColorInfo[] = [];
    for (const option of displayedOptions) {
      const resolved = resolvedColorsByValue.get(option.value);
      if (!resolved) continue;
      debugColorValues.push(resolved);
      console.debug("[ChoiceColorTilesControl] option metadata", {
        optionLabel: option.label,
        optionValue: option.value,
        metadataColor: resolved.metadataColor ?? null,
        mappingColor: resolved.mappingColor ?? null,
        finalColorSource: resolved.finalColorSource,
        finalColor: resolved.finalColor,
      });

      if (resolved.finalColorSource === "fallback" && !resolved.metadataColor && !resolved.mappingColor) {
        fallbackWithoutMetadataOrMapping = true;
      }
    }

    if (fallbackWithoutMetadataOrMapping) {
      console.warn("[ChoiceColorTilesControl] Choice colors were not exposed by metadata; using fallback colors.");
    }

    const availability: ContextAvailability = {
      hasSelectedChoiceParameter: Boolean(choiceProperty),
      hasRawValue: choiceProperty ? choiceProperty.raw !== undefined && choiceProperty.raw !== null : false,
      hasAttributes,
      hasOptions: hasOptionsInMetadata,
      optionCount: displayedOptions.length,
      isDesignerFallback,
      colorSource: resolveColorSourceSummary(debugColorValues),
    };
    console.debug("[ChoiceColorTilesControl] context availability", availability);
  }, [choiceProperty, displayedOptions, hasAttributes, hasOptionsInMetadata, isDesignerFallback, isDesignerLike, resolvedColorsByValue]);

  const handleTileClick = React.useCallback(
    (value: number) => {
      if (!isEditable) return;
      onSelectionChange(value);
    },
    [isEditable, onSelectionChange]
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, optionValue: number, optionIndex: number) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        handleTileClick(optionValue);
        return;
      }

      const total = displayedOptions.length;
      if (total === 0) return;

      let nextIndex = optionIndex;
      if (event.key === "ArrowRight") nextIndex = (optionIndex + 1) % total;
      if (event.key === "ArrowLeft") nextIndex = (optionIndex - 1 + total) % total;
      if (event.key === "ArrowDown") nextIndex = Math.min(optionIndex + columnsPerRow, total - 1);
      if (event.key === "ArrowUp") nextIndex = Math.max(optionIndex - columnsPerRow, 0);

      if (nextIndex !== optionIndex) {
        event.preventDefault();
        tileRefs.current[nextIndex]?.focus();
      }
    },
    [columnsPerRow, displayedOptions.length, handleTileClick]
  );

  if (isDesignerFallback) {
    return <div style={styles.empty}>Choice preview unavailable in designer.</div>;
  }

  if (options.length === 0) {
    return <div style={styles.empty}>No options available.</div>;
  }

  return (
    <div style={styles.root}>
      <div
        style={{
          ...styles.group,
          gridTemplateColumns: `repeat(${columnsPerRow}, minmax(0, 1fr))`,
        }}
        role="radiogroup"
        aria-label={
          (choiceProperty?.attributes as unknown as { DisplayName?: string } | undefined)?.DisplayName ?? "Choice options"
        }
      >
        {displayedOptions.map((option, index) => {
          const isSelected = selectedValue === option.value;
          const colorInfo = resolvedColorsByValue.get(option.value) ?? resolveTileColorInfo(option, useChoiceColors, colorMapping);
          const tileColor = colorInfo.finalColor;
          const selectedBackground = colorToTint(tileColor);

          return (
            <button
              key={option.value}
              type="button"
              ref={(element) => {
                tileRefs.current[index] = element;
              }}
              style={{
                ...styles.tile,
                ...(compactMode ? styles.tileCompact : {}),
                borderColor: isSelected ? tileColor : "#d1d1d1",
                backgroundColor: isSelected ? selectedBackground : "#ffffff",
                ...(isSelected ? styles.tileSelected : {}),
                ...(!isEditable ? styles.tileDisabled : {}),
                ...(!isEditable && isSelected ? styles.tileReadOnlySelected : {}),
              }}
              role="radio"
              aria-checked={isSelected}
              aria-label={option.label}
              disabled={!isEditable}
              onClick={() => handleTileClick(option.value)}
              onKeyDown={(event) => handleKeyDown(event, option.value, index)}
            >
              <span style={styles.tileLabel}>{option.label}</span>
              {showSelectedIcon && isSelected ? <span style={styles.selectedHint}>✓ Selected</span> : null}
            </button>
          );
        })}
      </div>

      {allowClear && !isRequired && isEditable && selectedValue !== null ? (
        <button type="button" style={styles.clearButton} onClick={() => onSelectionChange(null)}>
          Clear selection
        </button>
      ) : null}
    </div>
  );
}
