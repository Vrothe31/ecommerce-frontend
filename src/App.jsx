import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import Wishlist from './pages/Wishlist'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailure from './pages/PaymentFailure'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
