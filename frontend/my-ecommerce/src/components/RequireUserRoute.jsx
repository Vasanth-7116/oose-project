import { Navigate } from 'react-router-dom'
import { getStoredUser } from '../lib/auth'

function RequireUserRoute({ children }) {
  const user = getStoredUser()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return children
}

export default RequireUserRoute
