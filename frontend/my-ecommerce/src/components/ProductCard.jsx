import { Link } from 'react-router-dom'
import heroImg from '../assets/hero.png'

function ProductCard({ product, onAddToCart, canAddToCart = true }) {
  const imageSrc = product.image || product.imageUrl || heroImg

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/90 shadow-[0_20px_45px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_rgba(15,23,42,0.12)]">
      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="space-y-5 p-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
            {product.category || 'Featured'}
          </p>
          <h3 className="text-xl font-bold text-slate-950">
            {product.name}
          </h3>
          <p className="text-lg font-semibold text-slate-700">
            ${Number(product.price).toFixed(2)}
          </p>
          <p className="text-sm text-slate-500">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to={`/products/${product.id}`}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
          >
            View Details
          </Link>
          <button
            type="button"
            disabled={!canAddToCart || product.stock < 1}
            onClick={() => onAddToCart(product)}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {canAddToCart ? 'Add to Cart' : 'Admins Cannot Order'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
