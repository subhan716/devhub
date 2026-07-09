import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children, currentUser }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [statusPref, setStatusPref] = useState(currentUser?.statusPreference || 'online');

  useEffect(() => {
    if (currentUser) {
      const newSocket = io('http://localhost:5000', {
        withCredentials: true,
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        newSocket.emit('setup', currentUser._id || currentUser.id);
        // Send initial preference
        newSocket.emit('setStatusPref', { userId: currentUser._id || currentUser.id, status: statusPref });
      });

      newSocket.on('getOnlineUsers', (users) => {
        setOnlineUsers(users);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [currentUser]);

  // Expose a function to toggle status
  const toggleStatusPref = () => {
    const newStatus = statusPref === 'online' ? 'invisible' : 'online';
    setStatusPref(newStatus);
    if (socket && currentUser) {
      socket.emit('setStatusPref', { userId: currentUser._id || currentUser.id, status: newStatus });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, statusPref, toggleStatusPref }}>
      {children}
    </SocketContext.Provider>
  );
};
