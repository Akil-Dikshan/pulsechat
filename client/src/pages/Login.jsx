import { useAuthContext } from '@asgardeo/auth-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const { state, signIn } = useAuthContext()
  const navigate = useNavigate()

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/dashboard')
    }
  }, [state.isAuthenticated])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-lg border border-border bg-card shadow-sm">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">PulseChat</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to start chatting
          </p>
        </div>

        <button
          onClick={() => signIn()}
          className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
        >
          Sign In with Asgardeo
        </button>

      </div>
    </div>
  )
}

export default Login