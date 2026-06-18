import { useState } from "react";

interface CommandBarProps {
  sendCommand: (text: string) => Promise<void>;
}

export function CommandBar({ sendCommand }: CommandBarProps) {
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
      await sendCommand(command);
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
        placeholder='Type a command, e.g. "git status" — or use the mic'
        disabled={sending}
      />
      <button type="submit" disabled={sending || !text.trim()}>
        {sending ? "Sending…" : "Send"}
      </button>
      {error && <span className="command-bar-error">{error}</span>}
    </form>
  );
}
