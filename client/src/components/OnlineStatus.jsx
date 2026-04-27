import { useSocket } from "../context/SocketContext";

function OnlineStatus({ userId, lastSeen }) {
  const { onlineUsers } = useSocket();
  const isOnline = onlineUsers.has(userId);

  const formatLastSeen = (date) => {
    if (!date) return "a while ago";

    const now = new Date();
    const last = new Date(date);
    const diffMs = now - last;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 ${
          isOnline ? "bg-green-500" : "bg-gray-400"
        }`}
      />
      <span className="text-xs text-muted-foreground">
        {isOnline ? "Online" : `Last seen ${formatLastSeen(lastSeen)}`}
      </span>
    </div>
  );
}

export default OnlineStatus;