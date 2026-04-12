import { useEffect, useState } from 'react'
import ProductCard from '../components/ProductCard'
import api from '../lib/api'

function Products({ onAddToCart, canAddToCart = true }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sort: 'newest',
  })

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get('/api/products', {
            params: {
              q: filters.search,
              category: filters.category,
              sort: filters.sort,
            },
          }),
          api.get('/api/products/meta/categories'),
        ])
        const productList = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : productsResponse.data.products || []

        setProducts(productList)
        setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [])
      } catch (fetchError) {
        console.error('Failed to fetch products:', fetchError)
        if (!fetchError.response) {
          setError(
            'Cannot reach backend. Make sure the backend server and PostgreSQL are running.',
          )
        } else {
          setError(fetchError.response?.data?.message || 'Failed to load products.')
        }
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  return (
    <section id="products" className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
            Products
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            Explore our latest collection
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Clean essentials and standout picks for your everyday style.
          </p>
        </div>

        <div className="mt-10 grid gap-4 rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-sm md:grid-cols-[minmax(0,1.2fr)_0.8fr_0.8fr]">
          <input
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search products"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
          />
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            name="sort"
            value={filters.sort}
            onChange={handleFilterChange}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
          >
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>

        {loading ? (
          <div className="mt-14 flex min-h-56 items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-white/85 shadow-sm">
            <p className="text-base font-medium text-slate-500">
              Loading products...
            </p>
          </div>
        ) : error ? (
          <div className="mt-14 flex min-h-56 items-center justify-center rounded-[1.75rem] border border-dashed border-red-200 bg-white/85 shadow-sm">
            <p className="text-base font-medium text-red-600">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="mt-14 flex min-h-56 items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-white/85 shadow-sm">
            <p className="text-base font-medium text-slate-500">
              No products available yet.
            </p>
          </div>
        ) : (
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                canAddToCart={canAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Products
