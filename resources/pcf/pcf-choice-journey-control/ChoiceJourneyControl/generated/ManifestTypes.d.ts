/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    selectedChoice: ComponentFramework.PropertyTypes.OptionSetProperty;
    journeyTitle: ComponentFramework.PropertyTypes.StringProperty;
    journeyDescription: ComponentFramework.PropertyTypes.StringProperty;
    accentColor: ComponentFramework.PropertyTypes.StringProperty;
    completedColor: ComponentFramework.PropertyTypes.StringProperty;
    pendingColor: ComponentFramework.PropertyTypes.StringProperty;
    showStepNumbers: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    showJourneySummary: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    allowClear: ComponentFramework.PropertyTypes.TwoOptionsProperty;
}
export interface IOutputs {
    selectedChoice?: number;
}
