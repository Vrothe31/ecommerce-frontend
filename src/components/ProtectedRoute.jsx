import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const user = useAuthStore(s => s.user)

  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" replace />

  return children
}
