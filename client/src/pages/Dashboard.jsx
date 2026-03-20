import { useEffect } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: { token: "Bearer 3ec25eb3-2334-38e5-a4ca-307ee2de6b3f" },
});
socket.on("connect", () => {
  console.log("Socket connected with auth:", socket.id);
});
socket.on("connect_error", (err) => {
  console.log("Connection error:", err.message);
});
function Dashboard() {
  const { state, signOut, getAccessToken } = useAuthContext();

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
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
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

      <main className="flex items-center justify-center h-[calc(100vh-65px)]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">
            Welcome back, {state.username}
          </h2>
          <p className="text-muted-foreground">
            Your conversations will appear here soon.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;