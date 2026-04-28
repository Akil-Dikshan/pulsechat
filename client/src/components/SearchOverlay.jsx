import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

function nameHue(name = "") {
  return Math.abs(name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 360;
}

export default function SearchOverlay({ onClose, onSelectUser }) {
  const { getAccessToken } = useAuthContext();
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    let cancelled = false;
    const search = async () => {
      try {
        setLoading(true);
        const token = await getAccessToken();
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/search?q=${query}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!cancelled) setResults(await res.json());
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const t = setTimeout(search, 200);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-5 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl animate-slide-up">
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages, contacts…"
              className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
            <kbd
              onClick={onClose}
              className="px-2 py-0.5 rounded-md bg-elevated border border-border text-muted-foreground text-[11px] cursor-pointer"
            >
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="flex justify-center py-8">
                <div className="w-4 h-4 border-2 border-lime border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No results for &quot;{query}&quot;
              </p>
            )}

            {results.map((user) => {
              const hue = nameHue(user.username);
              return (
                <button
                  key={user._id}
                  onClick={() => onSelectUser(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-[#111] flex-shrink-0"
                    style={{ background: `hsl(${hue} 70% 55%)` }}
                  >
                    {user.username[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </button>
              );
            })}

            {/* Empty prompt */}
            {!query && (
              <div className="px-4 py-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-3">
                  Start typing to search
                </p>
                <p className="text-sm text-muted-foreground/60">
                  Search for any user by name or email
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
