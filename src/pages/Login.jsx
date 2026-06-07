import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      login(res.data)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-2">Login</h1>
      <p className="text-center text-gray-400 text-sm mb-8">Welcome back to ShopZone</p>

      <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-8 space-y-5">
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-gray-500">
        Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
      </p>

      <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-500">
        <p className="font-semibold mb-1">Demo Accounts:</p>
        <p>User: user@shopzone.com / user123</p>
        <p>Admin: admin@shopzone.com / admin123</p>
      </div>
    </div>
  )
}
