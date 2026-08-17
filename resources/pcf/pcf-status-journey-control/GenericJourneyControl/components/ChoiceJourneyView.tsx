import * as React from "react";
import { JourneyOption } from "../models/journey";
import { foregroundFor, getStepState } from "../services/journeyService";

interface ChoiceJourneyViewProps {
    options: JourneyOption[];
    selectedValue: number | null;
    title?: string;
    description?: string;
    showSummary: boolean;
    canChange: boolean;
    canClear: boolean;
    locale: string;
    onSelectionChange: (value: number | null) => void;
}

function stepStyle(color: string): React.CSSProperties & Record<string, string> {
    return { "--gcj-color": color, "--gcj-on-color": foregroundFor(color) };
}

export const ChoiceJourneyView = React.memo(function ChoiceJourneyView({ options, selectedValue, title, description, showSummary, canChange, canClear, locale, onSelectionChange }: ChoiceJourneyViewProps): React.ReactElement {
    const selected = options.find((option) => option.value === selectedValue);
    const canInteract = canChange && options.length > 0;
    const emptyText = locale.startsWith("es") ? "No hay opciones disponibles para esta columna." : "No options are available for this column.";
    const clearText = locale.startsWith("es") ? "Limpiar selección" : "Clear selection";

    return <section className="gcj" aria-label={title || "Choice journey"}>
        {title ? <h2 className="gcj__title">{title}</h2> : null}
        {description ? <p className="gcj__description">{description}</p> : null}
        {options.length === 0 ? <p className="gcj__empty" role="status">{emptyText}</p> : <ol className="gcj__track">
            {options.map((option, index) => {
                const state = getStepState(index, selectedValue, options);
                const content = <><span className="gcj__marker" aria-hidden="true">{state === "completed" ? <svg viewBox="0 0 16 16" focusable="false"><path d="m3 8.25 3.1 3.1L13 4.65" /></svg> : <span className="gcj__core" />}</span><span className="gcj__label">{option.label}</span></>;
                return <li key={option.value} className={`gcj__step gcj__step--${state}`} style={stepStyle(option.color)} aria-current={state === "active" ? "step" : undefined}>
                    {canInteract ? <button type="button" onClick={() => onSelectionChange(option.value)} aria-label={option.label}>{content}</button> : content}
                </li>;
            })}
        </ol>}
        {(showSummary || (canClear && selectedValue !== null)) ? <footer className="gcj__footer">
            {showSummary ? <span role="status">{selected ? selected.label : locale.startsWith("es") ? "Sin selección" : "No selection"}</span> : null}
            {canClear && selectedValue !== null ? <button type="button" className="gcj__clear" onClick={() => onSelectionChange(null)}>{clearText}</button> : null}
        </footer> : null}
    </section>;
});
