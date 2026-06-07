import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'
import { useWebSocket } from '../hooks/useWebSocket'
import toast from 'react-hot-toast'

const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function Admin() {
  const user = useAuthStore(s => s.user)
  const [orders, setOrders] = useState([])

  const fetchOrders = () => {
    api.get('/admin/orders').then(res => setOrders(res.data))
  }

  useEffect(() => { fetchOrders() }, [])
  useWebSocket(() => fetchOrders())

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status })
      toast.success(`Order #${orderId} → ${status}`)
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed')
    }
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">Admin access required</p>
        <Link to="/login" className="text-blue-600 hover:underline">Login as Admin</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-400 text-sm mb-8">Manage orders in real-time</p>

      <div className="overflow-x-auto">
        <table className="w-full border rounded-xl overflow-hidden bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Order ID</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Date</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Total</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-t">
                <td className="p-4 font-medium">#{order.id}</td>
                <td className="p-4 text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="p-4">₹{Number(order.totalAmount).toLocaleString()}</td>
                <td className="p-4">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {order.status}
                  </span>
                </td>
                <td className="p-4">
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order.id, e.target.value)}
                    className="border rounded-lg px-2 py-1 text-sm">
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
