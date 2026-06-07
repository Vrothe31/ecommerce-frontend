import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'
import { useWebSocket } from '../hooks/useWebSocket'

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function Orders() {
  const user = useAuthStore(s => s.user)
  const [orders, setOrders] = useState([])

  const fetchOrders = () => {
    api.get('/orders').then(res => setOrders(res.data))
  }

  useEffect(() => { fetchOrders() }, [])

  useWebSocket(() => fetchOrders())

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">Please login to view orders</p>
        <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live Updates
        </span>
      </div>

      {orders.length === 0 ? (
        <p className="text-center text-gray-400 py-20">No orders yet</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border rounded-xl p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span>{item.productName} × {item.quantity}</span>
                  <span>₹{(Number(item.price) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-blue-600">₹{Number(order.totalAmount).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
