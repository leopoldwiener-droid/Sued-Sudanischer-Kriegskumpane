// ─────────────────────────────────────────────────────────────────────────────
// Shared Grok Voice TTS player — one active message at a time.
// useSyncExternalStore so every message + the now-playing bar stay in sync.
// Abort + generation counters so superseded fetches never start the wrong audio.
// Audio is LRU-cached in memory + IndexedDB (voice + ZDR + text) across reloads.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useCallback, useSyncExternalStore } from "react";
import { apiFetch } from "@/lib/api-fetch";
import { getTtsAudio, putTtsAudio } from "@/lib/tts-cache";
import { markdownToSpeechText } from "@/lib/tts";
import type { GrokTtsVoice } from "@/lib/types";

export type TtsStatus = "idle" | "loading" | "playing" | "paused";

export type TtsSnapshot = {
  messageId: string | null;
  status: TtsStatus;
  rate: number;
  voice: GrokTtsVoice | null;
  error: string | null;
};

export const TTS_RATES = [0.75, 1, 1.25, 1.5, 2] as const;

const IDLE: TtsSnapshot = {
  messageId: null,
  status: "idle",
  rate: 1,
  voice: null,
  error: null,
};

let snapshot: TtsSnapshot = IDLE;
const listeners = new Set<() => void>();

let generation = 0;
let abortController: AbortController | null = null;
let audio: HTMLAudioElement | null = null;
let blobUrl: string | null = null;
let cached: { text: string; apiKey: string; zdrOnly: boolean } | null = null;

function emit(next: TtsSnapshot) {
  snapshot = next;
  for (const listener of listeners) listener();
}

// ── Browser-Stimme (speechSynthesis) — Standard, wenn kein OpenRouter-Key da ist.
//    Kostenlos, kein Server. Für eine eigene Stimme: hier austauschen.
let browserUtterance: SpeechSynthesisUtterance | null = null;

function pickGermanVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  // Jonas spricht → männliche deutsche Stimme bevorzugen, wenn das Gerät eine hat.
  return (
    voices.find((v) => v.lang.startsWith("de") && /stefan|conrad|killian|florian|male|mann/i.test(v.name)) ??
    voices.find((v) => v.lang === "de-DE" && /google|natural|online/i.test(v.name)) ??
    voices.find((v) => v.lang.startsWith("de")) ??
    null
  );
}

function speakInBrowser(messageId: string, text: string, gen: number) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    failTts("Dieser Browser kann nicht vorlesen.");
    return;
  }
  cleanupAudio();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  utterance.rate = snapshot.rate;
  const voice = pickGermanVoice();
  if (voice) utterance.voice = voice;
  utterance.onend = () => {
    if (gen === generation) stopTts();
  };
  utterance.onerror = (e) => {
    if (gen === generation && e.error !== "interrupted" && e.error !== "canceled") {
      failTts("Vorlesen hat nicht geklappt.");
    }
  };
  browserUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  emit({ messageId, status: "playing", rate: snapshot.rate, voice: null, error: null });
}

function cleanupAudio() {
  if (browserUtterance) {
    browserUtterance.onend = null;
    browserUtterance.onerror = null;
    browserUtterance = null;
    window.speechSynthesis?.cancel();
  }
  if (audio) {
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    audio = null;
  }
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
    blobUrl = null;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return IDLE;
}

function statusForMessage(messageId: string): TtsStatus {
  return snapshot.messageId === messageId ? snapshot.status : "idle";
}

export function useTtsPlayback() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Narrow subscription — only re-renders when *this* message's playback status changes. */
export function useMessageTtsStatus(messageId: string): TtsStatus {
  return useSyncExternalStore(
    subscribe,
    () => statusForMessage(messageId),
    () => "idle",
  );
}

export function clearTtsError() {
  if (!snapshot.error) return;
  emit({ ...snapshot, error: null });
}

export function stopTts() {
  generation += 1;
  abortController?.abort();
  abortController = null;
  cleanupAudio();
  cached = null;
  emit({ ...IDLE, rate: snapshot.rate, error: null });
}

function failTts(message: string) {
  generation += 1;
  abortController?.abort();
  abortController = null;
  cleanupAudio();
  cached = null;
  emit({ ...IDLE, rate: snapshot.rate, error: message });
}

async function playBlob(
  messageId: string,
  voice: GrokTtsVoice,
  blob: Blob,
  gen: number,
) {
  const url = URL.createObjectURL(blob);
  const next = new Audio(url);
  next.playbackRate = snapshot.rate;
  blobUrl = url;
  audio = next;

  next.onended = () => {
    if (gen === generation) stopTts();
  };
  next.onerror = () => {
    if (gen === generation) failTts("Could not play audio.");
  };

  await next.play();
  if (gen !== generation) {
    next.pause();
    return;
  }

  emit({ messageId, status: "playing", rate: snapshot.rate, voice, error: null });
}

