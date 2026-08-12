import * as React from "react";
import { ChoiceJourneyOption, JourneyPalette } from "../models/ChoiceJourneyModels";
import { normalizeHexColor, tintColor } from "../utils/color";

export function resolveJourneyPalette(accentColor?: string, completedColor?: string, pendingColor?: string): JourneyPalette {
  return {
    accent: normalizeHexColor(accentColor, "#2563EB"),
    completed: normalizeHexColor(completedColor, "#16A34A"),
    pending: normalizeHexColor(pendingColor, "#CBD5E1"),
  };
}

export function getStepState(index: number, selectedValue: number | null, option: ChoiceJourneyOption): "completed" | "active" | "pending" {
  if (selectedValue === option.value) return "active";
  if (selectedValue === null) return index === 0 ? "active" : "pending";
  return option.value < selectedValue ? "completed" : "pending";
}

export function getStepStyle(state: "completed" | "active" | "pending", palette: JourneyPalette): React.CSSProperties {
  const color = state === "completed" ? palette.completed : state === "active" ? palette.accent : palette.pending;
  return {
    borderColor: color,
    backgroundColor: tintColor(color, state === "pending" ? 0.08 : 0.16),
    color,
  };
}
