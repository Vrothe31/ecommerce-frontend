import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'
import { useWebSocket } from '../hooks/useWebSocket'
import toast from 'react-hot-toast'

const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']
const label = (s) => s.replace(/_/g, ' ')

function AssignModal({ order, onClose, onAssigned }) {
  const [agentName, setAgentName] = useState(order.deliveryAgentName || '')
  const [agentPhone, setAgentPhone] = useState(order.deliveryAgentPhone || '')
  const [estimatedDeliveryDate, setEta] = useState(order.estimatedDeliveryDate || '')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!agentName.trim() || !agentPhone.trim()) {
      toast.error('Agent name and phone are required')
      return
    }
    setSaving(true)
    try {
      await api.patch(`/admin/orders/${order.id}/assign`, {
        agentName,
        agentPhone,
        estimatedDeliveryDate: estimatedDeliveryDate || null,
      })
      toast.success(`Order #${order.id} assigned to ${agentName}`)
      onAssigned()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Assign failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4">Assign Delivery — Order #{order.id}</h3>
        <div className="space-y-3">
          <input value={agentName} onChange={e => setAgentName(e.target.value)}
            placeholder="Delivery agent name"
            className="w-full border rounded-lg px-3 py-2 text-sm" />
          <input value={agentPhone} onChange={e => setAgentPhone(e.target.value)}
            placeholder="Agent phone"
            className="w-full border rounded-lg px-3 py-2 text-sm" />
          <div>
            <label className="text-xs text-gray-500">Estimated delivery date</label>
            <input type="date" value={estimatedDeliveryDate} onChange={e => setEta(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={submit} disabled={saving}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  const user = useAuthStore(s => s.user)
  const [orders, setOrders] = useState([])
  const [assigning, setAssigning] = useState(null)

  const fetchOrders = useCallback(() => {
    api.get('/admin/orders').then(res => setOrders(res.data))
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])
  useWebSocket({ onOrderUpdate: fetchOrders })

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status })
      toast.success(`Order #${orderId} → ${label(status)}`)
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
      <p className="text-gray-400 text-sm mb-8">Manage orders, assign delivery & set ETA in real-time</p>

      <div className="overflow-x-auto">
        <table className="w-full border rounded-xl overflow-hidden bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Order ID</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Customer</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Total</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">ETA</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Agent</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-t align-top">
                <td className="p-4 font-medium">
                  #{order.id}
                  <p className="text-xs text-gray-400 font-normal">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {order.deliveryAddress ? (
                    <>
                      <p className="font-medium">{order.deliveryAddress.fullName}</p>
                      <p className="text-xs text-gray-400">
                        {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                      </p>
                    </>
                  ) : <span className="text-gray-400">—</span>}
                </td>
                <td className="p-4">₹{Number(order.totalAmount).toLocaleString()}</td>
                <td className="p-4 text-sm">
                  {order.estimatedDeliveryDate
                    ? new Date(order.estimatedDeliveryDate).toLocaleDateString()
                    : <span className="text-gray-400">—</span>}
                </td>
                <td className="p-4 text-sm">
                  {order.deliveryAgentName
                    ? <span>{order.deliveryAgentName}</span>
                    : <span className="text-gray-400">Unassigned</span>}
                </td>
                <td className="p-4">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {label(order.status)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-2">
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      className="border rounded-lg px-2 py-1 text-sm">
                      {statuses.map(s => <option key={s} value={s}>{label(s)}</option>)}
                    </select>
                    <button onClick={() => setAssigning(order)}
                      className="text-xs bg-gray-900 text-white px-2 py-1 rounded-lg hover:bg-gray-700">
                      {order.deliveryAgentName ? 'Reassign' : 'Assign'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {assigning && (
        <AssignModal
          order={assigning}
          onClose={() => setAssigning(null)}
          onAssigned={fetchOrders}
        />
      )}
    </div>
  )
}
