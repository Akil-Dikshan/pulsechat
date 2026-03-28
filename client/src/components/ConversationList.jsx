import { useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";

function ConversationList({ onSelectUser, selectedUser }) {
  const { getAccessToken } = useAuthContext();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setResults([]);
      return;
    }

    try {
      setSearching(true);
      const token = await getAccessToken();

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/search?q=${value}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

  return (
    <div className="w-80 border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">Messages</h2>
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
          <p className="text-sm text-muted-foreground px-4 py-2">
            Searching...
          </p>
        )}

        {results.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground px-4 py-2 uppercase tracking-wide">
              Search Results
            </p>
            {results.map((user) => (
              <button
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors text-left ${
                  selectedUser?._id === user._id ? "bg-accent" : ""
                }`}
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
          <p className="text-sm text-muted-foreground px-4 py-2">
            No users found.
          </p>
        )}
      </div>
    </div>
  );
}

export default ConversationList;