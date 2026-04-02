import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";

function MessageInput({ selectedUser }) {
  const { socket } = useSocket();
  const [content, setContent] = useState("");
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const sendMessage = () => {
    if (!content.trim() || !socket || !selectedUser) return;

    socket.emit("private_message", {
      recipientId: selectedUser.asgardeoId,
      content: content.trim(),
    });

    // Stop typing indicator when message is sent
    if (isTypingRef.current) {
      socket.emit("typing_stop", { recipientId: selectedUser.asgardeoId });
      isTypingRef.current = false;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setContent("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleChange = (e) => {
    setContent(e.target.value);

    if (!socket || !selectedUser) return;

    // Emit typing_start if not already typing
    if (!isTypingRef.current) {
      socket.emit("typing_start", { recipientId: selectedUser.asgardeoId });
      isTypingRef.current = true;
    }

    // Reset the debounce timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // After 3 seconds of no typing, emit typing_stop
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", { recipientId: selectedUser.asgardeoId });
      isTypingRef.current = false;
    }, 3000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="px-6 py-4 border-t border-border flex items-center gap-3 flex-shrink-0">
      <input
        type="text"
        placeholder="Type a message..."
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="flex-1 px-4 py-2 rounded-full border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        onClick={sendMessage}
        disabled={!content.trim()}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </div>
  );
}

export default MessageInput;