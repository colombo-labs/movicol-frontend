import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

import { createWsClient } from '../api/ws-client';

/**
 * Reusable hook for WebSocket connections.
 * Manages lifecycle (connect/disconnect) tied to component mount.
 */
export function useSocket(namespace: string) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = createWsClient(namespace);
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [namespace]);

  return { socket: socketRef.current, isConnected };
}
