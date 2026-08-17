import { JourneyConfig, JourneyOption, StepState } from "../models/journey";

const defaultColor = "#2563eb";

function isHexColor(value: unknown): value is string {
    return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

function parseConfig(raw: string | null | undefined): JourneyConfig {
    if (!raw?.trim()) return {};
    try {
        const candidate = JSON.parse(raw) as JourneyConfig;
        return {
            order: Array.isArray(candidate.order) ? candidate.order.filter(Number.isFinite) : undefined,
            labels: candidate.labels && typeof candidate.labels === "object" ? candidate.labels : undefined,
            colors: candidate.colors && typeof candidate.colors === "object" ? candidate.colors : undefined,
            hiddenOptionValues: Array.isArray(candidate.hiddenOptionValues) ? candidate.hiddenOptionValues.filter(Number.isFinite) : undefined,
        };
    } catch {
        return {};
    }
}

export function resolveJourneyOptions(metadata: readonly ComponentFramework.PropertyHelper.OptionMetadata[] | undefined, configRaw: string | null | undefined): JourneyOption[] {
    if (!metadata?.length) return [];
    const config = parseConfig(configRaw);
    const hidden = new Set(config.hiddenOptionValues ?? []);
    const options = metadata.filter((option) => !hidden.has(option.Value)).map((option) => ({
        value: option.Value,
        label: config.labels?.[option.Value] || option.Label,
        color: isHexColor(config.colors?.[option.Value]) ? config.colors![option.Value] : isHexColor(option.Color) ? option.Color : defaultColor,
    }));
    if (!config.order?.length) return options;
    const positions = new Map(config.order.map((value, index) => [value, index]));
    return [...options].sort((left, right) => (positions.get(left.value) ?? Number.MAX_SAFE_INTEGER) - (positions.get(right.value) ?? Number.MAX_SAFE_INTEGER));
}

export function getStepState(index: number, selectedValue: number | null, options: readonly JourneyOption[]): StepState {
    if (selectedValue === null) return "pending";
    const selectedIndex = options.findIndex((option) => option.value === selectedValue);
    if (index === selectedIndex) return "active";
    return selectedIndex > index ? "completed" : "pending";
}

export function foregroundFor(background: string): string {
    const channels = background.match(/[\da-f]{2}/gi);
    if (!channels || channels.length !== 3) return "#ffffff";
    const [red, green, blue] = channels.map((channel) => parseInt(channel, 16));
    return red * 0.299 + green * 0.587 + blue * 0.114 > 154 ? "#1f1f1f" : "#ffffff";
}
