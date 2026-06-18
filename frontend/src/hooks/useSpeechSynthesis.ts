import { useCallback, useEffect, useRef, useState } from "react";

const supported = typeof window !== "undefined" && "speechSynthesis" in window;

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  const maleHint = voices.find((voice) => /male/i.test(voice.name) && /en/i.test(voice.lang));
  if (maleHint) return maleHint;
  const englishVoice = voices.find((voice) => /en/i.test(voice.lang));
  return englishVoice ?? voices[0];
}

export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (!supported) return;

    function loadVoices() {
      voiceRef.current = pickVoice(window.speechSynthesis.getVoices());
    }

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const speak = useCallback((text: string) => {
    if (!supported || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) utterance.voice = voiceRef.current;
    utterance.rate = 1;
    utterance.pitch = 0.9;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { supported, speaking, speak, cancel };
}
