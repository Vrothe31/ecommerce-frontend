import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useWebSocket } from '../hooks/useWebSocket'
import { motion } from 'framer-motion'

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PACKED: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  RETURNED: 'bg-gray-100 text-gray-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
}

export default function Orders() {
  const [orders, setOrders] = useState([])

  const fetchOrders = () => api.get('/orders').then(res => setOrders(res.data))

  useEffect(() => { fetchOrders() }, [])
  useWebSocket(null, fetchOrders)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-center text-gray-400 py-20">No orders yet</p>
      ) : orders.map((order, i) => (
        <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 mb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Link to={`/orders/${order.id}`} className="font-semibold text-blue-600 hover:underline">
                Order #{order.id}
              </Link>
              <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
              {order.status}
            </span>
          </div>
          {order.items?.map(item => (
            <div key={item.productId} className="flex justify-between text-sm py-1 dark:text-gray-300">
              <span>{item.productName} × {item.quantity}</span>
              <span>₹{(Number(item.price) * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between items-center mt-4 pt-4 border-t dark:border-gray-700">
            <span className="font-bold dark:text-white">₹{Number(order.totalAmount).toLocaleString()}</span>
            <Link to={`/orders/${order.id}`}
              className="text-sm text-blue-600 hover:underline">View Details →</Link>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
