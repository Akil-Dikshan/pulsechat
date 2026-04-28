import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { useSocket } from "../context/SocketContext";
import { ArrowUp, Image, FileText, Music, MapPin, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const ATTACH_OPTIONS = [
  { icon: Image,    label: "Photo / Video",  accept: "image/*,video/*" },
  { icon: FileText, label: "File",            accept: "application/pdf,.doc,.docx" },
  { icon: Music,    label: "Audio",           accept: "audio/*" },
];

export default function MessageInput({ selectedUser, selectedRoom }) {
  const { getAccessToken } = useAuthContext();
  const { socket } = useSocket();
  const [content, setContent]         = useState("");
  const [uploading, setUploading]     = useState(false);
  const [showEmoji, setShowEmoji]     = useState(false);
  const textareaRef                   = useRef(null);
  const fileInputRef                  = useRef(null);
  const emojiPickerRef                = useRef(null);
  const fileAcceptRef                 = useRef("image/*,video/*");
  const typingTimeoutRef              = useRef(null);
  const isTypingRef                   = useRef(false);

  const isRoom = !!selectedRoom;

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [content]);

  const sendMessage = () => {
    if (!content.trim() || !socket) return;
    if (!selectedUser && !selectedRoom) return;

    if (isRoom) {
      socket.emit("room_message", { roomId: selectedRoom._id, content: content.trim() });
    } else {
      socket.emit("private_message", { recipientId: selectedUser.asgardeoId, content: content.trim() });
      if (isTypingRef.current) {
        socket.emit("typing_stop", { recipientId: selectedUser.asgardeoId });
        isTypingRef.current = false;
      }
      clearTimeout(typingTimeoutRef.current);
    }
    setContent("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleChange = (e) => {
    setContent(e.target.value);
    if (!socket || !selectedUser || isRoom) return;
    if (!isTypingRef.current) {
      socket.emit("typing_start", { recipientId: selectedUser.asgardeoId });
      isTypingRef.current = true;
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", { recipientId: selectedUser.asgardeoId });
      isTypingRef.current = false;
    }, 3000);
  };

  const triggerFileInput = (accept) => {
    fileAcceptRef.current = accept;
    fileInputRef.current.accept = accept;
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !socket || (!selectedUser && !selectedRoom)) return;
    try {
      setUploading(true);
      const token = await getAccessToken();
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) { alert("Upload failed"); return; }
      const { url, type, name } = await res.json();
      const payload = { content: url, type, fileName: name };
      if (isRoom) socket.emit("room_message", { roomId: selectedRoom._id, ...payload });
      else socket.emit("private_message", { recipientId: selectedUser.asgardeoId, ...payload });
    } catch (e) {
      console.error("Upload error:", e);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmoji) return;
    const handler = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEmoji]);

  useEffect(() => () => clearTimeout(typingTimeoutRef.current), []);

  const placeholder = isRoom
    ? `Message ${selectedRoom?.name}…`
    : `Message ${selectedUser?.username?.split(" ")[0] ?? "…"}…`;

  return (
    <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-border bg-card relative">
      {/* Emoji picker */}
      {showEmoji && (
        <div ref={emojiPickerRef} className="absolute bottom-[calc(100%+8px)] left-4 z-50 shadow-2xl">
          <EmojiPicker
            onEmojiClick={(d) => { setContent((p) => p + d.emoji); setShowEmoji(false); }}
            height={350}
            width={300}
            theme="dark"
          />
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="bg-elevated rounded-2xl border border-border overflow-visible relative">
        <div className="flex items-end gap-2 px-3 py-2">
          {/* Attach */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-xl leading-none mb-0.5"
                title="Attach"
                disabled={uploading}
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-lime border-t-transparent rounded-full animate-spin" />
                ) : "＋"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-48">
              {ATTACH_OPTIONS.map(({ icon: Icon, label, accept }) => (
                <DropdownMenuItem key={label} onClick={() => triggerFileInput(accept)}>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  {label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem>
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Location
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground/50 leading-relaxed py-1.5 max-h-28 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          />

          {/* Right actions */}
          <div className="flex items-center gap-1 flex-shrink-0 mb-0.5">
            <button
              onClick={() => setShowEmoji((p) => !p)}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
                showEmoji
                  ? "text-lime bg-lime/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title="Emoji"
            >
              <Smile className="w-4 h-4" />
            </button>
            <button
              onClick={sendMessage}
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                content.trim()
                  ? "bg-lime text-primary-foreground hover:opacity-90 hover:-translate-y-0.5"
                  : "bg-muted text-muted-foreground cursor-default"
              )}
              title="Send"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
