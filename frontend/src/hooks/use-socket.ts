/**
 * useSocket Hook
 * Custom hook for Socket.IO real-time communication
 */

import { useSocket } from '@/app/providers/socket-provider';
import { useCallback } from 'react';

export const useSocketHook = () => {
  const socket = useSocket();

  const subscribe = useCallback((event: string, handler: (data: any) => void) => {
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [socket]);

  const emit = useCallback((event: string, data: any) => {
    socket.emit(event, data);
  }, [socket]);

  return {
    connected: socket.connected,
    subscribe,
    emit,
  };
};
