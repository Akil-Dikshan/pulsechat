import { useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";

function RoomModal({ onClose, onRoomCreated }) {
  const { getAccessToken } = useAuthContext();
  const [roomName, setRoomName] = useState("");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [creating, setCreating] = useState(false);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      const token = await getAccessToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/search?q=${value}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: roomName.trim(),
          participantIds: selectedUsers.map((u) => u._id),
        }),
      });

      const room = await res.json();
      onRoomCreated(room);
      onClose();
    } catch (error) {
      console.error("Create room error:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">New Group Chat</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <input
          type="text"
          placeholder="Group name..."
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring mb-3"
        />

        <input
          type="text"
          placeholder="Search users to add..."
          value={query}
          onChange={handleSearch}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring mb-3"
        />

        {/* Selected users */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedUsers.map((user) => (
              <span
                key={user._id}
                onClick={() => toggleUser(user)}
                className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full cursor-pointer hover:opacity-80"
              >
                {user.username} ✕
              </span>
            ))}
          </div>
        )}

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="border border-border rounded-md overflow-hidden mb-4">
            {searchResults.map((user) => {
              const isSelected = selectedUsers.find((u) => u._id === user._id);
              return (
                <button
                  key={user._id}
                  onClick={() => toggleUser(user)}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-accent transition-colors ${
                    isSelected ? "bg-accent" : ""
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs flex-shrink-0">
                    {user.username[0].toUpperCase()}
                  </div>
                  {user.username}
                  {isSelected && <span className="ml-auto text-primary">✓</span>}
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={!roomName.trim() || selectedUsers.length === 0 || creating}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? "Creating..." : "Create Group"}
        </button>
      </div>
    </div>
  );
}

export default RoomModal;