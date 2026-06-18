import { useCallback, useEffect, useRef, useState } from "react";

function getRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

interface UseSpeechRecognitionOptions {
  onResult: (transcript: string) => void;
}

export function useSpeechRecognition({ onResult }: UseSpeechRecognitionOptions) {
  const [supported] = useState(() => getRecognitionConstructor() !== null);
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const start = useCallback(() => {
    const Recognition = getRecognitionConstructor();
    if (!Recognition || recognitionRef.current) return;

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setListening(true);
      setError(null);
      setInterimTranscript("");
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      if (interimText) setInterimTranscript(interimText);
      if (finalText.trim()) onResultRef.current(finalText.trim());
    };

    recognition.onerror = (event) => {
      setError(event.error);
    };

    recognition.onend = () => {
      setListening(false);
      setInterimTranscript("");
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { supported, listening, interimTranscript, error, start, stop };
}
