import { useEffect, useRef, useState } from "react";
import { WS_URL } from "../api/client";
import type { ActivityEvent } from "../types";

const RECONNECT_DELAY_MS = 2000;

export function useJarvisSocket(onEvent: (event: ActivityEvent) => void) {
  const [connected, setConnected] = useState(false);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      socket = new WebSocket(WS_URL);

      socket.onopen = () => setConnected(true);

      socket.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data) as ActivityEvent;
          onEventRef.current(event);
        } catch {
          // Ignore malformed frames rather than crashing the dashboard.
        }
      };

      socket.onclose = () => {
        setConnected(false);
        if (!cancelled) {
          reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };

      socket.onerror = () => {
        socket?.close();
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  return { connected };
}
