import { getStepState, resolveJourneyOptions } from "../services/journeyService";

describe("journeyService", () => {
    const metadata = [
        { Value: 100, Label: "First", Color: "#111111" },
        { Value: 10, Label: "Second", Color: "#222222" },
        { Value: 50, Label: "Third", Color: "#333333" },
    ] as ComponentFramework.PropertyHelper.OptionMetadata[];

    it("uses explicit order instead of option numeric values", () => {
        const options = resolveJourneyOptions(metadata, '{"order":[10,50,100]}');
        expect(options.map((option) => option.value)).toEqual([10, 50, 100]);
        expect(getStepState(0, 50, options)).toBe("completed");
        expect(getStepState(1, 50, options)).toBe("active");
    });

    it("hides configured options and preserves metadata colours", () => {
        const options = resolveJourneyOptions(metadata, '{"hiddenOptionValues":[10]}');
        expect(options).toHaveLength(2);
        expect(options[0].color).toBe("#111111");
    });
});
