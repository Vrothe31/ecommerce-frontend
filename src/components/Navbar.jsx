import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import DarkModeToggle from './DarkModeToggle'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const count = useCartStore(s => s.getCount())
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-600">ShopZone</Link>

        <div className="flex items-center gap-4">
          <Link to="/products" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition text-sm">Products</Link>
          {user && (
            <>
              <Link to="/wishlist" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition text-sm">Wishlist</Link>
              <Link to="/orders" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition text-sm">Orders</Link>
              <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition text-sm">Profile</Link>
            </>
          )}
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition text-sm">Admin</Link>
          )}

          <DarkModeToggle />
          <NotificationBell />

          <Link to="/cart" className="relative text-gray-600 dark:text-gray-300 hover:text-blue-600 transition">
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
              {user.avatarUrl && (
                <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Hi, {user.name}</span>
              <button onClick={handleLogout}
                className="text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition dark:text-gray-300">
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
