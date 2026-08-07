import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { ChoiceColorTilesView, type ChoiceColorTilesViewProps } from "./ChoiceColorTilesView";

export class ChoiceColorTilesControl implements ComponentFramework.ReactControl<IInputs, IOutputs> {
  private notifyOutputChanged: (() => void) | null = null;
  private pendingValue: number | null | undefined = undefined;

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    _state: ComponentFramework.Dictionary
  ): void {
    this.notifyOutputChanged = notifyOutputChanged;
    context.mode.trackContainerResize(true);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
    const selectedChoiceParameter = context.parameters?.selectedChoice;
    const rawValue = selectedChoiceParameter?.raw ?? null;
    if (this.pendingValue !== undefined && this.pendingValue === rawValue) {
      this.pendingValue = undefined;
    }

    const selectedValue = this.pendingValue !== undefined ? this.pendingValue : rawValue;
    const props: ChoiceColorTilesViewProps = {
      context,
      selectedValue,
      onSelectionChange: (value) => {
        this.pendingValue = value;
        this.notifyOutputChanged?.();
      },
    };

    return React.createElement(ChoiceColorTilesView, props);
  }

  public getOutputs(): IOutputs {
    if (this.pendingValue === undefined) {
      return {};
    }

    return {
      selectedChoice: this.pendingValue ?? undefined,
    };
  }

  public destroy(): void {
    this.notifyOutputChanged = null;
  }
}
