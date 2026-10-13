"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  useSpeechInput — Spracheingabe über die Web Speech API des Browsers.
//
//  Läuft in Chrome, Edge und Safari ohne Server oder Key (Firefox: nicht
//  unterstützt → `supported` ist false und der Mikrofon-Knopf wird versteckt).
//  Während man spricht, kommt der Zwischentext über onInterim; wenn man
//  aufhört zu sprechen, kommt der fertige Satz über onFinal.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";

type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type RecognitionEvent = { resultIndex: number; results: ArrayLike<RecognitionResult> };
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type RecognitionCtor = new () => Recognition;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const ERROR_TEXT: Record<string, string> = {
  "not-allowed": "Mikrofon-Zugriff wurde nicht erlaubt.",
  "service-not-allowed": "Spracherkennung ist in diesem Browser blockiert.",
  "no-speech": "Ich habe nichts gehört. Versuch es nochmal.",
  "audio-capture": "Kein Mikrofon gefunden.",
  network: "Spracherkennung braucht eine Internetverbindung.",
};

export function useSpeechInput({
  onInterim,
  onFinal,
  lang = "de-DE",
}: {
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  lang?: string;
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<Recognition | null>(null);
  const finalTextRef = useRef("");
  const onInterimRef = useRef(onInterim);
  const onFinalRef = useRef(onFinal);

  useEffect(() => { onInterimRef.current = onInterim; }, [onInterim]);
  useEffect(() => { onFinalRef.current = onFinal; }, [onFinal]);
  useEffect(() => { setSupported(getRecognitionCtor() !== null); }, []);
  useEffect(() => () => recognitionRef.current?.abort(), []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || recognitionRef.current) return;

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;
    finalTextRef.current = "";
    setError(null);

    recognition.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) finalTextRef.current += result[0].transcript;
        else interim += result[0].transcript;
      }
      onInterimRef.current((finalTextRef.current + interim).trim());
    };
    recognition.onerror = (e) => {
      if (e.error !== "aborted") setError(ERROR_TEXT[e.error] ?? `Spracherkennung: ${e.error}`);
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
      const text = finalTextRef.current.trim();
      if (text) onFinalRef.current(text);
    };

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }, [lang]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { supported, listening, error, start, stop, clearError: () => setError(null) };
}
