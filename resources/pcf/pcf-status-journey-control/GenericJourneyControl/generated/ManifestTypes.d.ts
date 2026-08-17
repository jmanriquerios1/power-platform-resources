/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    selectedChoice: ComponentFramework.PropertyTypes.OptionSetProperty;
    journeyTitle: ComponentFramework.PropertyTypes.StringProperty;
    journeyDescription: ComponentFramework.PropertyTypes.StringProperty;
    journeyConfigJson: ComponentFramework.PropertyTypes.StringProperty;
    allowChoiceChange: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    allowClear: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    showSummary: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    locale: ComponentFramework.PropertyTypes.StringProperty;
}
export interface IOutputs {
    selectedChoice?: number;
}
