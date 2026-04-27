import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { useSocket } from "../context/SocketContext";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import OnlineStatus from "./OnlineStatus";

function ChatWindow({ selectedUser, selectedRoom }) {
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

  const isRoom = !!selectedRoom;
  const isPrivate = !!selectedUser;

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

  // Reset when conversation changes
  useEffect(() => {
    if (!selectedUser && !selectedRoom) return;
    setMessages([]);
    setPage(1);
    setHasMore(true);
  }, [selectedUser, selectedRoom]);

  // Load messages
  useEffect(() => {
    if (!selectedUser && !selectedRoom) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const token = await getAccessToken();

        const url = isRoom
          ? `${import.meta.env.VITE_API_URL}/api/messages/room/${selectedRoom._id}?page=${page}`
          : `${import.meta.env.VITE_API_URL}/api/messages/${selectedUser._id}?page=${page}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (data.length < 50) setHasMore(false);

        if (page === 1) {
          setMessages(data);
        } else {
          const container = messagesContainerRef.current;
          const prevScrollHeight = container?.scrollHeight || 0;
          setMessages((prev) => [...data, ...prev]);
          requestAnimationFrame(() => {
            if (container) {
              container.scrollTop = container.scrollHeight - prevScrollHeight;
            }
          });
        }

        if (!isRoom && socket && page === 1) {
          socket.emit("mark_as_read", { senderId: selectedUser.asgardeoId });
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [selectedUser, selectedRoom, page]);

  // Infinite scroll
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

    if (topRef.current) observer.observe(topRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handlePrivateMessage = (message) => {
      if (isPrivate && (
        message.sender._id === selectedUser?._id ||
        message.recipient?._id === selectedUser?._id
      )) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleMessageSent = (message) => {
      if (isPrivate) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleRoomMessage = (message) => {
      if (isRoom && message.room?._id === selectedRoom?._id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleMessagesRead = ({ byUserId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender._id === currentUserId ? { ...msg, read: true } : msg
        )
      );
    };

    socket.on("private_message", handlePrivateMessage);
    socket.on("message_sent", handleMessageSent);
    socket.on("room_message", handleRoomMessage);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("private_message", handlePrivateMessage);
      socket.off("message_sent", handleMessageSent);
      socket.off("room_message", handleRoomMessage);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [socket, selectedUser, selectedRoom, currentUserId]);

  // Auto-scroll
  useEffect(() => {
    if (page === 1) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, page]);

  if (!selectedUser && !selectedRoom) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Welcome to PulseChat</h2>
          <p className="text-muted-foreground">
            Search for a user or select a group to start chatting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Chat header */}
      <div className="px-6 py-4 border-b border-border flex items-center gap-3 flex-shrink-0">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium ${isRoom ? "bg-teal-600" : "bg-primary text-primary-foreground"}`}>
          {isRoom
            ? selectedRoom.name[0].toUpperCase()
            : selectedUser.username[0].toUpperCase()}
        </div>
        <div>
          <p className="font-medium">
            {isRoom ? selectedRoom.name : selectedUser.username}
          </p>
          {isRoom ? (
            <p className="text-xs text-muted-foreground">
              {selectedRoom.participants.length} members
            </p>
          ) : (
            <OnlineStatus
              userId={selectedUser.asgardeoId}
              lastSeen={selectedUser.lastSeen}
            />
          )}
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-3"
      >
        <div ref={topRef} />

        {loading && page === 1 && (
          <p className="text-sm text-muted-foreground text-center">Loading messages...</p>
        )}
        {loading && page > 1 && (
          <p className="text-sm text-muted-foreground text-center">Loading older messages...</p>
        )}
        {!hasMore && messages.length > 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">No more messages</p>
        )}
        {!loading && messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">No messages yet. Say hello!</p>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            currentUserId={currentUserId}
            isRoom={isRoom}
          />
        ))}

        <div ref={bottomRef} />
      </div>

      {isPrivate && <TypingIndicator selectedUser={selectedUser} />}

      <MessageInput
        selectedUser={selectedUser}
        selectedRoom={selectedRoom}
      />
    </div>
  );
}

export default ChatWindow;