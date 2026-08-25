import { describe, expect, it } from "vitest";
import { extractTimedWords, responseFormatForModel } from "../stt/contract";

describe("cloud STT timestamp contract", () => {
  it("requests real word timestamps from OpenRouter Whisper", () => {
    expect(responseFormatForModel("openai/whisper-1")).toBe("verbose_json");
    expect(responseFormatForModel("openai/gpt-transcribe")).toBe("json");
  });

  it("reads OpenRouter's top-level word timestamps", () => {
    expect(extractTimedWords({
      text: "Hej med dig",
      words: [{ word: "Hej", start: 0, end: 0.3 }, { word: "dig", start: 0.8, end: 1.2 }],
    })).toEqual([
      { word: "Hej", start: 0, end: 0.3 },
      { word: "dig", start: 0.8, end: 1.2 },
    ]);
  });

  it("keeps compatibility with segment-nested timestamps", () => {
    expect(extractTimedWords({ segments: [{ words: [{ word: "Hej", start: 0.1, end: 0.4 }] }] }))
      .toEqual([{ word: "Hej", start: 0.1, end: 0.4 }]);
  });
});
