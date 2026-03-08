import { useAuthContext } from '@asgardeo/auth-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Callback() {
  const { state } = useAuthContext()
  const navigate = useNavigate()

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/dashboard')
    }
  }, [state.isAuthenticated])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-foreground text-lg">Signing you in...</p>
    </div>
  )
}

export default Callback