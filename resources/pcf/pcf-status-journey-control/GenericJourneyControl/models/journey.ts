export type StepState = "completed" | "active" | "pending";

export interface JourneyOption {
    value: number;
    label: string;
    color: string;
}

export interface JourneyConfig {
    order?: number[];
    labels?: Record<string, string>;
    colors?: Record<string, string>;
    hiddenOptionValues?: number[];
}
