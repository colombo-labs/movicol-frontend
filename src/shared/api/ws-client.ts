import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3001';

/**
 * Create a namespaced WebSocket connection.
 * Handles auto-reconnect and heartbeat.
 */
export function createWsClient(namespace: string): Socket {
  const socket = io(`${WS_URL}/${namespace}`, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  // Heartbeat
  const heartbeatInterval = setInterval(() => {
    if (socket.connected) {
      socket.emit('heartbeat');
    }
  }, 30000);

  socket.on('disconnect', () => {
    clearInterval(heartbeatInterval);
  });

  return socket;
}
