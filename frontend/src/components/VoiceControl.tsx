import { useState } from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { VoiceOrb, type VoiceOrbState } from "./VoiceOrb";

interface VoiceControlProps {
  onTranscript: (text: string) => void;
  speaking: boolean;
  ttsSupported: boolean;
  voiceRepliesEnabled: boolean;
  onToggleVoiceReplies: () => void;
}

export function VoiceControl({
  onTranscript,
  speaking,
  ttsSupported,
  voiceRepliesEnabled,
  onToggleVoiceReplies,
}: VoiceControlProps) {
  const [lastHeard, setLastHeard] = useState<string | null>(null);

  const { supported, listening, interimTranscript, error, start, stop } = useSpeechRecognition({
    onResult: (transcript) => {
      setLastHeard(transcript);
      onTranscript(transcript);
    },
  });

  const orbState: VoiceOrbState = speaking ? "speaking" : listening ? "listening" : "idle";

  if (!supported) {
    return (
      <div className="voice-control voice-control-unsupported">
        <VoiceOrb state={orbState} />
        <p className="panel-empty">
          Voice input needs Chrome or Edge (Web Speech API). Voice replies{" "}
          {ttsSupported ? "are still available." : "aren't supported in this browser either."}
        </p>
      </div>
    );
  }

  return (
    <div className="voice-control">
      <VoiceOrb state={orbState} />

      <button
        type="button"
        className={`voice-mic-button ${listening ? "active" : ""}`}
        onClick={() => (listening ? stop() : start())}
      >
        {listening ? "Listening… tap to stop" : "Hold to talk to Jarvis"}
      </button>

      <label className="voice-replies-toggle">
        <input type="checkbox" checked={voiceRepliesEnabled} onChange={onToggleVoiceReplies} disabled={!ttsSupported} />
        Speak replies aloud
      </label>

      {interimTranscript && <p className="voice-last-heard voice-interim">{interimTranscript}</p>}
      {!interimTranscript && lastHeard && <p className="voice-last-heard">Heard: "{lastHeard}"</p>}
      {error && <p className="command-bar-error">Mic error: {error}</p>}
    </div>
  );
}
