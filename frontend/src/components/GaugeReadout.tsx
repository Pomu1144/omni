interface GaugeReadoutProps {
  value: number;
  valueText: string;
  label: string;
  active?: boolean;
}

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function GaugeReadout({ value, valueText, label, active }: GaugeReadoutProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div className={`gauge-readout ${active ? "gauge-active" : ""}`}>
      <svg viewBox="0 0 96 96" className="gauge-svg" aria-hidden="true">
        <circle cx="48" cy="48" r={RADIUS} className="gauge-track" />
        <circle
          cx="48"
          cy="48"
          r={RADIUS}
          className="gauge-fill"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="gauge-readout-text">
        <span className="gauge-value">{valueText}</span>
        <span className="gauge-label">{label}</span>
      </div>
    </div>
  );
}
