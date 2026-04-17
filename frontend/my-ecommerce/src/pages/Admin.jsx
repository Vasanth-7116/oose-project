import { useEffect, useState } from 'react'
import api from '../lib/api'
import { formatCurrency } from '../lib/currency'

const sampleImageUrls = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
]

function Admin() {
  const [products, setProducts] = useState([])
  const [addFormData, setAddFormData] = useState({
    name: '',
    price: '',
    image: '',
  })
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    price: '',
    image: '',
  })
  const [loading, setLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const getAuthConfig = () => {
    const token = localStorage.getItem('token')

    if (!token) {
      throw new Error('Please login as admin first.')
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  }

  const loadProducts = async () => {
    try {
      setProductsLoading(true)
      const response = await api.get('/api/products')
      setProducts(Array.isArray(response.data) ? response.data : [])
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Failed to load products. Please try again.',
      )
    } finally {
      setProductsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setAddFormData((current) => ({ ...current, [name]: value }))
  }

  const handleUseSampleImage = (imageUrl) => {
    setAddFormData((current) => ({ ...current, image: imageUrl }))
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditFormData((current) => ({ ...current, [name]: value }))
  }

  const handleUseEditSampleImage = (imageUrl) => {
    setEditFormData((current) => ({ ...current, image: imageUrl }))
  }

  const resetAddForm = () => {
    setAddFormData({
      name: '',
      price: '',
      image: '',
    })
  }

  const resetEditForm = () => {
    setEditFormData({
      id: '',
      name: '',
      price: '',
      image: '',
    })
  }

  const handleEditProduct = (product) => {
    setEditFormData({
      id: product._id,
      name: product.name,
      price: String(product.price),
      image: product.image,
    })
    setError('')
    setSuccessMessage('')
  }

  const handleDeleteProduct = async (productId) => {
    try {
      setError('')
      setSuccessMessage('')
      await api.delete(`/api/products/${productId}`, getAuthConfig())
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product._id !== productId),
      )
      if (editFormData.id === productId) {
        resetEditForm()
      }
      setSuccessMessage('Product deleted successfully.')
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Failed to delete product. Please try again.',
      )
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const payload = {
        ...addFormData,
        price: Number(addFormData.price),
      }

      const response = await api.post(
        '/api/products',
        payload,
        getAuthConfig(),
      )
      setProducts((currentProducts) => [response.data.product, ...currentProducts])
      setSuccessMessage('Product added successfully.')
      resetAddForm()
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Failed to add product. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSubmit = async (event) => {
    event.preventDefault()
    setEditLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const payload = {
        name: editFormData.name,
        price: Number(editFormData.price),
        image: editFormData.image,
      }

      const response = await api.put(
        `/api/products/${editFormData.id}`,
        payload,
        getAuthConfig(),
      )

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product._id === editFormData.id ? response.data.product : product,
        ),
      )
      setSuccessMessage('Product updated successfully.')
      resetEditForm()
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Failed to update product. Please try again.',
      )
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_28px_70px_rgba(15,23,42,0.08)] sm:p-10">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
            Admin
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            Admin dashboard
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Add, update, and delete products in your store.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            For the image, paste any direct public image URL. You can use one
            of the sample links below if you just want to test quickly.
          </p>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
          <form onSubmit={handleSubmit} className="grid gap-5 self-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
                Add Product
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Create a new product
              </h2>
            </div>
            <div>
              <label
                htmlFor="product-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Product Name
              </label>
              <input
                id="product-name"
                name="name"
                type="text"
                value={addFormData.name}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="product-price"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Price (INR)
              </label>
              <input
                id="product-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={addFormData.price}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="product-image"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Image URL
              </label>
              <input
                id="product-image"
                name="image"
                type="text"
                value={addFormData.image}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-slate-700">
                Quick sample image URLs
              </p>
              <div className="grid gap-3">
                {sampleImageUrls.map((imageUrl, index) => (
                  <button
                    key={imageUrl}
                    type="button"
                    onClick={() => handleUseSampleImage(imageUrl)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left text-sm text-slate-600 transition hover:border-sky-300 hover:bg-sky-50"
                  >
                    <span className="block text-sm font-semibold text-slate-900">
                      Sample {index + 1}
                    </span>
                    <span className="mt-1 block truncate">{imageUrl}</span>
                  </button>
                ))}
              </div>
            </div>

            {addFormData.image ? (
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-medium text-slate-700">
                  Image preview
                </p>
                <img
                  src={addFormData.image}
                  alt="Product preview"
                  className="h-56 w-full rounded-2xl object-cover"
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

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:-translate-y-0.5 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Adding product...' : 'Add Product'}
              </button>
            </div>
          </form>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">
                  Manage Products
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Edit or delete existing products
                </h2>
              </div>
              <button
                type="button"
                onClick={loadProducts}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                Refresh
              </button>
            </div>

            {editFormData.id ? (
              <form
                onSubmit={handleUpdateSubmit}
                className="grid gap-4 rounded-[1.5rem] border border-amber-200 bg-amber-50/70 p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-950">
                    Edit product
                  </h3>
                  <button
                    type="button"
                    onClick={resetEditForm}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                  >
                    Close
                  </button>
                </div>

                <input
                  name="name"
                  type="text"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  required
                  placeholder="Product name"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 outline-none transition focus:border-slate-900"
                />

                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.price}
                  onChange={handleEditChange}
                  required
                  placeholder="Price in INR"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 outline-none transition focus:border-slate-900"
                />

                <input
                  name="image"
                  type="text"
                  value={editFormData.image}
                  onChange={handleEditChange}
                  required
                  placeholder="Image URL"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 outline-none transition focus:border-slate-900"
                />

                <div className="grid gap-3 sm:grid-cols-3">
                  {sampleImageUrls.map((imageUrl, index) => (
                    <button
                      key={`edit-${imageUrl}`}
                      type="button"
                      onClick={() => handleUseEditSampleImage(imageUrl)}
                      className="rounded-2xl border border-amber-200 bg-white p-3 text-left text-sm text-slate-600 transition hover:border-amber-400"
                    >
                      <span className="block text-sm font-semibold text-slate-900">
                        Sample {index + 1}
                      </span>
                      <span className="mt-1 block truncate">{imageUrl}</span>
                    </button>
                  ))}
                </div>

                {editFormData.image ? (
                  <img
                    src={editFormData.image}
                    alt="Edit preview"
                    className="h-48 w-full rounded-2xl object-cover"
                  />
                ) : null}

                <button
                  type="submit"
                  disabled={editLoading}
                  className="rounded-full bg-amber-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {editLoading ? 'Updating product...' : 'Update Product'}
                </button>
              </form>
            ) : null}

            {productsLoading ? (
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                No products available yet.
              </div>
            ) : (
              products.map((product) => (
                <article
                  key={product._id}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-28 w-full rounded-2xl object-cover sm:w-32"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-slate-950">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-slate-600">
                        {formatCurrency(product.price)}
                      </p>
                      <p className="mt-2 truncate text-xs text-slate-500">
                        {product.image}
                      </p>
                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleEditProduct(product)}
                          className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-400"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product._id)}
                          className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default Admin
