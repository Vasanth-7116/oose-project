import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute'
import RequireUserRoute from './components/RequireUserRoute'
import AdminAdd from './pages/AdminAdd'
import AdminLogin from './pages/AdminLogin'
import AdminManage from './pages/AdminManage'
import AdminOrders from './pages/AdminOrders'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Home from './pages/Home'
import Login from './pages/Login'
import Orders from './pages/Orders'
import ProductDetails from './pages/ProductDetails'
import Products from './pages/Products'
import Profile from './pages/Profile'
import Register from './pages/Register'
import ShoppingAssistant from './components/ShoppingAssistant'
import { getStoredUser } from './lib/auth'

const CART_STORAGE_KEY = 'my-ecommerce-cart'

function App() {
  const [user, setUser] = useState(() => getStoredUser())
  const isAdmin = user?.role === 'admin'
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)

    if (!savedCart) {
      return []
    }

    try {
      const parsedCart = JSON.parse(savedCart)

      return Array.isArray(parsedCart)
        ? parsedCart.map((item) => ({
            ...item,
            quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
          }))
        : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  const handleAddToCart = (product) => {
    if (user?.role === 'admin') {
      return
    }

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id)

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, product.stock || item.quantity + 1),
              }
            : item,
        )
      }

      return [
        ...currentItems,
        {
          ...product,
          quantity: 1,
        },
      ]
    })
  }

  const handleRemoveFromCart = (indexToRemove) => {
    setCartItems((currentItems) =>
      currentItems.filter((_, index) => index !== indexToRemove),
    )
  }

  const handleClearCart = () => {
    setCartItems([])
  }

  const handleUpdateQuantity = (productId, nextQuantity) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item.id !== productId) {
            return item
          }

          const boundedQuantity = Math.max(0, Math.min(nextQuantity, item.stock || nextQuantity))

          return {
            ...item,
            quantity: boundedQuantity,
          }
        })
        .filter((item) => item.quantity > 0),
    )
  }

  const handleAuthSuccess = ({ token, user }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    if (user?.role === 'admin') {
      setCartItems([])
    }
  }

  const handleProfileUpdate = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-transparent">
      <nav className="sticky top-0 z-50 border-b border-white/60 bg-slate-50/85 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="text-xl font-black tracking-tight text-slate-950 transition hover:text-slate-700"
          >
            ShopEase
          </Link>

          <div className="hidden items-center gap-3 rounded-full border border-slate-200/80 bg-white/80 px-3 py-2 text-sm font-medium text-slate-600 shadow-sm md:flex">
            <Link
              to="/"
              className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Products
            </Link>
            {!isAdmin ? (
              <Link
                to="/cart"
                className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Cart ({cartItems.reduce((total, item) => total + item.quantity, 0)})
              </Link>
            ) : null}
            {user && !isAdmin ? (
              <Link
                to="/profile"
                className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Profile
              </Link>
            ) : null}
            {user && !isAdmin ? (
              <Link
                to="/orders"
                className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Orders
              </Link>
            ) : null}
            {user?.role === 'admin' ? (
              <Link
                to="/admin/add"
                className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Add Products
              </Link>
            ) : null}
            {user?.role === 'admin' ? (
              <Link
                to="/admin/orders"
                className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Verify Orders
              </Link>
            ) : null}
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 sm:inline-flex">
                {user.name} ({user.role})
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5 hover:bg-rose-400"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:-translate-y-0.5 hover:bg-sky-500"
              >
                User Login
              </Link>
              <Link
                to="/admin/login"
                className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-900"
              >
                Admin
              </Link>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200/70 px-4 py-3 md:hidden">
          <div className="flex items-center justify-center gap-2 rounded-full bg-white/80 p-1 text-sm font-medium text-slate-600 shadow-sm">
            <Link
              to="/"
              className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Products
            </Link>
            {!isAdmin ? (
              <Link
                to="/cart"
                className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Cart ({cartItems.reduce((total, item) => total + item.quantity, 0)})
              </Link>
            ) : null}
            {user && !isAdmin ? (
              <Link
                to="/profile"
                className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Profile
              </Link>
            ) : null}
            {user && !isAdmin ? (
              <Link
                to="/orders"
                className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Orders
              </Link>
            ) : null}
            {user?.role === 'admin' ? (
              <Link
                to="/admin/add"
                className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Add Products
              </Link>
            ) : null}
            {user?.role === 'admin' ? (
              <Link
                to="/admin/orders"
                className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Verify Orders
              </Link>
            ) : null}
          </div>
          {user ? (
            <div className="mt-3 flex items-center justify-center gap-3">
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs font-medium text-slate-700">
                {user.name} ({user.role})
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-400"
              >
                Sign Out
              </button>
            </div>
          ) : null}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/products"
          element={<Products onAddToCart={handleAddToCart} canAddToCart={!isAdmin} />}
        />
        <Route
          path="/products/:id"
          element={<ProductDetails onAddToCart={handleAddToCart} canAddToCart={!isAdmin} />}
        />
        <Route
          path="/cart"
          element={
            isAdmin ? (
              <Navigate to="/admin/add" replace />
            ) : (
              <Cart
                cartItems={cartItems}
                onClearCart={handleClearCart}
                onRemoveFromCart={handleRemoveFromCart}
                onUpdateQuantity={handleUpdateQuantity}
              />
            )
          }
        />
        <Route
          path="/checkout"
          element={
            <RequireUserRoute>
              <Checkout
                cartItems={cartItems}
                onOrderPlaced={handleClearCart}
              />
            </RequireUserRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireUserRoute>
              <Orders />
            </RequireUserRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireUserRoute>
              <Profile onProfileUpdate={handleProfileUpdate} />
            </RequireUserRoute>
          }
        />
        <Route
          path="/login"
          element={<Login onAuthSuccess={handleAuthSuccess} />}
        />
        <Route
          path="/admin/login"
          element={<AdminLogin onAuthSuccess={handleAuthSuccess} />}
        />
        <Route
          path="/register"
          element={<Register onAuthSuccess={handleAuthSuccess} />}
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Navigate to="/admin/add" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add"
          element={
            <ProtectedRoute>
              <AdminAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage"
          element={
            <ProtectedRoute>
              <AdminManage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isAdmin ? (
        <ShoppingAssistant
          onAddToCart={handleAddToCart}
          canAddToCart={!isAdmin}
        />
      ) : null}
    </div>
  )
}

export default App
