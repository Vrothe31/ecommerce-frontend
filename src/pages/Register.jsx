import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [otp, setOtp] = useState('')
  const [showOtp, setShowOtp] = useState(false)
  const [loading, setLoading] = useState(false)
  const login = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/register', form)
      login(res.data)
      toast.success('Account created! Check email for OTP.')
      setShowOtp(true)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    try {
      await api.post('/auth/verify-otp', { email: form.email, otp })
      toast.success('Email verified!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'OTP verification failed')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-2 dark:text-white">Create Account</h1>
      <p className="text-gray-400 text-sm mb-8">Join ShopZone today</p>

      {!showOtp ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
            placeholder="Full Name" className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
            placeholder="Email" className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6}
            placeholder="Password (min 6 chars)" className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">Enter the OTP sent to your email (check backend console in dev mode)</p>
          <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit OTP"
            className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-3" />
          <button onClick={verifyOtp} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">Verify OTP</button>
        </div>
      )}

      <p className="text-center text-sm text-gray-400 mt-6">
        Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
      </p>
    </div>
  )
}
