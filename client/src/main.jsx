import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from '@asgardeo/auth-react'
import App from './App'
import './index.css'
import { asgardeoConfig } from './config/asgardeo'

ReactDOM.createRoot(document.getElementById('root')).render(
  ///<React.StrictMode> which means every single component inside your app now has access to authentication
  <React.StrictMode>
    <AuthProvider config={asgardeoConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
)