import { useState } from "react";
import { api } from "../api/client";
import type { CommandResponse } from "../types";

interface CommandBarProps {
  onResult: (result: CommandResponse, commandText: string) => void;
}

export function CommandBar({ onResult }: CommandBarProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const command = text.trim();
    if (!command || sending) return;

    setSending(true);
    setError(null);
    try {
      const result = await api.sendCommand(command);
      onResult(result, command);
      setText("");
    } catch {
      setError("Couldn't reach the Jarvis backend. Is it running on port 8000?");
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="command-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder='Type a command, e.g. "git status" — voice input lands in a later milestone'
        disabled={sending}
      />
      <button type="submit" disabled={sending || !text.trim()}>
        {sending ? "Sending…" : "Send"}
      </button>
      {error && <span className="command-bar-error">{error}</span>}
    </form>
  );
}
