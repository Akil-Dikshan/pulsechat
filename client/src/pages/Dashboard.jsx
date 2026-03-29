import { useEffect, useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";

function Dashboard() {
  const { state, signOut, getAccessToken } = useAuthContext();
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const syncUser = async () => {
      try {
        const token = await getAccessToken();
        await fetch(`${import.meta.env.VITE_API_URL}/api/users/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        });
      } catch (error) {
        console.error("User sync failed:", error);
      }
    };

    if (state.isAuthenticated) {
      syncUser();
    }
  }, [state.isAuthenticated]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
        <h1 className="text-xl font-bold">PulseChat</h1>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground text-sm">
            {state.username}
          </span>
          <button
            onClick={() => signOut()}
            className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md text-sm hover:opacity-90 transition-opacity"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <ConversationList
          onSelectUser={setSelectedUser}
          selectedUser={selectedUser}
        />
        <ChatWindow selectedUser={selectedUser} />
      </div>
    </div>
  );
}

export default Dashboard;