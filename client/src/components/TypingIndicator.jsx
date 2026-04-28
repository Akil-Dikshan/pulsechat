import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

export default function TypingIndicator({ selectedUser }) {
  const { socket } = useSocket();
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!socket || !selectedUser) return;
    const onStart = ({ senderId }) => { if (senderId === selectedUser.asgardeoId) setIsTyping(true); };
    const onStop  = ({ senderId }) => { if (senderId === selectedUser.asgardeoId) setIsTyping(false); };
    socket.on("typing_start", onStart);
    socket.on("typing_stop",  onStop);
    return () => { socket.off("typing_start", onStart); socket.off("typing_stop", onStop); };
  }, [socket, selectedUser]);

  if (!isTyping) return null;

  return (
    <div className="flex items-end gap-2 mb-2 animate-fade-in">
      <div className="w-7 h-7 rounded-full bg-elevated border border-border flex items-center justify-center text-[10px] font-bold text-foreground flex-shrink-0">
        {selectedUser?.username?.[0]?.toUpperCase()}
      </div>
      <div className="bg-elevated rounded-[4px_16px_16px_16px] px-3.5 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 inline-block"
            style={{ animation: `typingBounce 1.2s ease-in-out ${i * 0.15}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}
