function MessageBubble({ message, currentUserId }) {
  const isSent = message.sender._id === currentUserId;

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

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
      <p className="text-xs text-muted-foreground mt-1 px-1">{formattedTime}</p>
    </div>
  );
}

export default MessageBubble;