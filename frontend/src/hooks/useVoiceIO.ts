import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/client";

export type AssistantState = "idle" | "listening" | "thinking" | "speaking";
export type MicState = "idle" | "listening" | "denied" | "unsupported";
export type SpeakState = "idle" | "speaking";

function getRecognitionCtor(): (new () => SpeechRecognition) | undefined {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

/** Voice I/O primitives: browser speech-to-text in, ElevenLabs text-to-speech out. */
export function useVoiceIO() {
  const supported = typeof window !== "undefined" && !!getRecognitionCtor();
  const [micState, setMicState] = useState<MicState>(supported ? "idle" : "unsupported");
  const [speakState, setSpeakState] = useState<SpeakState>("idle");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    return () => {
      audio.pause();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  const listen = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const Ctor = getRecognitionCtor();
      if (!Ctor) {
        setMicState("unsupported");
        reject(new Error("Speech recognition isn't supported in this browser."));
        return;
      }

      const recognition = new Ctor();
      recognitionRef.current = recognition;
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setMicState("listening");

      recognition.onresult = (event) => {
        const text = event.results[0]?.[0]?.transcript ?? "";
        resolve(text.trim());
      };

      recognition.onerror = (event) => {
        setMicState(event.error === "not-allowed" ? "denied" : "idle");
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.onend = () => {
        setMicState((current) => (current === "listening" ? "idle" : current));
      };

      recognition.start();
    });
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const speak = useCallback(async (text: string): Promise<void> => {
    const audio = audioRef.current;
    if (!audio) return;
    setSpeakState("speaking");
    try {
      const blob = await api.speak(text);
      const url = URL.createObjectURL(blob);
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = url;
      audio.src = url;
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error("Audio playback failed."));
        audio.play().catch(reject);
      });
    } finally {
      setSpeakState("idle");
    }
  }, []);

  const cancelSpeak = useCallback(() => {
    audioRef.current?.pause();
    setSpeakState("idle");
  }, []);

  return { supported, micState, speakState, listen, stopListening, speak, cancelSpeak };
}
