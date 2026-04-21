import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { useSocket } from "../context/SocketContext";
import EmojiPicker from "emoji-picker-react";

function MessageInput({ selectedUser, selectedRoom }) {
  const { getAccessToken } = useAuthContext();
  const { socket } = useSocket();
  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const fileInputRef = useRef(null);

  const isRoom = !!selectedRoom;

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const handleEmojiClick = (emojiData) => {
    setContent((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const sendMessage = () => {
    if (!content.trim() || !socket) return;
    if (!selectedUser && !selectedRoom) return;

    if (isRoom) {
      socket.emit("room_message", {
        roomId: selectedRoom._id,
        content: content.trim(),
      });
    } else {
      socket.emit("private_message", {
        recipientId: selectedUser.asgardeoId,
        content: content.trim(),
      });

      if (isTypingRef.current) {
        socket.emit("typing_stop", { recipientId: selectedUser.asgardeoId });
        isTypingRef.current = false;
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
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

    if (!socket || !selectedUser || isRoom) return;

    if (!isTypingRef.current) {
      socket.emit("typing_start", { recipientId: selectedUser.asgardeoId });
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", { recipientId: selectedUser.asgardeoId });
      isTypingRef.current = false;
    }, 3000);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !socket) return;
    if (!selectedUser && !selectedRoom) return;

    try {
      setUploading(true);
      const token = await getAccessToken();

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Upload failed");
        return;
      }

      const { url, type, name } = await res.json();

      if (isRoom) {
        socket.emit("room_message", {
          roomId: selectedRoom._id,
          content: url,
          type,
          fileName: name,
        });
      } else {
        socket.emit("private_message", {
          recipientId: selectedUser.asgardeoId,
          content: url,
          type,
          fileName: name,
        });
      }
    } catch (error) {
      console.error("File upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }


  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative px-6 py-4 border-t border-border flex items-center gap-3 flex-shrink-0">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,application/pdf"
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        title="Attach file"
      >
        {uploading ? (
          <span className="text-xs">Uploading...</span>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        )}
      </button>
      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-6 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} height={350} width={300} />
        </div>
      )}

      {/* Emoji button */}
      <button
        onClick={() => setShowEmojiPicker((prev) => !prev)}
        className="text-muted-foreground hover:text-foreground transition-colors"
        title="Emoji"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </button>

      <input
        type="text"
        placeholder={isRoom ? `Message ${selectedRoom?.name}...` : "Type a message..."}
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