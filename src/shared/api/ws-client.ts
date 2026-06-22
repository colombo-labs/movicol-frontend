import { io, Socket } from "socket.io-client";

import { API_URL } from "@/shared/config";

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
