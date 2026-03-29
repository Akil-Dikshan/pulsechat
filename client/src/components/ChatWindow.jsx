import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { useSocket } from "../context/SocketContext";
import MessageBubble from "./MessageBubble";

function ChatWindow({ selectedUser }) {
  const { getAccessToken } = useAuthContext();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const bottomRef = useRef(null);

  // Get current user's MongoDB _id
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/sync`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({}),
          }
        );
        const data = await res.json();
        setCurrentUserId(data._id);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Load message history when selected user changes
  useEffect(() => {
    if (!selectedUser) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const token = await getAccessToken();

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/messages/${selectedUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [selectedUser]);

  // Listen for incoming messages via socket
  useEffect(() => {
    if (!socket) return;

    const handlePrivateMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleMessageSent = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on("private_message", handlePrivateMessage);
    socket.on("message_sent", handleMessageSent);

    return () => {
      socket.off("private_message", handlePrivateMessage);
      socket.off("message_sent", handleMessageSent);
    };
  }, [socket]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Welcome to PulseChat</h2>
          <p className="text-muted-foreground">
            Search for a user to start chatting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Chat header */}
      <div className="px-6 py-4 border-b border-border flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
          {selectedUser.username[0].toUpperCase()}
        </div>
        <div>
          <p className="font-medium">{selectedUser.username}</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {loading && (
          <p className="text-sm text-muted-foreground text-center">
            Loading messages...
          </p>
        )}

        {!loading && messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            No messages yet. Say hello!
          </p>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            currentUserId={currentUserId}
          />
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default ChatWindow;