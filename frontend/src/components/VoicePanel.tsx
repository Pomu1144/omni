import type { AssistantState, MicState } from "../hooks/useVoiceIO";

interface VoicePanelProps {
  supported: boolean;
  micState: MicState;
  assistantState: AssistantState;
  voiceModeOn: boolean;
  ttsConfigured: boolean | null;
  transcript: string;
  lastResponse: string | null;
  error: string | null;
  onToggleVoiceMode: () => void;
  onMicClick: () => void;
}

const MIC_LABEL: Record<MicState, string> = {
  idle: "Talk to Omni",
  listening: "Listening…",
  denied: "Mic access denied",
  unsupported: "Mic not supported",
};

export function VoicePanel({
  supported,
  micState,
  assistantState,
  voiceModeOn,
  ttsConfigured,
  transcript,
  lastResponse,
  error,
  onToggleVoiceMode,
  onMicClick,
}: VoicePanelProps) {
  const micDisabled = !supported || !voiceModeOn || assistantState === "thinking" || assistantState === "speaking";

  return (
    <div className="voice-panel">
      <div className="voice-panel-row">
        <button type="button" className={`voice-toggle ${voiceModeOn ? "on" : "off"}`} onClick={onToggleVoiceMode}>
          Voice mode: {voiceModeOn ? "On" : "Off"}
        </button>
        <button
          type="button"
          className={`mic-button mic-${micState}`}
          onClick={onMicClick}
          disabled={micDisabled}
        >
          <span className="mic-dot" aria-hidden="true" />
          {MIC_LABEL[micState]}
        </button>
      </div>

      {!supported && (
        <p className="voice-note">
          Speech recognition isn't supported in this browser — try Chrome or Edge. Typed commands still work.
        </p>
      )}
      {supported && ttsConfigured === false && (
        <p className="voice-note">Add ELEVENLABS_API_KEY to backend/.env to hear Omni speak responses.</p>
      )}
      {error && <p className="voice-note voice-error">{error}</p>}
      {transcript && <p className="voice-transcript">"{transcript}"</p>}
      {lastResponse && <p className="voice-response">{lastResponse}</p>}
    </div>
  );
}
