import * as React from "react";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { ChoiceJourneyView } from "./components/ChoiceJourneyView";

export class ChoiceJourneyControl implements ComponentFramework.ReactControl<IInputs, IOutputs> {
  private notifyOutputChanged: (() => void) | null = null;
  private pendingValue: number | null | undefined = undefined;

  public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void): void {
    this.notifyOutputChanged = notifyOutputChanged;
    context.mode.trackContainerResize(true);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
    const choiceProperty = context.parameters.selectedChoice;
    const rawValue = choiceProperty?.raw ?? null;
    if (this.pendingValue !== undefined && this.pendingValue === rawValue) {
      this.pendingValue = undefined;
    }
    const selectedValue = this.pendingValue !== undefined ? this.pendingValue : rawValue;

    return React.createElement(ChoiceJourneyView, {
      choiceProperty,
      selectedValue,
      editable: context.mode.isControlDisabled !== true,
      title: context.parameters.journeyTitle?.raw ?? undefined,
      description: context.parameters.journeyDescription?.raw ?? undefined,
      accentColor: context.parameters.accentColor?.raw ?? undefined,
      completedColor: context.parameters.completedColor?.raw ?? undefined,
      pendingColor: context.parameters.pendingColor?.raw ?? undefined,
      showStepNumbers: context.parameters.showStepNumbers?.raw === true,
      showJourneySummary: context.parameters.showJourneySummary?.raw === true,
      allowClear: context.parameters.allowClear?.raw === true,
      allocatedWidth: context.mode.allocatedWidth,
      onSelectionChange: (value: number | null) => {
        this.pendingValue = value;
        this.notifyOutputChanged?.();
      },
    });
  }

  public getOutputs(): IOutputs {
    return this.pendingValue === undefined ? {} : { selectedChoice: this.pendingValue ?? undefined };
  }

  public destroy(): void {
    this.notifyOutputChanged = null;
  }
}
