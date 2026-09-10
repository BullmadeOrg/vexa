/** The mixed lane uses the shared acoustic rule, independently per segment. */
import assert from 'node:assert/strict';
import { ChunkedTranscriber, type BoundarySource } from './index.js';
import type { BoundaryEvent } from './pyannote-segmenter.js';
import type { TranscriptionResult, TranscriptionSegment } from '@vexa/transcribe-whisper';

const speech: TranscriptionSegment = {
  text: 'Jeg tester og tester, lad os se om det virker.', start: 0, end: 4.92,
  avg_logprob: -0.7885017991065979, no_speech_prob: 0.8112456202507019,
  compression_ratio: 0.978723406791687,
  words: [{ word: 'Jeg', start: 0, end: 0.8, probability: 0.8 }, { word: 'virker.', start: 4.6, end: 4.92, probability: 0.8 }],
};
const junk: TranscriptionSegment = {
  text: 'Unreliable noise', start: 0, end: 0.5,
  no_speech_prob: 0.9, avg_logprob: -1.1, compression_ratio: 1,
};

async function run(segments: TranscriptionSegment[], amplitude = 0.1) {
  let emit!: (event: BoundaryEvent) => void;
  let calls = 0;
  const published: Array<{text: string; startMs: number; endMs: number; segmentId: string}> = [];
  const tc = await ChunkedTranscriber.create({
    language: 'da',
    clock: { now: () => 0, setHeartbeat: () => () => {} },
    transcribe: async (): Promise<TranscriptionResult> => {
      calls++;
      return { text: segments.map(s => s.text).join(' '), segments, language: 'da', language_probability: 0, duration: 5 };
    },
    publish: (_name, confirmed) => published.push(...confirmed),
    publishPending: () => {}, clearPending: () => {}, rename: () => {},
    makeSegmenter: async (callback): Promise<BoundarySource> => {
      emit = callback;
      return { appendFrame: async () => {}, reset() {} };
    },
    log: () => {},
  });
  emit({ kind: 'silence→speaker', tMs: 0, confidence: 0.9 });
  tc.feedAudio(new Float32Array(5 * 16000).fill(amplitude), 0);
  emit({ kind: 'speaker→silence', tMs: 5000, confidence: 0.9 });
  await tc.dispose();
  return { published, calls };
}

const actual = await run([speech]);
assert.ok(actual.calls > 0, 'positive fixture exercises the transcription call');
assert.deepEqual(actual.published.map(s => s.text), [speech.text], 'recognized speech survives the mixed lane');
assert.equal(actual.published[0].startMs, 0);
assert.equal(actual.published[0].endMs, 4920, 'provider timestamp retained');
assert.equal(new Set(actual.published.map(s => s.segmentId)).size, actual.published.length);

assert.deepEqual((await run([junk])).published, [], 'high no-speech AND low confidence is rejected');
assert.deepEqual((await run([{ ...speech, end: 1, words: undefined }])).published, [], 'short uncertain fragments keep the stricter mixed guard');
assert.deepEqual((await run([{ ...speech, compression_ratio: 2.5 }])).published, [], 'repetition confidence guard remains');
assert.deepEqual((await run([{ ...speech, no_speech_prob: 0.1, avg_logprob: -1.4 }])).published, [], 'very low confidence remains rejected');
const quiet = await run([speech], 0);
assert.equal(quiet.calls, 0, 'digital silence never reaches the model');
assert.deepEqual(quiet.published, []);

const goodLater = { ...speech, start: 0.6, words: undefined };
assert.deepEqual((await run([junk, goodLater])).published.map(s => s.text), [speech.text], 'a rejected first segment cannot delete later speech');
assert.deepEqual((await run([speech, { ...junk, start: 4.92, end: 5 }])).published.map(s => s.text), [speech.text], 'a clean first segment cannot admit later junk');
console.log('PASS speech-confidence: real Danish speech, timestamps, silence and per-segment negative controls');
