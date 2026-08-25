export interface UpstreamWord { word?: string; start?: number; end?: number }
export interface UpstreamSegment { text?: string; words?: UpstreamWord[] }
export interface UpstreamTranscription {
  text?: string;
  words?: UpstreamWord[];
  segments?: UpstreamSegment[];
}

export function responseFormatForModel(model: string): "json" | "verbose_json" {
  return model === "openai/whisper-1" || !model.includes("/") ? "verbose_json" : "json";
}

export function extractTimedWords(data: UpstreamTranscription): Array<{ word: string; start: number; end: number }> {
  const upstream = data.words?.length ? data.words : (data.segments ?? []).flatMap((segment) => segment.words ?? []);
  return upstream
    .filter((word): word is UpstreamWord & { word: string } => typeof word.word === "string")
    .map((word) => ({ word: word.word, start: word.start ?? 0, end: word.end ?? 0 }));
}
