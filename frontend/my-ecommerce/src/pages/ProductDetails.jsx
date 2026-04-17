import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../lib/api'
import { getAuthConfig, getStoredUser } from '../lib/auth'
import { formatCurrency } from '../lib/currency'

function ProductDetails({ onAddToCart, canAddToCart = true }) {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewForm, setReviewForm] = useState({ rating: '5', comment: '' })
  const [reviewStatus, setReviewStatus] = useState({ error: '', success: '', loading: false })
  const user = getStoredUser()

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/api/products/${id}`)
        setProduct(response.data)
        setError('')
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Failed to load product details.')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  const handleReviewChange = (event) => {
    const { name, value } = event.target
    setReviewForm((current) => ({ ...current, [name]: value }))
  }

  const handleReviewSubmit = async (event) => {
    event.preventDefault()

    try {
      setReviewStatus({ error: '', success: '', loading: true })
      await api.post(
        `/api/products/${id}/reviews`,
        {
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment,
        },
        getAuthConfig(),
      )

      const refreshed = await api.get(`/api/products/${id}`)
      setProduct(refreshed.data)
      setReviewForm({ rating: '5', comment: '' })
      setReviewStatus({ error: '', success: 'Review saved successfully.', loading: false })
    } catch (requestError) {
      setReviewStatus({
        error: requestError.response?.data?.message || requestError.message || 'Failed to save review.',
        success: '',
        loading: false,
      })
    }
  }

  if (loading) {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white/90 p-8 text-slate-500 shadow-sm">
          Loading product details...
        </div>
      </section>
    )
  }

  if (error || !product) {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-red-200 bg-white/90 p-8 text-red-600 shadow-sm">
          <p>{error || 'Product not found.'}</p>
          <Link
            to="/products"
            className="mt-4 inline-flex rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
          >
            Back to Products
          </Link>
        </div>
      </section>
    )
  }

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-6xl gap-8 rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_28px_70px_rgba(15,23,42,0.08)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[1.75rem] bg-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-between gap-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-sky-700">
              {product.category}
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
              {product.name}
            </h1>
            <p className="mt-4 text-2xl font-bold text-slate-900">
              {formatCurrency(product.price)}
            </p>
            <p className="mt-3 text-sm font-medium text-slate-500">
              {Number(product.averageRating).toFixed(1)} rating | {product.reviewCount} reviews
            </p>
            <p className="mt-6 text-base leading-8 text-slate-600">
              {product.description}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Stock</p>
                <p className="mt-2 text-sm text-slate-600">
                  {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Delivery</p>
                <p className="mt-2 text-sm text-slate-600">
                  Quick checkout flow with order history once you place the order.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={!canAddToCart || product.stock < 1}
              onClick={() => onAddToCart(product)}
              className="inline-flex justify-center rounded-full bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {!canAddToCart ? 'Admins Cannot Order' : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <Link
              to="/products"
              className="inline-flex justify-center rounded-full border border-slate-300 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-6xl gap-8 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
                Reviews
              </p>
              <h2 className="mt-3 text-3xl font-black text-slate-950">
                What shoppers are saying
              </h2>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Average
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-950">
                {Number(product.averageRating).toFixed(1)}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {product.reviews?.length ? (
              product.reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{review.userName}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-800">
                      {review.rating}/5
                    </p>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {review.comment}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                No reviews yet. Be the first to share your feedback.
              </div>
            )}
          </div>
        </div>

        <aside className="h-fit rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
          <h3 className="text-xl font-bold text-slate-950">Leave a review</h3>
          {user ? (
            <form onSubmit={handleReviewSubmit} className="mt-5 space-y-4">
              <select
                name="rating"
                value={reviewForm.rating}
                onChange={handleReviewChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>
              <textarea
                name="comment"
                rows="5"
                value={reviewForm.comment}
                onChange={handleReviewChange}
                placeholder="Share your experience with this product"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
                required
              />
              {reviewStatus.error ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {reviewStatus.error}
                </p>
              ) : null}
              {reviewStatus.success ? (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {reviewStatus.success}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={reviewStatus.loading}
                className="w-full rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {reviewStatus.loading ? 'Saving review...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Login to leave a review for this product.
            </div>
          )}
        </aside>
      </section>
    </main>
  )
}

export default ProductDetails

