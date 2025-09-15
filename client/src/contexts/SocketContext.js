import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [orderUpdates, setOrderUpdates] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket server
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket']
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        // Join user's room for personalized updates
        newSocket.emit('join-room', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      newSocket.on('orderUpdate', (data) => {
        console.log('Order update received:', data);
        setOrderUpdates(prev => [...prev, data]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      // Disconnect socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated, user]);

  const clearOrderUpdates = () => {
    setOrderUpdates([]);
  };

  const value = {
    socket,
    orderUpdates,
    clearOrderUpdates
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
