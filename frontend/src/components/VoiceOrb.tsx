export type VoiceOrbState = "idle" | "listening" | "speaking";

interface VoiceOrbProps {
  state: VoiceOrbState;
}

export function VoiceOrb({ state }: VoiceOrbProps) {
  return (
    <div className={`voice-orb voice-orb-${state}`}>
      <div className="voice-orb-ripple" />
      <div className="voice-orb-ripple voice-orb-ripple-delay" />
      <div className="voice-orb-core" />
    </div>
  );
}
