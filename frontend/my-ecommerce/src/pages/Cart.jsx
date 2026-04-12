import { Link } from 'react-router-dom'
import heroImg from '../assets/hero.png'

function Cart({ cartItems, onClearCart, onRemoveFromCart, onUpdateQuantity }) {
  const subtotal = cartItems.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantity || 1),
    0,
  )

  return (
    <section id="cart" className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
            Cart
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            Your shopping cart
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Review your selected products before checkout.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="mt-14 rounded-[1.75rem] border border-dashed border-slate-300 bg-white/85 px-6 py-14 text-center shadow-sm">
            <p className="text-base font-medium text-slate-500">
              Your cart is empty.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:-translate-y-0.5 hover:bg-sky-500"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="mt-14 grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-5">
              {cartItems.map((item, index) => {
                const imageSrc = item.image || item.imageUrl || heroImg

                return (
                  <article
                    key={`${item.id || item._id || item.name}-${index}`}
                    className="flex flex-col gap-5 rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.07)] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={imageSrc}
                        alt={item.name}
                        className="h-22 w-22 rounded-2xl object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-slate-950">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-slate-600">
                          ${Number(item.price).toFixed(2)} each
                        </p>
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 rounded-full bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 rounded-full bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveFromCart(index)}
                      className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-slate-50 hover:text-slate-900"
                    >
                      Remove
                    </button>
                  </article>
                )
              })}
            </div>

            <aside className="h-fit rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
              <h3 className="text-xl font-bold text-slate-950">Summary</h3>
              <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
                <span>Items</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-b border-slate-200 pb-5 text-base font-semibold text-slate-950">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  to="/checkout"
                  className="inline-flex w-full items-center justify-center rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:bg-sky-500"
                >
                  Proceed to Checkout
                </Link>
                <button
                  type="button"
                  onClick={onClearCart}
                  className="w-full rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-slate-50 hover:text-slate-900"
                >
                  Clear Cart
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  )
}

export default Cart
