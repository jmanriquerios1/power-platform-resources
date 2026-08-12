export interface ChoiceJourneyOption {
  value: number;
  label: string;
  color?: string;
}

export interface JourneyPalette {
  accent: string;
  completed: string;
  pending: string;
}
