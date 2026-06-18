interface PlaceholderPanelProps {
  label: string;
}

export function PlaceholderPanel({ label }: PlaceholderPanelProps) {
  return <p className="panel-empty">{label} isn't wired up yet — see docs/ROADMAP.md.</p>;
}
