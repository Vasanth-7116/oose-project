import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { getAuthConfig } from '../lib/auth'

const sampleImageUrls = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
]

function AdminAdd() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    category: '',
    description: '',
    stock: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleUseSampleImage = (imageUrl) => {
    setFormData((current) => ({ ...current, image: imageUrl }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      image: '',
      category: '',
      description: '',
      stock: '',
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      await api.post(
        '/api/products',
        {
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
        },
        getAuthConfig(),
      )

      setSuccessMessage('Product added successfully.')
      resetForm()
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Failed to add product. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_28px_70px_rgba(15,23,42,0.08)] sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
              Admin
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              Add products
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Create a new product here. Editing and deleting live on a separate manage page.
            </p>
          </div>
          <Link
            to="/admin/manage"
            className="inline-flex rounded-full border border-slate-300 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
          >
            Go To Product Editor
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 grid gap-5">
          <div>
            <label htmlFor="product-name" className="mb-2 block text-sm font-medium text-slate-700">
              Product Name
            </label>
            <input
              id="product-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="product-price" className="mb-2 block text-sm font-medium text-slate-700">
              Price (INR)
            </label>
            <input
              id="product-price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="product-image" className="mb-2 block text-sm font-medium text-slate-700">
              Image URL
            </label>
            <input
              id="product-image"
              name="image"
              type="text"
              value={formData.image}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-slate-900 focus:bg-white"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="product-category" className="mb-2 block text-sm font-medium text-slate-700">
                Category
              </label>
              <input
                id="product-category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="product-stock" className="mb-2 block text-sm font-medium text-slate-700">
                Stock
              </label>
              <input
                id="product-stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="product-description" className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="product-description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-slate-700">
              Quick sample image URLs
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {sampleImageUrls.map((imageUrl, index) => (
                <button
                  key={imageUrl}
                  type="button"
                  onClick={() => handleUseSampleImage(imageUrl)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left text-sm text-slate-600 transition hover:border-slate-400 hover:bg-white"
                >
                  <span className="block text-sm font-semibold text-slate-900">
                    Sample {index + 1}
                  </span>
                  <span className="mt-1 block truncate">{imageUrl}</span>
                </button>
              ))}
            </div>
          </div>

          {formData.image ? (
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-medium text-slate-700">
                Image preview
              </p>
              <img
                src={formData.image}
                alt="Product preview"
                className="h-64 w-full rounded-2xl object-cover"
              />
            </div>
          ) : null}

          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          ) : null}
          {successMessage ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:-translate-y-0.5 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Adding product...' : 'Add Product'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default AdminAdd
