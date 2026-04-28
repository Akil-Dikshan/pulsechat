import { useEffect, useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import SearchOverlay from "../components/SearchOverlay";

export default function Dashboard() {
  const { state, getAccessToken } = useAuthContext();
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  // Sync user & get their profile
  useEffect(() => {
    const syncUser = async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({}),
        });
        setCurrentUser(await res.json());
      } catch (e) {
        console.error("User sync failed:", e);
      }
    };
    if (state.isAuthenticated) syncUser();
  }, [state.isAuthenticated]);

  // Global keyboard shortcut: Ctrl/Cmd+K → search
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSelectUser = (user) => { setSelectedUser(user); setSelectedRoom(null); };
  const handleSelectRoom = (room) => { setSelectedRoom(room); setSelectedUser(null); };

  return (
    <div className="h-screen bg-background text-foreground flex overflow-hidden">
      <ConversationList
        onSelectUser={handleSelectUser}
        onSelectRoom={handleSelectRoom}
        selectedUser={selectedUser}
        selectedRoom={selectedRoom}
        currentUser={currentUser}
        onOpenSearch={() => setShowSearch(true)}
      />

      <ChatWindow
        selectedUser={selectedUser}
        selectedRoom={selectedRoom}
      />

      {showSearch && (
        <SearchOverlay
          onClose={() => setShowSearch(false)}
          onSelectUser={(u) => { handleSelectUser(u); setShowSearch(false); }}
        />
      )}
    </div>
  );
}
