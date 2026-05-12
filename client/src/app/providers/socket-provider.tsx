import React, { createContext, useContext, useEffect, useMemo } from 'react';

interface SocketContextType {
  connected: boolean;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = React.useState(false);

  useEffect(() => {
    // TODO: Initialize Socket.IO connection
    // const socket = io(process.env.REACT_APP_SOCKET_URL);
    // setConnected(true);
  }, []);

  const emit = (event: string, data: any) => {
    // TODO: Implement socket emit
  };

  const on = (event: string, callback: (data: any) => void) => {
    // TODO: Implement socket listener
  };

  const off = (event: string, callback?: (data: any) => void) => {
    // TODO: Implement socket listener removal
  };

  const value = useMemo(
    () => ({
      connected,
      emit,
      on,
      off,
    }),
    [connected]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
