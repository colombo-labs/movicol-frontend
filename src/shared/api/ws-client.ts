import { io, Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

/**
 * Create a namespaced WebSocket connection.
 * Socket.io handles the ws:// upgrade internally — use http:// base URL.
 */
export function createWsClient(namespace: string): Socket {
  const socket = io(`${API_URL}/${namespace}`, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    timeout: 5000,
  });

  return socket;
}
