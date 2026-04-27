import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { state, getAccessToken } = useAuthContext();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    if (!state.isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setOnlineUsers(new Set());
      setUnreadCounts({});
      return;
    }

    const connectSocket = async () => {
      try {
        const token = await getAccessToken();

        const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
          auth: { token },
        });

        newSocket.on("connect", () => {
          console.log("Socket connected:", newSocket.id);
        });

        newSocket.on("connect_error", (err) => {
          console.error("Socket connection error:", err.message);
        });

        newSocket.on("user_online", ({ userId }) => {
          setOnlineUsers((prev) => new Set([...prev, userId]));
        });

        newSocket.on("user_offline", ({ userId }) => {
          setOnlineUsers((prev) => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
        });

        newSocket.on("online_users", ({ userIds }) => {
          setOnlineUsers(new Set(userIds));
        });

        // Track unread counts for private messages
        newSocket.on("private_message", (message) => {
          const senderId = message.sender.asgardeoId || message.sender._id;
          setUnreadCounts((prev) => ({
            ...prev,
            [senderId]: (prev[senderId] || 0) + 1,
          }));

          // Show browser notification if tab is not focused
          if (document.hidden && Notification.permission === "granted") {
            new Notification(`New message from ${message.sender.username}`, {
              body: message.type === "text" ? message.content : "Sent an attachment",
              icon: "/favicon.ico",
            });
          }
        });

        setSocket(newSocket);
      } catch (error) {
        console.error("Failed to connect socket:", error);
      }
      // Request notification permission
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    };

    connectSocket();

    return () => {
      socket?.disconnect();
    };
  }, [state.isAuthenticated]);

  const clearUnread = (userId) => {
    setUnreadCounts((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  };

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, unreadCounts, clearUnread }}>
      {children}
    </SocketContext.Provider>
  );
};