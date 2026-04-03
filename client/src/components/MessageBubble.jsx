function MessageBubble({ message, currentUserId }) {
  const isSent = message.sender._id === currentUserId;

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const ReadReceipt = () => {
    if (!isSent) return null;

    if (message.read) {
      // Double blue tick — read
      return (
        <span className="text-blue-500 text-xs">✓✓</span>
      );
    }

    // Single grey tick — sent
    return (
      <span className="text-muted-foreground text-xs">✓</span>
    );
  };

  return (
    <div className={`flex flex-col ${isSent ? "items-end" : "items-start"}`}>
      {!isSent && (
        <p className="text-xs text-muted-foreground mb-1 px-1">
          {message.sender.username}
        </p>
      )}
      <div
        className={`rounded-2xl px-4 py-2 max-w-xs lg:max-w-md ${
          isSent
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-accent text-accent-foreground rounded-bl-sm"
        }`}
      >
        <p className="text-sm">{message.content}</p>
      </div>
      <div className={`flex items-center gap-1 mt-1 px-1 ${isSent ? "flex-row-reverse" : ""}`}>
        <p className="text-xs text-muted-foreground">{formattedTime}</p>
        <ReadReceipt />
      </div>
    </div>
  );
}

export default MessageBubble;