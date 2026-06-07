import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'

export default function Navbar() {
  const count = useCartStore(s => s.getCount())
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-600">ShopZone</Link>

        <div className="flex items-center gap-6">
          <Link to="/products" className="text-gray-600 hover:text-blue-600 transition">Products</Link>
          {user && <Link to="/orders" className="text-gray-600 hover:text-blue-600 transition">Orders</Link>}
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="text-gray-600 hover:text-blue-600 transition">Admin</Link>
          )}

          <Link to="/cart" className="relative text-gray-600 hover:text-blue-600 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-6-9v9" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Hi, {user.name}</span>
              <button onClick={handleLogout}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login"
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
