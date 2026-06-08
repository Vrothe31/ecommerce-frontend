import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      toast.success('Reset link sent to your email')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-2 dark:text-white">Forgot Password</h1>
      <p className="text-gray-400 text-sm mb-8">Enter your email to receive a reset link</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
          placeholder="Email address"
          className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-400 mt-4">
        <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
      </p>
    </div>
  )
}
