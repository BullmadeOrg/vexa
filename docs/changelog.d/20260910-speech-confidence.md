- **Mixed transcription: judge acoustic confidence per segment.** Complete
  phrases use the shared Whisper admission rule while short uncertain fragments
  retain the stricter mixed-lane guard. A Danish replay regression preserves a
  recognized sentence which was previously rejected after the STT client; a weak
  neighboring segment no longer discards an entire response. No model or vocabulary
  default changes are included. Real multi-participant meeting validation remains
  separate from the replay and offline test evidence.
