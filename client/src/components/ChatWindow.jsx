import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { useSocket } from "../context/SocketContext";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

function ChatWindow({ selectedUser }) {
  const { getAccessToken } = useAuthContext();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const bottomRef = useRef(null);
  const topRef = useRef(null);
  const messagesContainerRef = useRef(null);

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

  // Reset and load messages when selected user changes
  useEffect(() => {
    if (!selectedUser) return;

    setMessages([]);
    setPage(1);
    setHasMore(true);
  }, [selectedUser]);

  // Load messages when page or selectedUser changes
  useEffect(() => {
    if (!selectedUser) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const token = await getAccessToken();

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/messages/${selectedUser._id}?page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (data.length < 50) {
          setHasMore(false);
        }

        if (page === 1) {
          setMessages(data);
        } else {
          // Preserve scroll position when prepending older messages
          const container = messagesContainerRef.current;
          const prevScrollHeight = container?.scrollHeight || 0;

          setMessages((prev) => [...data, ...prev]);

          requestAnimationFrame(() => {
            if (container) {
              container.scrollTop = container.scrollHeight - prevScrollHeight;
            }
          });
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [selectedUser, page]);

  // Infinite scroll — watch the top sentinel element
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (topRef.current) {
      observer.observe(topRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

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

  // Auto-scroll to bottom only on first page load and new messages
  useEffect(() => {
    if (page === 1) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, page]);

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
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-3"
      >
        {/* Top sentinel — triggers infinite scroll */}
        <div ref={topRef} />

        {loading && page === 1 && (
          <p className="text-sm text-muted-foreground text-center">
            Loading messages...
          </p>
        )}

        {loading && page > 1 && (
          <p className="text-sm text-muted-foreground text-center">
            Loading older messages...
          </p>
        )}

        {!hasMore && messages.length > 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            No more messages
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

      {/* Message input */}
      <MessageInput selectedUser={selectedUser} />
    </div>
  );
}

export default ChatWindow;