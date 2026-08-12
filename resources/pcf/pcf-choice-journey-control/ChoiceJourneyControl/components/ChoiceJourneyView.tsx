import * as React from "react";
import { ChoiceJourneyOption } from "../models/ChoiceJourneyModels";
import { JourneyStep } from "./JourneyStep";
import { useJourneyOptions } from "../hooks/useJourneyOptions";

interface JourneyOptionProperty extends ComponentFramework.PropertyTypes.OptionSetProperty {
  options?: unknown;
  Options?: unknown;
  attributes?: ComponentFramework.PropertyTypes.OptionSetProperty["attributes"] & {
    Options?: unknown;
    options?: unknown;
  };
}

export interface ChoiceJourneyViewProps {
  choiceProperty: JourneyOptionProperty | undefined;
  selectedValue: number | null;
  editable: boolean;
  title?: string;
  description?: string;
  accentColor?: string;
  completedColor?: string;
  pendingColor?: string;
  showStepNumbers: boolean;
  showJourneySummary: boolean;
  allowClear: boolean;
  allocatedWidth?: number;
  onSelectionChange: (value: number | null) => void;
}

export function ChoiceJourneyView(props: ChoiceJourneyViewProps): React.ReactElement {
  const options: ChoiceJourneyOption[] = useJourneyOptions(props.choiceProperty);
  const selectedOption = options.find((option) => option.value === props.selectedValue);
  return (
    <div className="choice-journey-root">
      {props.title ? <div className="choice-journey-title">{props.title}</div> : null}
      {props.description ? <div className="choice-journey-description">{props.description}</div> : null}
      {options.length === 0 ? (
        <div className="choice-journey-empty">No option metadata is available for this field.</div>
      ) : null}
      <div className="choice-journey-track">
        {options.map((option, index) => (
          <JourneyStep
            key={option.value}
            option={option}
            index={index}
            selectedValue={props.selectedValue}
            editable={props.editable}
            showStepNumbers={props.showStepNumbers}
            accentColor={props.accentColor}
            completedColor={props.completedColor}
            pendingColor={props.pendingColor}
            onSelect={(value) => props.onSelectionChange(value)}
          />
        ))}
      </div>
      {props.allowClear && props.editable && props.selectedValue !== null ? <button className="choice-journey-clear" onClick={() => props.onSelectionChange(null)}>Clear</button> : null}
      {props.showJourneySummary ? (
        <div className="choice-journey-summary">
          {props.selectedValue === null ? "No step selected" : `Selected: ${selectedOption?.label ?? props.selectedValue}`}
        </div>
      ) : null}
    </div>
  );
}
