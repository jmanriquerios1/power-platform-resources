import * as React from "react";
import * as ReactDOM from "react-dom";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { ChoiceJourneyView } from "./components/ChoiceJourneyView";
import { resolveJourneyOptions } from "./services/journeyService";

export class GenericChoiceJourneyControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container: HTMLDivElement | undefined;
    private notifyOutputChanged: (() => void) | undefined;
    private pendingValue: number | null | undefined;

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this.container = container;
        this.notifyOutputChanged = notifyOutputChanged;
        context.mode.trackContainerResize(true);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        if (!this.container) return;
        const rawValue = context.parameters.selectedChoice.raw;
        if (this.pendingValue !== undefined && this.pendingValue === rawValue) this.pendingValue = undefined;
        const selectedValue = this.pendingValue === undefined ? rawValue : this.pendingValue;
        const locale = context.parameters.locale.raw || (context.userSettings.languageId === 3082 ? "es-ES" : "en-US");

        ReactDOM.render(React.createElement(ChoiceJourneyView, {
            options: resolveJourneyOptions(context.parameters.selectedChoice.attributes?.Options, context.parameters.journeyConfigJson.raw),
            selectedValue,
            title: context.parameters.journeyTitle.raw || undefined,
            description: context.parameters.journeyDescription.raw || undefined,
            showSummary: context.parameters.showSummary.raw === true,
            canChange: context.parameters.allowChoiceChange.raw === true && !context.mode.isControlDisabled,
            canClear: context.parameters.allowChoiceChange.raw === true && context.parameters.allowClear.raw === true && !context.mode.isControlDisabled,
            locale,
            onSelectionChange: (value: number | null) => {
                if (context.mode.isControlDisabled) return;
                this.pendingValue = value;
                this.notifyOutputChanged?.();
            },
        }), this.container);
    }

    public getOutputs(): IOutputs {
        return this.pendingValue === undefined ? {} : { selectedChoice: this.pendingValue ?? undefined };
    }

    public destroy(): void {
        if (this.container) ReactDOM.unmountComponentAtNode(this.container);
        this.container = undefined;
        this.notifyOutputChanged = undefined;
    }
}
