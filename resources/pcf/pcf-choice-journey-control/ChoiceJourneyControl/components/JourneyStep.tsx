import * as React from "react";
import { ChoiceJourneyOption } from "../models/ChoiceJourneyModels";
import { getStepState, getStepStyle, resolveJourneyPalette } from "../services/journeyService";

export interface JourneyStepProps {
  option: ChoiceJourneyOption;
  index: number;
  selectedValue: number | null;
  editable: boolean;
  showStepNumbers: boolean;
  onSelect: (value: number) => void;
  accentColor?: string;
  completedColor?: string;
  pendingColor?: string;
}

export const JourneyStep = React.memo(function JourneyStep(props: JourneyStepProps) {
  const palette = resolveJourneyPalette(props.accentColor, props.completedColor, props.pendingColor);
  const state = getStepState(props.index, props.selectedValue, props.option);
  const style = getStepStyle(state, palette);
  return (
    <button className={`choice-journey-step choice-journey-step--${state}`} style={style} disabled={!props.editable} onClick={() => props.onSelect(props.option.value)}>
      {props.showStepNumbers ? <span className="choice-journey-step__number">{props.index + 1}</span> : null}
      <span className="choice-journey-step__label">{props.option.label}</span>
    </button>
  );
});
