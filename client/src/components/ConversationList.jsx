import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { useSocket } from "../context/SocketContext";
import { Search, Bell, Plus, Settings, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import RoomModal from "./RoomModal";

// Status dot colours
const STATUS_COLOR = {
  online:  "bg-emerald",
  away:    "bg-yellow-400",
  offline: "bg-muted-foreground/40",
};

function StatusDot({ status = "offline", className }) {
  return (
    <span className={cn(
      "inline-block w-2.5 h-2.5 rounded-full border-2 border-sidebar flex-shrink-0",
      STATUS_COLOR[status] ?? STATUS_COLOR.offline,
      className
    )} />
  );
}

// Coloured initials avatar
function InitAvatar({ name, size = 40, color, className }) {
  const initials = name
    ?.split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

  const hue = color ?? (name
    ? Math.abs(name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 360
    : 180);

  const bg   = typeof hue === "string" ? hue : `hsl(${hue} 60% 50%)`;
  const text = typeof hue === "string" ? "#111" : "#111";

  return (
    <div
      className={cn("rounded-full flex items-center justify-center font-semibold flex-shrink-0", className)}
      style={{ width: size, height: size, background: bg, color: text, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

export default function ConversationList({
  onSelectUser, onSelectRoom, selectedUser, selectedRoom, currentUser, onOpenSearch,
}) {
  const { getAccessToken } = useAuthContext();
  const { socket, unreadCounts, clearUnread, onlineUsers } = useSocket();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [conversations, setConversations] = useState([]); // past DM partners
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [tab, setTab] = useState("all");

  // Load past DM conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(await res.json());
      } catch (e) {
        console.error("Failed to load conversations:", e);
      }
    };
    loadConversations();
  }, []);

  // Load group rooms
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRooms(await res.json());
      } catch (e) {
        console.error("Failed to load rooms:", e);
      }
    };
    loadRooms();
  }, []);

  // Keep conversations list fresh as new messages arrive
  useEffect(() => {
    if (!socket) return;
    const onNewMessage = (msg) => {
      const sender = msg.sender;
      if (!sender?._id) return;
      setConversations((prev) => {
        const exists = prev.some((c) => c.user._id === sender._id);
        if (exists) {
          return prev.map((c) =>
            c.user._id === sender._id
              ? { ...c, lastMessage: { content: msg.content, type: msg.type, createdAt: msg.createdAt, isMine: false } }
              : c
          );
        }
        return [{ user: sender, lastMessage: { content: msg.content, type: msg.type, createdAt: msg.createdAt, isMine: false }, unreadCount: 1 }, ...prev];
      });
    };
    socket.on("private_message", onNewMessage);
    return () => socket.off("private_message", onNewMessage);
  }, [socket]);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (!value.trim()) { setResults([]); return; }
    try {
      setSearching(true);
      const token = await getAccessToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/search?q=${value}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResults(await res.json());
    } catch (e) {
      console.error("Search error:", e);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (user) => {
    onSelectUser(user);
    clearUnread(user.asgardeoId);
    setQuery("");
    setResults([]);
    setConversations((prev) => {
      if (prev.some((c) => c.user._id === user._id)) {
        return prev.map((c) => c.user._id === user._id ? { ...c, unreadCount: 0 } : c);
      }
      return [{ user, lastMessage: null, unreadCount: 0 }, ...prev];
    });
  };

  const handleRoomCreated = (room) => {
    setRooms((prev) => [room, ...prev]);
    onSelectRoom(room);
    if (socket) socket.emit("join_room", { roomId: room._id });
  };

  // Filter visible items based on tab
  const showUsers  = tab === "all" || tab === "direct";
  const showGroups = tab === "all" || tab === "groups";

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="w-[300px] h-full bg-sidebar border-r border-border flex flex-col flex-shrink-0">
      {/* Top bar */}
      <div className="px-4 pt-4 pb-3 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-lime flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3z" />
              </svg>
            </div>
            <span className="font-display font-extrabold text-base tracking-tight">PulseChat</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground" onClick={onOpenSearch} title="Search">
              <Search className="w-4 h-4" />
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-muted-foreground relative"
                title="Notifications"
                onClick={() => setShowNotifications((p) => !p)}
              >
                <Bell className="w-4 h-4" />
                {totalUnread > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 p-0 justify-center text-[9px]">
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </Badge>
                )}
              </Button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <NotificationsPanel
                  conversations={conversations}
                  unreadCounts={unreadCounts}
                  onlineUsers={onlineUsers}
                  onSelect={(user) => { handleSelectUser(user); setShowNotifications(false); }}
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div
          className="flex items-center gap-2 bg-elevated rounded-xl px-3 py-2 cursor-text border border-transparent hover:border-border transition-colors"
          onClick={onOpenSearch}
        >
          <Search className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" />
          <span className="text-sm text-muted-foreground/60">Search…</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-3 py-2 border-b border-border flex-shrink-0 flex items-center gap-2">
        <Tabs value={tab} onValueChange={setTab} className="flex-1">
          <TabsList className="w-full bg-transparent p-0 gap-1">
            {["all", "direct", "groups"].map((t) => (
              <TabsTrigger key={t} value={t} className="flex-1 capitalize text-xs h-7 rounded-lg">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 flex-shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => setShowRoomModal(true)}
          title="New group"
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="py-1.5 px-2">

          {/* ── Inline search results ── */}
          {query && (
            <>
              {searching && (
                <div className="flex justify-center py-6">
                  <div className="w-4 h-4 border-2 border-lime border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {!searching && results.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No users found for &quot;{query}&quot;
                </p>
              )}
              {results.map((user) => (
                <ContactRow
                  key={user._id}
                  name={user.username}
                  sub={user.email}
                  isOnline={onlineUsers?.has(user.asgardeoId)}
                  unread={unreadCounts[user.asgardeoId]}
                  active={selectedUser?._id === user._id}
                  onClick={() => handleSelectUser(user)}
                />
              ))}
            </>
          )}

          {/* ── No-query flat list ── */}
          {!query && (
            <>
              {/* DM conversations */}
              {showUsers && conversations.map(({ user, lastMessage, unreadCount }) => (
                <ContactRow
                  key={user._id}
                  name={user.username}
                  sub={formatLastMessage(lastMessage, user.email)}
                  isOnline={onlineUsers?.has(user.asgardeoId)}
                  unread={unreadCounts[user.asgardeoId] ?? unreadCount}
                  active={selectedUser?._id === user._id}
                  onClick={() => handleSelectUser(user)}
                />
              ))}

              {/* Groups */}
              {showGroups && rooms.map((room) => (
                <ContactRow
                  key={room._id}
                  name={room.name}
                  sub={`${room.participants.length} members`}
                  isGroup
                  active={selectedRoom?._id === room._id}
                  onClick={() => onSelectRoom(room)}
                />
              ))}

              {/* Empty state */}
              {conversations.length === 0 && rooms.length === 0 && (
                <div className="flex flex-col items-center gap-3 px-4 py-12 text-center text-muted-foreground/50">
                  <Search className="w-6 h-6" />
                  <p className="text-sm">Search for someone to start chatting</p>
                </div>
              )}
              {conversations.length === 0 && rooms.length > 0 && showUsers && tab === "direct" && (
                <div
                  className="flex items-center gap-2.5 px-3 py-3 mx-1 rounded-xl cursor-pointer hover:bg-muted transition-colors text-muted-foreground/60"
                  onClick={onOpenSearch}
                >
                  <Search className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">Find someone to message</span>
                </div>
              )}

              {/* New group button — only visible in groups/all tab when no rooms */}
              {showGroups && rooms.length === 0 && (
                <button
                  onClick={() => setShowRoomModal(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-3 mx-0 rounded-xl hover:bg-muted transition-colors text-muted-foreground/60 text-sm"
                >
                  <Users className="w-4 h-4 flex-shrink-0" />
                  Create a group chat
                </button>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* User footer */}
      <div className="border-t border-border flex-shrink-0">
        <div className="flex items-center gap-2.5 px-4 py-3 hover:bg-muted transition-colors cursor-pointer group">
          <div className="relative">
            <InitAvatar name={currentUser?.username ?? "Me"} size={36} color="#D6FF00" />
            <StatusDot status="online" className="absolute -bottom-0.5 -right-0.5 border-sidebar" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{currentUser?.username ?? "You"}</p>
            <p className="text-[11px] text-muted-foreground truncate">{currentUser?.email ?? ""}</p>
          </div>
          <Settings className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {showRoomModal && (
        <RoomModal
          onClose={() => setShowRoomModal(false)}
          onRoomCreated={handleRoomCreated}
        />
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatLastMessage(lastMessage, fallback = "") {
  if (!lastMessage) return fallback;
  const prefix = lastMessage.isMine ? "You: " : "";
  switch (lastMessage.type) {
    case "image": return `${prefix}📷 Photo`;
    case "video": return `${prefix}🎬 Video`;
    case "audio": return `${prefix}🎵 Audio`;
    case "file":  return `${prefix}📎 File`;
    default:      return `${prefix}${lastMessage.content ?? ""}`;
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────

function NotificationsPanel({ conversations, unreadCounts, onlineUsers, onSelect, onClose }) {
  const panelRef = useRef(null);
  const unread = conversations.filter(
    ({ user }) => (unreadCounts[user.asgardeoId] ?? 0) > 0
  );

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-1 w-72 bg-sidebar border border-border rounded-xl shadow-xl z-50 overflow-hidden"
    >
      <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">Notifications</span>
        {unread.length > 0 && (
          <span className="text-[10px] text-muted-foreground">{unread.length} unread</span>
        )}
      </div>
      {unread.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground/50">
          <Bell className="w-5 h-5" />
          <p className="text-xs">No new notifications</p>
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto py-1">
          {unread.map(({ user, lastMessage }) => {
            const count = unreadCounts[user.asgardeoId] ?? 0;
            const hue = Math.abs((user.username ?? "").split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 360;
            return (
              <button
                key={user._id}
                onClick={() => onSelect(user)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors text-left"
              >
                <div className="relative flex-shrink-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-[#111]"
                    style={{ background: `hsl(${hue} 70% 55%)` }}
                  >
                    {user.username?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <span className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-sidebar",
                    onlineUsers?.has(user.asgardeoId) ? "bg-emerald" : "bg-muted-foreground/40"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.username}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {formatLastMessage(lastMessage, "New message")}
                  </p>
                </div>
                <Badge className="flex-shrink-0 min-w-[20px] h-5 justify-center">{count}</Badge>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ContactRow({ name, sub, isOnline, isGroup, unread, active, onClick }) {
  const initials = name
    ?.split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

  const hue = Math.abs((name ?? "").split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 360;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left mx-0",
        active ? "bg-lime/10" : "hover:bg-muted"
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm text-[#111]"
          style={{ background: `hsl(${hue} 70% 55%)` }}
        >
          {initials}
        </div>
        {!isGroup && (
          <StatusDot
            status={isOnline ? "online" : "offline"}
            className="absolute -bottom-0.5 -right-0.5"
          />
        )}
        {isGroup && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-lime border-2 border-sidebar" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <span className={cn("text-sm truncate", active ? "font-semibold" : "font-medium")}>{name}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{sub}</p>
      </div>

      {/* Unread badge */}
      {unread > 0 && (
        <Badge className="flex-shrink-0 min-w-[20px] h-5 justify-center">{unread}</Badge>
      )}
    </button>
  );
}
