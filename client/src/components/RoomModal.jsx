import { useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { Users, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

function nameHue(name = "") {
  return Math.abs(name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 360;
}

export default function RoomModal({ onClose, onRoomCreated }) {
  const { getAccessToken } = useAuthContext();
  const [roomName, setRoomName]         = useState("");
  const [query, setQuery]               = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [creating, setCreating]         = useState(false);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (!value.trim()) { setSearchResults([]); return; }
    try {
      const token = await getAccessToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/search?q=${value}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSearchResults(await res.json());
    } catch (e) {
      console.error("Search error:", e);
    }
  };

  const toggleUser = (user) => {
    setSelectedUsers((prev) =>
      prev.find((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    );
  };

  const handleCreate = async () => {
    if (!roomName.trim() || selectedUsers.length === 0) return;
    try {
      setCreating(true);
      const token = await getAccessToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: roomName.trim(),
          participantIds: selectedUsers.map((u) => u._id),
        }),
      });
      onRoomCreated(await res.json());
      onClose();
    } catch (e) {
      console.error("Create room error:", e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-lime/15 flex items-center justify-center">
              <Users className="w-4 h-4 text-lime" />
            </div>
            New Group Chat
          </DialogTitle>
          <DialogDescription>Give your group a name and add at least one member.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Group name */}
          <div>
            <Label className="mb-1.5 block">Group name</Label>
            <Input
              placeholder="e.g. Design Team"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>

          {/* Search users */}
          <div>
            <Label className="mb-1.5 block">Add members</Label>
            <Input
              placeholder="Search by name or email…"
              value={query}
              onChange={handleSearch}
            />
          </div>

          {/* Selected users chips */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedUsers.map((user) => (
                <span
                  key={user._id}
                  className="inline-flex items-center gap-1 bg-lime/15 text-lime border border-lime/30 text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer hover:bg-lime/20 transition-colors"
                  onClick={() => toggleUser(user)}
                >
                  {user.username}
                  <X className="w-3 h-3" />
                </span>
              ))}
            </div>
          )}

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="rounded-xl border border-border overflow-hidden">
              {searchResults.map((user) => {
                const selected = !!selectedUsers.find((u) => u._id === user._id);
                const hue = nameHue(user.username);
                return (
                  <button
                    key={user._id}
                    onClick={() => toggleUser(user)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                      selected ? "bg-lime/10" : "hover:bg-muted"
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[#111] flex-shrink-0"
                      style={{ background: `hsl(${hue} 70% 55%)` }}
                    >
                      {user.username[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {selected && <Check className="w-4 h-4 text-lime flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          <Button
            onClick={handleCreate}
            disabled={!roomName.trim() || selectedUsers.length === 0 || creating}
            className="w-full mt-1"
          >
            {creating ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
            ) : "Create group"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
