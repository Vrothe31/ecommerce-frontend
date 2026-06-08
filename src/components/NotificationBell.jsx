import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'
import { useWebSocket } from '../hooks/useWebSocket'

export default function NotificationBell() {
  const user = useAuthStore(s => s.user)
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  const fetchNotifications = () => {
    if (!user) return
    api.get('/notifications/unread-count').then(r => setCount(r.data.count))
    api.get('/notifications').then(r => setNotifications(r.data.slice(0, 10)))
  }

  useEffect(() => { fetchNotifications() }, [user])

  useWebSocket(null, null, fetchNotifications)

  if (!user) return null

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`)
    fetchNotifications()
  }

  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); fetchNotifications() }}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {count > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b dark:border-gray-700 font-semibold text-sm dark:text-white">Notifications</div>
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-gray-400 text-center">No notifications</p>
          ) : notifications.map(n => (
            <div key={n.id} onClick={() => markRead(n.id)}
              className={`p-3 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${!n.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
              <p className="text-sm font-medium dark:text-white">{n.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
