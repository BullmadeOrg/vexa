- **Danish by default for Bullmade meetings.** Bot requests without a language now carry `da`
  into the transcription pipeline. Explicit language choices are preserved; API callers can
  send an empty string for automatic detection. OpenRouter Whisper requests both word and
  segment metadata so its existing low-confidence filter can act on acoustic scores while
  preserving genuine word timestamps. The selected model remains Whisper.
