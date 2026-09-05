import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || '/';

export function useSocket(groupId, eventHandlers = {}) {
  const socketRef = useRef(null);
  const handlersRef = useRef(eventHandlers);

  // Keep handlers ref up to date without causing re-renders
  useEffect(() => {
    handlersRef.current = eventHandlers;
  }, [eventHandlers]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (groupId) {
        socket.emit('join-group', groupId);
      }
    });

    // Register event handlers using ref so they always call the latest callbacks
    const registeredEvents = Object.keys(eventHandlers);
    const wrappedHandlers = {};

    for (const event of registeredEvents) {
      const handler = (...args) => handlersRef.current[event]?.(...args);
      wrappedHandlers[event] = handler;
      socket.on(event, handler);
    }

    return () => {
      if (groupId) {
        socket.emit('leave-group', groupId);
      }
      for (const event of registeredEvents) {
        socket.off(event, wrappedHandlers[event]);
      }
      socket.disconnect();
    };
  }, [groupId]);

  return socketRef;
}
