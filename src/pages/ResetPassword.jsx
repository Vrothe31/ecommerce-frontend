import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const token = params.get('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, newPassword: password })
      toast.success('Password reset successful')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  if (!token) return <p className="text-center py-20 text-red-500">Invalid reset link</p>

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-8 dark:text-white">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
          placeholder="New password"
          className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-400 mt-4">
        <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
      </p>
    </div>
  )
}
