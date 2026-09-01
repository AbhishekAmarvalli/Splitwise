import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export function useSocket(groupId, eventHandlers = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io('/', {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (groupId) {
        socket.emit('join-group', groupId);
      }
    });

    // Register event handlers
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      if (groupId) {
        socket.emit('leave-group', groupId);
      }
      socket.disconnect();
    };
  }, [groupId]);

  return socketRef;
}
