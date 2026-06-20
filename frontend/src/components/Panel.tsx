import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  children: ReactNode;
}

export function Panel({ title, children }: PanelProps) {
  return (
    <section className="panel">
      {/* Scan line sweeps on hover */}
      <div className="panel-scan" />
      {/* Bottom corner brackets */}
      <span className="panel-corner-bl" />
      <span className="panel-corner-br" />
      <div className="panel-header">
        <span className="panel-header-dot" />
        <h2>{title}</h2>
      </div>
      <div className="panel-body">{children}</div>
    </section>
  );
}
