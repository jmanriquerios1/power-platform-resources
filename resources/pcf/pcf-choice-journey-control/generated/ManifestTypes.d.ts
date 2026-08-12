/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    selectedChoice: ComponentFramework.PropertyTypes.OptionSetProperty;
    columnsPerRow: ComponentFramework.PropertyTypes.WholeNumberProperty;
    useChoiceColors: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    colorMappingJson: ComponentFramework.PropertyTypes.StringProperty;
    showSelectedIcon: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    allowClear: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    compactMode: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    showOnlySelectedWhenReadOnly: ComponentFramework.PropertyTypes.TwoOptionsProperty;
}
export interface IOutputs {
    selectedChoice?: number;
}
