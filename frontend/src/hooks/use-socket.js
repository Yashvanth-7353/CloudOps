/**
 * useSocket Hook
 * Custom hook for Socket.IO real-time communication
 */
import { useSocket } from '@/app/providers/socket-provider';
import { useCallback } from 'react';
export const useSocketHook = () => {
    const socket = useSocket();
    const subscribe = useCallback((event, handler) => {
        socket.on(event, handler);
        return () => socket.off(event, handler);
    }, [socket]);
    const emit = useCallback((event, data) => {
        socket.emit(event, data);
    }, [socket]);
    return {
        connected: socket.connected,
        subscribe,
        emit,
    };
};
