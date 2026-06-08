import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../api/axios'
import { useWebSocket } from '../hooks/useWebSocket'
import toast from 'react-hot-toast'

const STATUSES = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED']

export default function Admin() {
  const [tab, setTab] = useState('dashboard')
  const [analytics, setAnalytics] = useState(null)
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: ''
  })

  const fetchAll = () => {
    api.get('/admin/analytics').then(res => setAnalytics(res.data)).catch(() => {})
    api.get('/admin/orders').then(res => setOrders(res.data))
    api.get('/products', { params: { page: 0, size: 50 } }).then(res => {
      setProducts(res.data.content || res.data)
    })
    api.get('/categories').then(res => setCategories(res.data))
  }

  useEffect(() => { fetchAll() }, [])
  useWebSocket(null, fetchAll)

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status })
      toast.success(`Order #${orderId} → ${status}`)
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed')
    }
  }

  const refundOrder = async (orderId) => {
    try {
      await api.post(`/admin/orders/${orderId}/refund`)
      toast.success(`Refund processed for #${orderId}`)
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Refund failed')
    }
  }

  const createProduct = async (e) => {
    e.preventDefault()
    try {
      await api.post('/products', {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        categoryId: Number(productForm.categoryId),
      })
      toast.success('Product created')
      setProductForm({ name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: '' })
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create product')
    }
  }

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    await api.delete(`/products/${id}`)
    toast.success('Product deleted')
    fetchAll()
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'orders', label: 'Orders' },
    { id: 'products', label: 'Products' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 dark:text-white">Admin Dashboard</h1>
      <p className="text-gray-400 text-sm mb-6">Real-time analytics & management</p>

      <div className="flex gap-2 mb-8">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.id ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 dark:text-gray-300 border dark:border-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && analytics && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: analytics.totalUsers, color: 'blue' },
              { label: 'Total Orders', value: analytics.totalOrders, color: 'green' },
              { label: 'Revenue', value: `₹${Number(analytics.totalRevenue).toLocaleString()}`, color: 'purple' },
              { label: 'Top Products', value: analytics.topSellingProducts?.length || 0, color: 'orange' },
            ].map(card => (
              <div key={card.label} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-5">
                <p className="text-sm text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold mb-4 dark:text-white">Monthly Revenue</h3>
              {Object.entries(analytics.monthlyRevenue || {}).map(([month, rev]) => (
                <div key={month} className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-gray-400 w-16">{month}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full"
                      style={{ width: `${Math.min(100, Number(rev) / 1000)}%` }} />
                  </div>
                  <span className="text-xs dark:text-gray-300">₹{Number(rev).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold mb-4 dark:text-white">Orders by Status</h3>
              {Object.entries(analytics.ordersByStatus || {}).map(([status, count]) => (
                <div key={status} className="flex justify-between py-1.5 border-b dark:border-gray-700 last:border-0 text-sm">
                  <span className="dark:text-gray-300">{status}</span>
                  <span className="font-medium dark:text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6">
            <h3 className="font-semibold mb-4 dark:text-white">Top Selling Products</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {analytics.topSellingProducts?.map(p => (
                <div key={p.id} className="flex gap-3 items-center">
                  <img src={p.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-medium dark:text-white">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.soldCount} sold · ★ {p.averageRating}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'orders' && (
        <div className="overflow-x-auto">
          <table className="w-full border dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {['ID', 'Customer', 'Date', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left p-4 text-sm font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-t dark:border-gray-700">
                  <td className="p-4 font-medium dark:text-white">#{order.id}</td>
                  <td className="p-4 text-sm dark:text-gray-300">{order.userName || order.userEmail}</td>
                  <td className="p-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="p-4 dark:text-white">₹{Number(order.totalAmount).toLocaleString()}</td>
                  <td className="p-4 text-xs dark:text-gray-300">{order.paymentMethod} / {order.paymentStatus}</td>
                  <td className="p-4">
                    <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                      className="border dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg px-2 py-1 text-xs">
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-4">
                    {order.paymentStatus === 'SUCCESS' && order.status !== 'REFUNDED' && (
                      <button onClick={() => refundOrder(order.id)}
                        className="text-xs text-red-500 hover:underline">Refund</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'products' && (
        <div className="grid md:grid-cols-2 gap-8">
          <form onSubmit={createProduct} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 space-y-3">
            <h3 className="font-semibold dark:text-white">Add Product</h3>
            {['name', 'description', 'price', 'stock', 'imageUrl'].map(field => (
              <input key={field} value={productForm[field]}
                onChange={e => setProductForm(f => ({ ...f, [field]: e.target.value }))}
                placeholder={field} required={field !== 'description'}
                className="w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm" />
            ))}
            <select value={productForm.categoryId}
              onChange={e => setProductForm(f => ({ ...f, categoryId: e.target.value }))} required
              className="w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm">
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">
              Create Product
            </button>
          </form>

          <div className="space-y-3">
            {products.map(p => (
              <div key={p.id} className="flex items-center gap-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4">
                <img src={p.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-medium dark:text-white">{p.name}</p>
                  <p className="text-sm text-gray-400">₹{Number(p.price).toLocaleString()} · Stock: {p.stock}</p>
                </div>
                <button onClick={() => deleteProduct(p.id)} className="text-red-500 text-sm hover:underline">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
