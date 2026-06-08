import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import OrderTimeline from '../components/OrderTimeline'
import { useWebSocket } from '../hooks/useWebSocket'
import toast from 'react-hot-toast'

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)

  const fetchOrder = () => api.get(`/orders/${id}`).then(res => setOrder(res.data))

  useEffect(() => { fetchOrder() }, [id])
  useWebSocket(null, fetchOrder)

  const cancelOrder = async () => {
    try {
      await api.post(`/orders/${id}/cancel`)
      toast.success('Order cancelled')
      fetchOrder()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cancel failed')
    }
  }

  const returnOrder = async () => {
    try {
      await api.post(`/orders/${id}/return`)
      toast.success('Return initiated')
      fetchOrder()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Return failed')
    }
  }

  const downloadInvoice = async () => {
    const res = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${id}.pdf`
    a.click()
  }

  if (!order) return <p className="text-center py-20 text-gray-400">Loading...</p>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/orders')} className="text-blue-600 text-sm mb-4 hover:underline">Back to Orders</button>
      <h1 className="text-3xl font-bold mb-2 dark:text-white">Order #{order.id}</h1>
      <p className="text-gray-400 text-sm mb-8">{new Date(order.createdAt).toLocaleString()}</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6">
          <h2 className="font-semibold mb-4 dark:text-white">Tracking</h2>
          <OrderTimeline status={order.status} />
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6">
            <h2 className="font-semibold mb-3 dark:text-white">Shipping</h2>
            <p className="text-sm dark:text-gray-300">{order.shippingName}</p>
            <p className="text-sm dark:text-gray-300">{order.shippingAddress}</p>
            <p className="text-sm dark:text-gray-300">{order.shippingCity}, {order.shippingState} - {order.shippingPincode}</p>
            <p className="text-sm dark:text-gray-300">{order.shippingPhone}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6">
            <h2 className="font-semibold mb-3 dark:text-white">Payment</h2>
            <p className="text-sm dark:text-gray-300">{order.paymentMethod} - {order.paymentStatus}</p>
            {order.couponCode && <p className="text-sm text-green-600">Coupon: {order.couponCode} (-Rs.{order.discountAmount})</p>}
            <p className="text-xl font-bold mt-2 dark:text-white">Rs.{Number(order.totalAmount).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 mt-6">
        <h2 className="font-semibold mb-4 dark:text-white">Items</h2>
        {order.items?.map(item => (
          <div key={item.productId} className="flex justify-between py-2 border-b dark:border-gray-700 last:border-0 text-sm dark:text-gray-300">
            <span>{item.productName} x {item.quantity}</span>
            <span>Rs.{(Number(item.price) * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6 flex-wrap">
        <button onClick={downloadInvoice}
          className="px-4 py-2 border dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
          Download Invoice
        </button>
        {['PENDING', 'CONFIRMED', 'PACKED'].includes(order.status) && (
          <button onClick={cancelOrder}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
            Cancel Order
          </button>
        )}
        {order.status === 'DELIVERED' && (
          <button onClick={returnOrder}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">
            Return Order
          </button>
        )}
      </div>
    </div>
  )
}
