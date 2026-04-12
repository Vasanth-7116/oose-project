import { useEffect, useState } from 'react'
import api from '../lib/api'
import { getAuthConfig } from '../lib/auth'

const paymentStatusOptions = [
  { value: 'pending', label: 'Payment Pending' },
  { value: 'confirmation_submitted', label: 'Confirmation Submitted' },
  { value: 'paid', label: 'Paid' },
]

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/orders', getAuthConfig())
      setOrders(Array.isArray(response.data) ? response.data : [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleOrderChange = async (orderId, updates) => {
    try {
      setError('')
      setSuccess('')
      const response = await api.put(`/api/admin/orders/${orderId}`, updates, getAuthConfig())
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? response.data.order : order)),
      )
      setSuccess(`Order #${orderId} updated successfully.`)
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Failed to update order.')
    }
  }

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
              Admin
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              Verify orders
            </h1>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
          >
            Refresh
          </button>
        </div>

        {error ? (
          <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </p>
        ) : null}

        {loading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
            No orders yet.
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {orders.map((order) => (
              <article key={order.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
                      Order #{order.id}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-950">
                      {order.customer?.name || 'Customer'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">{order.customer?.email}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Placed on {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      value={order.status}
                      onChange={(event) =>
                        handleOrderChange(order.id, {
                          status: event.target.value,
                          paymentStatus: order.paymentStatus,
                        })
                      }
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                    >
                      <option value="placed">Placed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                      value={order.paymentStatus}
                      onChange={(event) =>
                        handleOrderChange(order.id, {
                          status: order.status,
                          paymentStatus: event.target.value,
                        })
                      }
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                    >
                      {paymentStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={`${order.id}-${item.productId}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4">
                        <div className="flex items-center gap-4">
                          <img src={item.productImage} alt={item.productName} className="h-16 w-16 rounded-2xl object-cover" />
                          <div>
                            <p className="font-semibold text-slate-900">{item.productName}</p>
                            <p className="text-sm text-slate-500">
                              Qty {item.quantity} x ${Number(item.unitPrice).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-slate-900">${Number(item.lineTotal).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <aside className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                    <p className="font-semibold text-slate-900">Payment</p>
                    <p className="mt-2 capitalize">{order.paymentMethod} | {order.paymentStatus}</p>
                    {order.paymentReference ? (
                      <>
                        <p className="mt-4 font-semibold text-slate-900">Reference</p>
                        <p className="mt-2 break-words">{order.paymentReference}</p>
                      </>
                    ) : null}
                    {order.paymentNotes ? (
                      <>
                        <p className="mt-4 font-semibold text-slate-900">Customer Note</p>
                        <p className="mt-2 break-words">{order.paymentNotes}</p>
                      </>
                    ) : null}
                    <p className="mt-4 font-semibold text-slate-900">Shipping</p>
                    <p className="mt-2">
                      {order.shippingAddress.fullName}
                      <br />
                      {order.shippingAddress.addressLine1}
                      {order.shippingAddress.addressLine2 ? (
                        <>
                          <br />
                          {order.shippingAddress.addressLine2}
                        </>
                      ) : null}
                      <br />
                      {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                      <br />
                      {order.shippingAddress.country}
                    </p>
                    <p className="mt-4 text-base font-semibold text-slate-950">
                      Total: ${Number(order.total).toFixed(2)}
                    </p>
                  </aside>
                </div>

              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default AdminOrders

