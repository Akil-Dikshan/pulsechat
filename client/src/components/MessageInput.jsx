import { useState } from "react";
import { useSocket } from "../context/SocketContext";

function MessageInput({ selectedUser }) {
  const { socket } = useSocket();
  const [content, setContent] = useState("");

  const sendMessage = () => {
    if (!content.trim() || !socket || !selectedUser) return;

    socket.emit("private_message", {
      recipientId: selectedUser.asgardeoId,
      content: content.trim(),
    });

    setContent("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="px-6 py-4 border-t border-border flex items-center gap-3 flex-shrink-0">
      <input
        type="text"
        placeholder="Type a message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
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