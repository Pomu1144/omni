import { useMemo } from "react";
import type { AssistantState } from "../hooks/useVoiceIO";

interface HudCoreProps {
  state: AssistantState;
  label: string;
}

const STATE_LABEL: Record<AssistantState, string> = {
  idle: "STANDBY",
  listening: "LISTENING",
  thinking: "PROCESSING",
  speaking: "RESPONDING",
};

const BAR_COUNT = 28;

interface TickProps {
  count: number;
  radius: number;
  length: number;
  className: string;
}

function Ticks({ count, radius, length, className }: TickProps) {
  const ticks = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        return {
          key: i,
          x1: 100 + radius * Math.cos(angle),
          y1: 100 + radius * Math.sin(angle),
          x2: 100 + (radius - length) * Math.cos(angle),
          y2: 100 + (radius - length) * Math.sin(angle),
        };
      }),
    [count, radius, length],
  );

  return (
    <g className={className}>
      {ticks.map((tick) => (
        <line key={tick.key} x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2} />
      ))}
    </g>
  );
}

export function HudCore({ state, label }: HudCoreProps) {
  const bars = useMemo(() => Array.from({ length: BAR_COUNT }, (_, i) => i), []);

  return (
    <div className={`hud-core hud-core-${state}`}>
      <svg viewBox="0 0 200 200" className="hud-core-rings" aria-hidden="true">
        <circle cx="100" cy="100" r="92" className="hud-ring hud-ring-outer" />
        <Ticks count={60} radius={92} length={4} className="hud-ticks-minor" />
        <Ticks count={12} radius={92} length={9} className="hud-ticks-major" />
        <circle cx="100" cy="100" r="70" className="hud-ring hud-ring-mid" />
        <circle cx="100" cy="100" r="48" className="hud-ring hud-ring-inner" />
      </svg>

      <div className="hud-core-bars" aria-hidden="true">
        {bars.map((i) => (
          <span key={i} style={{ animationDelay: `${i * 0.035}s` }} />
        ))}
      </div>

      <div className="hud-core-readout">
        <span className="hud-core-state">{STATE_LABEL[state]}</span>
        <span className="hud-core-label">{label}</span>
      </div>
    </div>
  );
}
