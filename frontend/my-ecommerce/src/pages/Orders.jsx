import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../lib/api'
import { getAuthConfig } from '../lib/auth'

const TRACKING_REFRESH_MS = 15000

const paymentStatusLabel = {
  pending: 'Pending',
  confirmation_submitted: 'Confirmation Submitted',
  paid: 'Paid',
}

function Orders() {
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paymentForms, setPaymentForms] = useState({})
  const [paymentState, setPaymentState] = useState({})

  useEffect(() => {
    let isMounted = true

    const loadOrders = async ({ silent = false } = {}) => {
      try {
        if (!silent) {
          setLoading(true)
        }
        const response = await api.get('/api/orders/my', getAuthConfig())

        if (!isMounted) {
          return
        }

        const nextOrders = Array.isArray(response.data) ? response.data : []
        setOrders(nextOrders)
        setPaymentForms((current) => {
          const next = { ...current }

          nextOrders.forEach((order) => {
            if (!next[order.id]) {
              next[order.id] = { reference: '', notes: '' }
            }
          })

          return next
        })
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message || requestError.message || 'Failed to load orders.')
        }
      } finally {
        if (isMounted && !silent) {
          setLoading(false)
        }
      }
    }

    loadOrders()
    const intervalId = setInterval(() => loadOrders({ silent: true }), TRACKING_REFRESH_MS)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [])

  const handlePaymentFieldChange = (orderId, field, value) => {
    setPaymentForms((current) => ({
      ...current,
      [orderId]: {
        ...(current[orderId] || { reference: '', notes: '' }),
        [field]: value,
      },
    }))
  }

  const handlePaymentSubmit = async (orderId) => {
    const paymentForm = paymentForms[orderId] || { reference: '', notes: '' }

    try {
      setPaymentState((current) => ({
        ...current,
        [orderId]: { loading: true, error: '', success: '' },
      }))

      const response = await api.post(
        `/api/orders/${orderId}/payment-confirmation`,
        paymentForm,
        getAuthConfig(),
      )

      setOrders((current) =>
        current.map((order) => (order.id === orderId ? response.data.order : order)),
      )
      setPaymentState((current) => ({
        ...current,
        [orderId]: { loading: false, error: '', success: 'Payment confirmation submitted.' },
      }))
      setPaymentForms((current) => ({
        ...current,
        [orderId]: { reference: '', notes: '' },
      }))
    } catch (requestError) {
      setPaymentState((current) => ({
        ...current,
        [orderId]: {
          loading: false,
          error: requestError.response?.data?.message || requestError.message || 'Failed to submit payment confirmation.',
          success: '',
        },
      }))
    }
  }

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
          Orders
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
          Your order history
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Review placed orders, confirm online payments, and follow shipment updates from your orders page.
        </p>

        {location.state?.successMessage ? (
          <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {location.state.successMessage}
          </p>
        ) : null}

        {loading ? (
          <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            Loading orders...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-[1.5rem] border border-red-200 bg-red-50 p-6 text-sm text-red-600">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            No orders yet. Place your first order from the cart.
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {orders.map((order) => {
              const paymentForm = paymentForms[order.id] || { reference: '', notes: '' }
              const paymentUi = paymentState[order.id] || { loading: false, error: '', success: '' }
              const shouldShowPaymentConfirmation =
                ['card', 'upi'].includes(order.paymentMethod) && order.paymentStatus !== 'paid'

              return (
                <article
                  key={order.id}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
                        Order #{order.id}
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-slate-950 capitalize">
                        {order.status}
                      </h2>
                      <p className="mt-2 text-sm text-slate-500">
                        Placed on {new Date(order.createdAt).toLocaleString()}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Tracking updates refresh every 15 seconds.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Payment
                      </p>
                      <p className="mt-1 text-sm font-semibold capitalize text-slate-700">
                        {order.paymentMethod} | {paymentStatusLabel[order.paymentStatus] || order.paymentStatus}
                      </p>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Total
                      </p>
                      <p className="mt-1 text-xl font-bold text-slate-950">
                        ${Number(order.total).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div
                          key={`${order.id}-${item.productId}`}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="h-16 w-16 rounded-2xl object-cover"
                            />
                            <div>
                              <p className="font-semibold text-slate-900">{item.productName}</p>
                              <p className="text-sm text-slate-500">
                                Qty {item.quantity} x ${Number(item.unitPrice).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-slate-900">
                            ${Number(item.lineTotal).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <aside className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-sm font-semibold text-slate-900">Shipping to</p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
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
                    </aside>
                  </div>

                  <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_340px]">
                    <section className="rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                            Tracking
                          </p>
                          <h3 className="mt-2 text-xl font-bold text-slate-950">Shipment updates</h3>
                        </div>
                        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                          {order.tracking?.updatedAt
                            ? `Updated ${new Date(order.tracking.updatedAt).toLocaleTimeString()}`
                            : 'Awaiting update'}
                        </span>
                      </div>
                      <p className="mt-4 text-sm text-slate-600">
                        {order.tracking?.message || 'Tracking details will appear once the admin dispatches this order.'}
                      </p>

                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                        {order.tracking?.updatedAt ? (
                          <p>
                            Last tracking update: {new Date(order.tracking.updatedAt).toLocaleString()}
                          </p>
                        ) : (
                          <p>No shipment update has been posted yet.</p>
                        )}
                      </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5">
                      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                        Payment Review
                      </p>
                      <h3 className="mt-2 text-xl font-bold text-slate-950">Confirmation</h3>
                      <p className="mt-3 text-sm text-slate-600">
                        {order.paymentMethod === 'cod'
                          ? 'Cash on delivery orders do not need online payment confirmation.'
                          : 'Submit your reference so the admin can verify your card or UPI payment.'}
                      </p>

                      {order.paymentReference ? (
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                          <p className="font-semibold text-slate-900">Latest reference</p>
                          <p className="mt-2">{order.paymentReference}</p>
                          {order.paymentNotes ? <p className="mt-2">{order.paymentNotes}</p> : null}
                        </div>
                      ) : null}

                      {shouldShowPaymentConfirmation ? (
                        <div className="mt-4 space-y-4">
                          <input
                            type="text"
                            value={paymentForm.reference}
                            onChange={(event) => handlePaymentFieldChange(order.id, 'reference', event.target.value)}
                            placeholder="UPI reference / transaction id"
                            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
                          />
                          <textarea
                            rows="4"
                            value={paymentForm.notes}
                            onChange={(event) => handlePaymentFieldChange(order.id, 'notes', event.target.value)}
                            placeholder="Optional note for the admin"
                            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
                          />
                          {paymentUi.error ? (
                            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                              {paymentUi.error}
                            </p>
                          ) : null}
                          {paymentUi.success ? (
                            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                              {paymentUi.success}
                            </p>
                          ) : null}
                          <button
                            type="button"
                            disabled={paymentUi.loading}
                            onClick={() => handlePaymentSubmit(order.id)}
                            className="w-full rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {paymentUi.loading ? 'Submitting...' : 'Submit Payment Confirmation'}
                          </button>
                        </div>
                      ) : (
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                          {order.paymentStatus === 'paid'
                            ? 'Payment has already been verified.'
                            : 'Waiting for payment confirmation once you complete the transfer.'}
                        </div>
                      )}
                    </section>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

export default Orders

