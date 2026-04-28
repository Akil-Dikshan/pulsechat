import { useSocket } from "../context/SocketContext";

function formatLastSeen(date) {
  if (!date) return "a while ago";
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export default function OnlineStatus({ userId, lastSeen }) {
  const { onlineUsers } = useSocket();
  const isOnline = onlineUsers?.has ? onlineUsers.has(userId) : onlineUsers?.includes?.(userId);

  return (
    <p className={`text-xs font-medium ${isOnline ? "text-emerald" : "text-muted-foreground"}`}>
      {isOnline ? "Active now" : `Last seen ${formatLastSeen(lastSeen)}`}
    </p>
  );
}
