import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { getAuthConfig, getStoredUser } from '../lib/auth'

function Checkout({ cartItems, onOrderPlaced }) {
  const navigate = useNavigate()
  const user = getStoredUser()
  const savedAddresses = Array.isArray(user?.savedAddresses) ? user.savedAddresses : []
  const [formData, setFormData] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: '',
    paymentMethod: 'cod',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0),
    [cartItems],
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleUseSavedAddress = (address) => {
    setFormData((current) => ({
      ...current,
      fullName: address.fullName || '',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      postalCode: address.postalCode || '',
      country: address.country || '',
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')

      const response = await api.post(
        '/api/orders',
        {
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          shippingAddress: formData,
          paymentMethod: formData.paymentMethod,
        },
        getAuthConfig(),
      )

      onOrderPlaced?.()
      navigate('/orders', {
        replace: true,
        state: {
          successMessage:
            formData.paymentMethod === 'cod'
              ? `Order #${response.data.order.id} placed successfully.`
              : `Order #${response.data.order.id} placed successfully. Submit your payment confirmation from the orders page.`,
        },
      })
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Failed to place order.')
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-4xl rounded-[2rem] border border-white/70 bg-white/90 p-8 text-center shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
          <h1 className="text-3xl font-black text-slate-950">Your cart is empty</h1>
          <p className="mt-4 text-slate-600">
            Add a few products before heading to checkout.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:bg-sky-500"
          >
            Browse Products
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-6xl gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_28px_70px_rgba(15,23,42,0.08)]"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
            Checkout
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
            Delivery details
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Place the order with your current cart and track it later from your orders page.
          </p>

          {savedAddresses.length > 0 ? (
            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-900">Use a saved address</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {savedAddresses.map((address, index) => (
                  <button
                    key={`${address.label}-${index}`}
                    type="button"
                    onClick={() => handleUseSavedAddress(address)}
                    className="rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-white"
                  >
                    {address.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full name"
              required
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-slate-900 focus:bg-white sm:col-span-2"
            />
            <input
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              placeholder="Address line 1"
              required
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-slate-900 focus:bg-white sm:col-span-2"
            />
            <input
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              placeholder="Address line 2 (optional)"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-slate-900 focus:bg-white sm:col-span-2"
            />
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              required
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-slate-900 focus:bg-white"
            />
            <input
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="Postal code"
              required
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-slate-900 focus:bg-white"
            />
            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Country"
              required
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-slate-900 focus:bg-white sm:col-span-2"
            />
            <div className="sm:col-span-2">
              <p className="mb-2 text-sm font-medium text-slate-700">Payment method</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { value: 'cod', label: 'Cash on Delivery' },
                  { value: 'card', label: 'Card Payment' },
                  { value: 'upi', label: 'UPI' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      formData.paymentMethod === option.value
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.value}
                      checked={formData.paymentMethod === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {error ? (
            <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-full bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Placing order...' : 'Place Order'}
            </button>
            <Link
              to="/cart"
              className="inline-flex justify-center rounded-full border border-slate-300 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              Back to Cart
            </Link>
          </div>
        </form>

        <aside className="h-fit rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
          <h2 className="text-xl font-bold text-slate-950">Order summary</h2>
          <div className="mt-5 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-slate-500">Qty {item.quantity}</p>
                </div>
                <span className="font-semibold text-slate-800">
                  ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-slate-200 pt-4 text-base font-semibold text-slate-950">
            Total: ${subtotal.toFixed(2)}
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Payment: {formData.paymentMethod === 'cod' ? 'Cash on Delivery' : formData.paymentMethod.toUpperCase()}
          </p>
        </aside>
      </section>
    </main>
  )
}

export default Checkout
