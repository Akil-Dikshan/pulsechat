import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { useSocket } from "../context/SocketContext";
import { Phone, Video, MoreHorizontal, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import OnlineStatus from "./OnlineStatus";

// Hashed hue from a string (matches ConversationList)
function nameHue(name = "") {
  return Math.abs(name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 360;
}

// ── Empty state ─────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center flex-col gap-4 text-muted-foreground bg-background">
      <div className="w-20 h-20 rounded-3xl bg-elevated flex items-center justify-center">
        <MessageCircle className="w-9 h-9 text-muted-foreground/40" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-base text-muted-foreground/60 mb-1.5">Select a conversation</p>
        <p className="text-sm text-muted-foreground/40">Choose from your contacts to start chatting</p>
      </div>
    </div>
  );
}

// ── Chat header ──────────────────────────────────────────────────────────────
function ChatHeader({ selectedUser, selectedRoom, onlineUsers }) {
  const isRoom = !!selectedRoom;
  const name = isRoom ? selectedRoom.name : selectedUser?.username;
  const hue  = nameHue(name);

  return (
    <div className="flex-shrink-0 px-5 py-3.5 border-b border-border bg-card flex items-center gap-3">
      {/* Avatar */}
      <div className="relative">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-[#111]"
          style={{ background: `hsl(${hue} 70% 55%)` }}
        >
          {name?.[0]?.toUpperCase()}
        </div>
        {!isRoom && (
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${
              onlineUsers?.has(selectedUser?.asgardeoId) ? "bg-emerald" : "bg-muted-foreground/40"
            }`}
          />
        )}
        {isRoom && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card bg-lime" />
        )}
      </div>

      {/* Name + status */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{name}</p>
        {isRoom ? (
          <p className="text-xs text-muted-foreground">{selectedRoom.participants.length} members</p>
        ) : (
          <OnlineStatus userId={selectedUser?.asgardeoId} lastSeen={selectedUser?.lastSeen} />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {!isRoom && (
          <>
            <Button variant="ghost" size="icon" className="w-9 h-9 text-muted-foreground" title="Voice call">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-9 h-9 text-muted-foreground" title="Video call">
              <Video className="w-4 h-4" />
            </Button>
          </>
        )}
        <Button variant="ghost" size="icon" className="w-9 h-9 text-muted-foreground" title="More options">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Date divider ─────────────────────────────────────────────────────────────
function DateDivider({ label }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[11px] text-muted-foreground/60 font-medium">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function ChatWindow({ selectedUser, selectedRoom }) {
  const { getAccessToken } = useAuthContext();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const bottomRef = useRef(null);
  const topRef = useRef(null);
  const scrollRef = useRef(null);

  const isRoom    = !!selectedRoom;
  const isPrivate = !!selectedUser;

  // Get current user's MongoDB _id
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        setCurrentUserId(data._id);
      } catch (e) {
        console.error("Failed to fetch current user:", e);
      }
    };
    fetchCurrentUser();
  }, []);

  // Reset on conversation change
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
        const data = await (await fetch(url, { headers: { Authorization: `Bearer ${token}` } })).json();
        if (data.length < 50) setHasMore(false);
        if (page === 1) {
          setMessages(data);
        } else {
          const el = scrollRef.current;
          const prev = el?.scrollHeight || 0;
          setMessages((p) => [...data, ...p]);
          requestAnimationFrame(() => { if (el) el.scrollTop = el.scrollHeight - prev; });
        }
        if (!isRoom && socket && page === 1) {
          socket.emit("mark_as_read", { senderId: selectedUser.asgardeoId });
        }
      } catch (e) {
        console.error("Failed to load messages:", e);
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
      ([e]) => { if (e.isIntersecting) setPage((p) => p + 1); },
      { threshold: 1.0 }
    );
    if (topRef.current) observer.observe(topRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    const onPrivate = (msg) => {
      if (isPrivate && (msg.sender._id === selectedUser?._id || msg.recipient?._id === selectedUser?._id)) {
        setMessages((p) => [...p, msg]);
      }
    };
    const onSent = (msg) => { if (isPrivate) setMessages((p) => [...p, msg]); };
    const onRoom = (msg) => {
      if (isRoom && msg.room?._id === selectedRoom?._id) setMessages((p) => [...p, msg]);
    };
    const onRead = () => {
      setMessages((p) => p.map((m) => m.sender._id === currentUserId ? { ...m, read: true } : m));
    };
    socket.on("private_message", onPrivate);
    socket.on("message_sent", onSent);
    socket.on("room_message", onRoom);
    socket.on("messages_read", onRead);
    return () => {
      socket.off("private_message", onPrivate);
      socket.off("message_sent", onSent);
      socket.off("room_message", onRoom);
      socket.off("messages_read", onRead);
    };
  }, [socket, selectedUser, selectedRoom, currentUserId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (page === 1) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, page]);

  if (!selectedUser && !selectedRoom) return <EmptyState />;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <ChatHeader selectedUser={selectedUser} selectedRoom={selectedRoom} onlineUsers={onlineUsers} />

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
        <div ref={topRef} />

        {loading && page > 1 && (
          <div className="flex justify-center py-3">
            <div className="w-4 h-4 border-2 border-lime border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!hasMore && messages.length > 0 && (
          <DateDivider label="Beginning of conversation" />
        )}

        {loading && page === 1 && (
          <div className="flex justify-center py-12">
            <div className="w-5 h-5 border-2 border-lime border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground/50 py-20">
            <MessageCircle className="w-8 h-8" />
            <p className="text-sm">No messages yet — say hello!</p>
          </div>
        )}

        <DateDivider label="Today" />

        <div className="flex flex-col gap-1">
          {messages.map((msg, i) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              prevMessage={messages[i - 1]}
              currentUserId={currentUserId}
              isRoom={isRoom}
            />
          ))}
        </div>

        {isPrivate && <TypingIndicator selectedUser={selectedUser} />}

        <div ref={bottomRef} className="h-4" />
      </div>

      <MessageInput selectedUser={selectedUser} selectedRoom={selectedRoom} />
    </div>
  );
}
