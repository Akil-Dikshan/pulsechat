import { useState, useEffect } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { useSocket } from "../context/SocketContext";
import RoomModal from "./RoomModal";

function ConversationList({ onSelectUser, onSelectRoom, selectedUser, selectedRoom }) {
  const { getAccessToken } = useAuthContext();
  const { socket } = useSocket();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setRooms(data);
      } catch (error) {
        console.error("Failed to load rooms:", error);
      }
    };
    loadRooms();
  }, []);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim() === "") { setResults([]); return; }
    try {
      setSearching(true);
      const token = await getAccessToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/search?q=${value}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (user) => {
    onSelectUser(user);
    setQuery("");
    setResults([]);
  };

  const handleRoomCreated = (room) => {
    setRooms((prev) => [room, ...prev]);
    onSelectRoom(room);
    if (socket) {
      socket.emit("join_room", { roomId: room._id });
    }
  };

  return (
    <div className="w-80 border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Messages</h2>
          <button
            onClick={() => setShowRoomModal(true)}
            className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-md hover:opacity-90 transition-opacity"
          >
            + Group
          </button>
        </div>
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={handleSearch}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {searching && (
          <p className="text-sm text-muted-foreground px-4 py-2">Searching...</p>
        )}

        {results.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground px-4 py-2 uppercase tracking-wide">Search Results</p>
            {results.map((user) => (
              <button
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors text-left ${selectedUser?._id === user._id ? "bg-accent" : ""}`}
              >
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium flex-shrink-0">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.username}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {query && !searching && results.length === 0 && (
          <p className="text-sm text-muted-foreground px-4 py-2">No users found.</p>
        )}

        {rooms.length > 0 && !query && (
          <div>
            <p className="text-xs text-muted-foreground px-4 py-2 uppercase tracking-wide">Groups</p>
            {rooms.map((room) => (
              <button
                key={room._id}
                onClick={() => onSelectRoom(room)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors text-left ${selectedRoom?._id === room._id ? "bg-accent" : ""}`}
              >
                <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  {room.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{room.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{room.participants.length} members</p>
                </div>
              </button>
            ))}
          </div>
        )}
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

export default ConversationList;