async function synthesizeAndPlay(
  messageId: string,
  text: string,
  voice: GrokTtsVoice,
  apiKey: string,
  zdrOnly: boolean,
  gen: number,
) {
  abortController?.abort();
  const controller = new AbortController();
  abortController = controller;
  cleanupAudio();

  cached = { text, apiKey, zdrOnly };
  emit({ messageId, status: "loading", rate: snapshot.rate, voice, error: null });

  try {
    const hit = await getTtsAudio(voice, text, zdrOnly);
    if (gen !== generation) return;

    if (hit) {
      await playBlob(messageId, voice, hit, gen);
      return;
    }

    const res = await apiFetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        text,
        voice,
        apiKey: apiKey.trim() || undefined,
        ...(zdrOnly ? { zdrOnly: true } : {}),
      }),
    });

    if (gen !== generation) return;

    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).trim();
      throw new Error(detail || `TTS failed (${res.status})`);
    }

    const blob = await res.blob();
    if (gen !== generation) return;

    await putTtsAudio(voice, text, blob, zdrOnly);
    if (gen !== generation) return;

    await playBlob(messageId, voice, blob, gen);
  } catch (err) {
    if (gen !== generation) return;
    if (err instanceof DOMException && err.name === "AbortError") return;
    const message =
      err instanceof Error && err.message
        ? err.message
        : "Read aloud failed. Check your OpenRouter API key.";
    failTts(message);
  }
}

export async function playMessageTts(
  messageId: string,
  markdown: string,
  voice: GrokTtsVoice,
  apiKey: string,
  zdrOnly = false,
) {
  const text = markdownToSpeechText(markdown);
  if (!text) return;

  const gen = ++generation;
  if (!apiKey.trim()) {
    speakInBrowser(messageId, text, gen);
    return;
  }
  await synthesizeAndPlay(messageId, text, voice, apiKey, zdrOnly, gen);
}

export function pauseTts() {
  if (browserUtterance && snapshot.status === "playing") {
    window.speechSynthesis.pause();
    emit({ ...snapshot, status: "paused" });
    return;
  }
  if (!audio || snapshot.status !== "playing") return;
  audio.pause();
  emit({ ...snapshot, status: "paused" });
}

export function resumeTts() {
  if (browserUtterance && snapshot.status === "paused") {
    window.speechSynthesis.resume();
    emit({ ...snapshot, status: "playing" });
    return;
  }
  if (!audio || snapshot.status !== "paused") return;
  void audio.play().then(
    () => {
      if (snapshot.status === "paused" && audio) {
        emit({ ...snapshot, status: "playing", error: null });
      }
    },
    () => {
      if (snapshot.messageId) failTts("Could not resume audio.");
    },
  );
}

export function togglePauseTts() {
  if (snapshot.status === "playing") pauseTts();
  else if (snapshot.status === "paused") resumeTts();
}

export function setTtsRate(rate: number) {
  const next = TTS_RATES.includes(rate as (typeof TTS_RATES)[number]) ? rate : 1;
  if (audio) audio.playbackRate = next;
  emit({ ...snapshot, rate: next });
}

export function cycleTtsRate() {
  const idx = TTS_RATES.indexOf(snapshot.rate as (typeof TTS_RATES)[number]);
  const next = TTS_RATES[(idx + 1) % TTS_RATES.length] ?? 1;
  setTtsRate(next);
}

export async function changeTtsVoice(voice: GrokTtsVoice) {
  if (!snapshot.messageId || !cached || browserUtterance) {
    emit({ ...snapshot, voice });
    return;
  }
  if (snapshot.voice === voice && snapshot.status !== "idle") return;

  const { messageId } = snapshot;
  const { text, apiKey, zdrOnly } = cached;
  const gen = ++generation;
  await synthesizeAndPlay(messageId, text, voice, apiKey, zdrOnly, gen);
}

export function useMessageTts(messageId: string) {
  const status = useMessageTtsStatus(messageId);
  const isActive = status !== "idle";

  const toggle = useCallback(
    async (markdown: string, voice: GrokTtsVoice, apiKey: string, zdrOnly = false) => {
      if (isActive) {
        stopTts();
        return;
      }
      await playMessageTts(messageId, markdown, voice, apiKey, zdrOnly);
    },
    [isActive, messageId],
  );

  return { status, isActive, toggle };
}
