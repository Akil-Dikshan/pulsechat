import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { state, getAccessToken } = useAuthContext();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!state.isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
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

        setSocket(newSocket);
      } catch (error) {
        console.error("Failed to connect socket:", error);
      }
    };

    connectSocket();

    return () => {
      socket?.disconnect();
    };
  }, [state.isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};