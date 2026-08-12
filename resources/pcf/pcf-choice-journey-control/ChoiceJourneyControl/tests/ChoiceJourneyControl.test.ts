import { normalizeHexColor } from "../utils/color";

describe("normalizeHexColor", () => {
  test("returns fallback for invalid values", () => {
    expect(normalizeHexColor("blue", "#000000")).toBe("#000000");
  });
});
