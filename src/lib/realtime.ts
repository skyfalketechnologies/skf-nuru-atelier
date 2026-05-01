import { getAuthToken } from "@/lib/auth";

export type RealtimeEvent = {
  type: string;
  payload?: unknown;
  timestamp?: string;
};

function resolveWebSocketUrl() {
  const configured = process.env.NEXT_PUBLIC_WS_URL;
  if (configured) return configured;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  return `${apiUrl.replace(/^http/i, "ws")}/ws`;
}

export function connectAdminRealtime(
  onEvent: (event: RealtimeEvent) => void,
  onConnectionChange?: (connected: boolean) => void
) {
  const token = getAuthToken();
  if (!token) {
    onConnectionChange?.(false);
    return () => {};
  }

  const endpoint = new URL(resolveWebSocketUrl());
  endpoint.searchParams.set("token", token);
  const socket = new WebSocket(endpoint.toString());

  socket.onopen = () => onConnectionChange?.(true);
  socket.onclose = () => onConnectionChange?.(false);
  socket.onerror = () => onConnectionChange?.(false);
  socket.onmessage = (message) => {
    try {
      const parsed = JSON.parse(message.data) as RealtimeEvent;
      onEvent(parsed);
    } catch {
      // ignore malformed socket payloads
    }
  };

  return () => {
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      socket.close();
    }
  };
}
