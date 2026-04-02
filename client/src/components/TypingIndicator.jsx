import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

function TypingIndicator({ selectedUser }) {
  const { socket } = useSocket();
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleTypingStart = ({ senderId }) => {
      if (senderId === selectedUser.asgardeoId) {
        setIsTyping(true);
      }
    };

    const handleTypingStop = ({ senderId }) => {
      if (senderId === selectedUser.asgardeoId) {
        setIsTyping(false);
      }
    };

    socket.on("typing_start", handleTypingStart);
    socket.on("typing_stop", handleTypingStop);

    return () => {
      socket.off("typing_start", handleTypingStart);
      socket.off("typing_stop", handleTypingStop);
    };
  }, [socket, selectedUser]);

  if (!isTyping) return null;

  return (
    <div className="flex items-center gap-1 px-6 py-2">
      <div className="bg-accent rounded-2xl px-4 py-2 flex items-center gap-1">
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
      </div>
    </div>
  );
}

export default TypingIndicator;