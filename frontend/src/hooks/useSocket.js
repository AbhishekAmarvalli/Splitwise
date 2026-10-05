import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { api } from '../utils/api';

const SOCKET_URL = import.meta.env.VITE_API_URL || '/';

// Serverless hosts (Vercel) can't hold long-lived WebSocket connections, so
// when the socket fails to connect we transparently fall back to polling the
// API while the tab is visible. Polling compares a fingerprint of the group's
// expenses/settlements/balances and emits a single `__refresh` event when
// anything changed, so pages stay live without per-event bookkeeping.
const POLL_INTERVAL = 15000;

function fingerprint(expenses, settlements, balances) {
  return JSON.stringify([
    (expenses || []).map((e) => [e.id, e.amount, e.updated_at]),
    (settlements || []).map((s) => [s.id, s.amount, s.settled_at]),
    (balances || {}).totalExpenses,
    (balances || {}).transactions?.length,
  ]);
}

export function useSocket(groupId, eventHandlers = {}) {
  const socketRef = useRef(null);
  const handlersRef = useRef(eventHandlers);
  const pollRef = useRef(null);
  const connectedRef = useRef(false);
  const lastFingerprint = useRef(null);

  // Keep handlers ref up to date without causing re-renders
  useEffect(() => {
    handlersRef.current = eventHandlers;
  }, [eventHandlers]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !groupId) return undefined;

    const emit = (event, payload) => handlersRef.current[event]?.(payload);

    // ----- polling fallback -----
    async function pollOnce() {
      try {
        const [expenses, settlements, balances] = await Promise.all([
          api.getGroupExpenses(groupId),
          api.getSettlements(groupId),
          api.getBalances(groupId),
        ]);

        const fp = fingerprint(expenses, settlements, balances);
        if (lastFingerprint.current === null) {
          // First poll just records the baseline — the page loaded this data
          // itself a moment ago, so don't re-emit anything.
          lastFingerprint.current = fp;
          return;
        }
        if (fp !== lastFingerprint.current) {
          lastFingerprint.current = fp;
          emit('__refresh');
        }
      } catch (err) {
        // Network hiccup / expired token — next tick retries (401 logs out
        // via the shared auth:unauthorized path in api.js).
      }
    }

    function startPolling() {
      if (pollRef.current) return;
      pollRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') pollOnce();
      }, POLL_INTERVAL);
      pollOnce();
    }

    function stopPolling() {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: { token },
      // Give up quickly when realtime isn't available so polling takes over
      // without hammering the server with reconnect attempts.
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      connectedRef.current = true;
      lastFingerprint.current = null;
      stopPolling();
      socket.emit('join-group', groupId);
    });

    socket.on('disconnect', () => {
      connectedRef.current = false;
      startPolling();
    });

    socket.on('connect_error', () => {
      // No realtime available (serverless) — fall back to polling.
      if (!connectedRef.current) startPolling();
    });

    socket.on('reconnect_failed', () => {
      startPolling();
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
      stopPolling();
      socket.emit('leave-group', groupId);
      for (const event of registeredEvents) {
        socket.off(event, wrappedHandlers[event]);
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [groupId]);

  return socketRef;
}
