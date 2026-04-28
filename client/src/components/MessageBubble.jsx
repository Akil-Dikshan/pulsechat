import { useState } from "react";
import { useSocket } from "../context/SocketContext";
import FilePreview from "./FilePreview";
import { cn } from "@/lib/utils";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "✅"];

function nameHue(name = "") {
  return Math.abs(name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 360;
}

export default function MessageBubble({ message, prevMessage, currentUserId, isRoom }) {
  const { socket } = useSocket();
  const [showPicker, setShowPicker] = useState(false);

  const isSent    = message.sender._id === currentUserId;
  const isFirst   = !prevMessage || prevMessage.sender._id !== message.sender._id;
  const senderName = message.sender?.username ?? "";
  const hue        = nameHue(senderName);

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleReaction = (emoji) => {
    if (!socket) return;
    socket.emit("add_reaction", { messageId: message._id, emoji });
    setShowPicker(false);
  };

  const groupedReactions = (message.reactions ?? []).reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { count: 0, users: [] };
    acc[r.emoji].count++;
    acc[r.emoji].users.push(r.user?.username ?? "");
    return acc;
  }, {});

  const statusIcon = () => {
    if (!isSent) return null;
    if (message.read)      return <span className="text-lime text-[10px] font-bold">✓✓</span>;
    if (message.delivered) return <span className="text-muted-foreground text-[10px]">✓✓</span>;
    return <span className="text-muted-foreground text-[10px]">✓</span>;
  };

  return (
    <div
      className={cn(
        "flex group",
        isSent ? "flex-row-reverse" : "flex-row",
        "items-end gap-2",
        isFirst ? "mt-3" : "mt-0.5",
        Object.keys(groupedReactions).length > 0 ? "mb-4" : "mb-0"
      )}
      onMouseLeave={() => setShowPicker(false)}
    >
      {/* Avatar (received only, first in run) */}
      <div className="w-7 flex-shrink-0 self-end">
        {!isSent && isFirst && (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-[#111]"
            style={{ background: `hsl(${hue} 70% 55%)` }}
          >
            {senderName[0]?.toUpperCase()}
          </div>
        )}
      </div>

      {/* Bubble + reactions + meta */}
      <div className={cn("flex flex-col max-w-[65%]", isSent ? "items-end" : "items-start", "relative")}>
        {/* Sender name (group chats, first in run) */}
        {!isSent && isFirst && isRoom && (
          <p className="text-[11px] text-muted-foreground font-medium mb-1 px-1">{senderName}</p>
        )}

        <div className="relative">
          {/* React button (hover) */}
          <button
            onClick={() => setShowPicker((p) => !p)}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
              "w-7 h-7 rounded-lg bg-elevated border border-border flex items-center justify-center text-sm z-10",
              isSent ? "-left-9" : "-right-9"
            )}
          >
            😊
          </button>

          {/* Emoji picker */}
          {showPicker && (
            <div
              className={cn(
                "absolute bottom-[110%] bg-elevated rounded-xl border border-border p-2 flex gap-1.5 z-20 shadow-xl animate-fade-in",
                isSent ? "right-0" : "left-0"
              )}
            >
              {QUICK_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => handleReaction(e)}
                  className="text-lg hover:scale-125 transition-transform p-1 rounded-md hover:bg-muted"
                >
                  {e}
                </button>
              ))}
            </div>
          )}

          {/* Bubble */}
          <div
            className={cn(
              "px-3.5 py-2.5 text-sm leading-relaxed break-words",
              isSent
                ? "bg-lime text-primary-foreground rounded-[16px_4px_16px_16px]"
                : "bg-elevated text-foreground rounded-[4px_16px_16px_16px]"
            )}
          >
            <FilePreview content={message.content} type={message.type} isSent={isSent} />
          </div>
        </div>

        {/* Reactions */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className={cn("flex flex-wrap gap-1 mt-1.5", isSent ? "justify-end" : "justify-start")}>
            {Object.entries(groupedReactions).map(([emoji, data]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="bg-elevated border border-border rounded-full px-2 py-0.5 text-xs flex items-center gap-1 hover:border-lime/40 transition-colors"
                title={data.users.join(", ")}
              >
                {emoji}
                <span className="text-muted-foreground font-medium">{data.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Time + status */}
        <div className={cn("flex items-center gap-1 mt-1 px-0.5", isSent ? "flex-row-reverse" : "")}>
          <span className="text-[10px] text-muted-foreground/60">{formattedTime}</span>
          {statusIcon()}
        </div>
      </div>
    </div>
  );
}
