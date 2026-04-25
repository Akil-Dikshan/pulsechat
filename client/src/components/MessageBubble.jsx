import { useState } from "react";
import { useSocket } from "../context/SocketContext";
import FilePreview from "./FilePreview";

function MessageBubble({ message, currentUserId, isRoom }) {
  const { socket } = useSocket();
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const isSent = message.sender._id === currentUserId;

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleReaction = (emoji) => {
    if (!socket) return;
    socket.emit("add_reaction", { messageId: message._id, emoji });
    setShowReactionPicker(false);
  };

  // Group reactions by emoji
  const groupedReactions = message.reactions?.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = { count: 0, users: [] };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].users.push(reaction.user?.username || "");
    return acc;
  }, {});

  const ReadReceipt = () => {
    if (!isSent) return null;
    if (message.read) return <span className="text-blue-500 text-xs">✓✓</span>;
    return <span className="text-muted-foreground text-xs">✓</span>;
  };

  const isMedia = message.type === "image" || message.type === "file";
  const quickEmojis = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  return (
    <div
      className={`flex flex-col group ${isSent ? "items-end" : "items-start"}`}
      onMouseLeave={() => setShowReactionPicker(false)}
    >
      {!isSent && (
        <p className="text-xs text-muted-foreground mb-1 px-1">
          {message.sender.username}
        </p>
      )}

      <div className="relative flex items-center gap-1">
        {/* Reaction button — appears on hover */}
        {!isSent && (
          <button
            onClick={() => setShowReactionPicker((prev) => !prev)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground text-sm"
          >
            😊
          </button>
        )}

        <div
          className={`rounded-2xl px-4 py-2 max-w-xs lg:max-w-md ${
            isMedia && message.type === "image"
              ? "bg-transparent p-0"
              : isSent
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-accent text-accent-foreground rounded-bl-sm"
          }`}
        >
          <FilePreview
            content={message.content}
            type={message.type}
            isSent={isSent}
          />
        </div>

        {/* Reaction button for sent messages */}
        {isSent && (
          <button
            onClick={() => setShowReactionPicker((prev) => !prev)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground text-sm"
          >
            😊
          </button>
        )}

        {/* Quick emoji picker */}
        {showReactionPicker && (
          <div
            className={`absolute bottom-8 ${isSent ? "right-8" : "left-8"} bg-background border border-border rounded-full px-2 py-1 flex gap-1 shadow-lg z-10`}
          >
            {quickEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="hover:scale-125 transition-transform text-base"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`flex items-center gap-1 mt-1 px-1 ${isSent ? "flex-row-reverse" : ""}`}>
        <p className="text-xs text-muted-foreground">{formattedTime}</p>
        <ReadReceipt />
      </div>

      {/* Reaction display */}
      {groupedReactions && Object.keys(groupedReactions).length > 0 && (
        <div className={`flex flex-wrap gap-1 mt-1 px-1 ${isSent ? "justify-end" : "justify-start"}`}>
          {Object.entries(groupedReactions).map(([emoji, data]) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="bg-accent border border-border rounded-full px-2 py-0.5 text-xs flex items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"
              title={data.users.join(", ")}
            >
              {emoji} {data.count}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default MessageBubble;