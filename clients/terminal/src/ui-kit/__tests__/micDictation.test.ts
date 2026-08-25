import { describe, expect, it } from "vitest";
import { joinSttWords } from "../micDictation";

describe("mic dictation word rendering", () => {
  it("spaces OpenRouter's bare word tokens", () => {
    expect(joinSttWords([
      { word: "Hej", start: 0, end: 0.2 },
      { word: "med", start: 0.3, end: 0.5 },
      { word: "dig.", start: 0.6, end: 0.9 },
    ])).toBe("Hej med dig.");
  });

  it("normalizes Whisper tokens that already contain leading spaces", () => {
    expect(joinSttWords([
      { word: " Hej", start: 0, end: 0.2 },
      { word: " ,", start: 0.2, end: 0.3 },
      { word: " verden", start: 0.4, end: 0.8 },
    ])).toBe("Hej, verden");
  });
});
