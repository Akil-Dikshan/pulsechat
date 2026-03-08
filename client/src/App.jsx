import { useAuthContext } from "@asgardeo/auth-react"

function App() {
  const { state, signIn, signOut } = useAuthContext()
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">
          Hello hutto
        </h1>
        {state.isAuthenticated ? (
          <div>
            <p className="mb-4">Welcome, {state.username}</p>
            <button
              onClick={() => signOut()}
              className="bg-destructive text-destructive-foreground px-6 py-2 rounded-md"
            >
              Sign Out
            </button>
          </div>
        ) : <button
            onClick={() => signIn()}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-md"
          >
            Sign In
          </button>}
      </div>

    </div>
  )
}

export default App
