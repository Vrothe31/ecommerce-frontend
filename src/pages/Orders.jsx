import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'
import { useWebSocket } from '../hooks/useWebSocket'

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const TIMELINE = ['PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']
const stepLabel = (s) => s.replace(/_/g, ' ')

function StatusTimeline({ status }) {
  if (status === 'CANCELLED') {
    return <p className="text-sm text-red-600 font-medium">This order was cancelled</p>
  }
  const current = TIMELINE.indexOf(status)
  return (
    <div className="flex items-center">
      {TIMELINE.map((step, i) => {
        const done = i <= current
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${done ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <span className={`mt-1 text-[10px] text-center ${done ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                {stepLabel(step)}
              </span>
            </div>
            {i < TIMELINE.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 ${i < current ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function Orders() {
  const user = useAuthStore(s => s.user)
  const [orders, setOrders] = useState([])

  const fetchOrders = useCallback(() => {
    api.get('/orders').then(res => setOrders(res.data))
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  useWebSocket({ onOrderUpdate: fetchOrders })

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
                  {stepLabel(order.status)}
                </span>
              </div>

              <div className="mb-5">
                <StatusTimeline status={order.status} />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4 text-sm">
                {order.estimatedDeliveryDate && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">
                      {order.status === 'DELIVERED' ? 'Delivered on' : 'Expected delivery'}
                    </p>
                    <p className="font-semibold text-blue-700">
                      {new Date(order.estimatedDeliveryDate).toLocaleDateString(undefined, {
                        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs">Delivery partner</p>
                  {order.deliveryAgentName ? (
                    <p className="font-semibold">
                      {order.deliveryAgentName}
                      {order.deliveryAgentPhone && (
                        <span className="text-gray-400 font-normal"> · {order.deliveryAgentPhone}</span>
                      )}
                    </p>
                  ) : (
                    <p className="text-gray-400">Not assigned yet</p>
                  )}
                </div>
              </div>

              {order.deliveryAddress && (
                <div className="text-sm text-gray-600 mb-4">
                  <p className="text-gray-500 text-xs mb-1">Shipping to</p>
                  <p className="font-medium">{order.deliveryAddress.fullName} · {order.deliveryAddress.phone}</p>
                  <p>
                    {order.deliveryAddress.line1}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                  </p>
                </div>
              )}

              <div className="border-t pt-3">
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
