import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { getAuthConfig } from '../lib/auth'

const sampleImageUrls = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
]

function AdminManage() {
  const [products, setProducts] = useState([])
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    price: '',
    image: '',
    category: '',
    description: '',
    stock: '',
  })
  const [productsLoading, setProductsLoading] = useState(true)
  const [editLoading, setEditLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

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

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditFormData((current) => ({ ...current, [name]: value }))
  }

  const handleUseEditSampleImage = (imageUrl) => {
    setEditFormData((current) => ({ ...current, image: imageUrl }))
  }

  const resetEditForm = () => {
    setEditFormData({
      id: '',
      name: '',
      price: '',
      image: '',
      category: '',
      description: '',
      stock: '',
    })
  }

  const handleEditProduct = (product) => {
    setEditFormData({
      id: product.id,
      name: product.name,
      price: String(product.price),
      image: product.image,
      category: product.category,
      description: product.description,
      stock: String(product.stock),
    })
    setError('')
    setSuccessMessage('')
  }

  const handleDeleteProduct = async (productId) => {
    const productToDelete = products.find((product) => product.id === productId)
    const confirmed = window.confirm(
      productToDelete
        ? `Delete "${productToDelete.name}"? This action cannot be undone.`
        : 'Delete this product? This action cannot be undone.',
    )

    if (!confirmed) {
      return
    }

    try {
      setError('')
      setSuccessMessage('')
      await api.delete(`/api/products/${productId}`, getAuthConfig())
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productId),
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

  const handleUpdateSubmit = async (event) => {
    event.preventDefault()
    setEditLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await api.put(
        `/api/products/${editFormData.id}`,
        {
          name: editFormData.name,
          price: Number(editFormData.price),
          image: editFormData.image,
          category: editFormData.category,
          description: editFormData.description,
          stock: Number(editFormData.stock),
        },
        getAuthConfig(),
      )

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === editFormData.id ? response.data.product : product,
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
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_28px_70px_rgba(15,23,42,0.08)] sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
              Admin
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              Manage products
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Edit and delete products here. Adding new products lives on a separate page.
            </p>
          </div>
          <Link
            to="/admin/add"
            className="inline-flex rounded-full border border-sky-300 bg-sky-50 px-5 py-3 text-sm font-semibold text-sky-800 transition hover:bg-sky-100"
          >
            Go To Add Product
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-950">
              Existing products
            </h2>
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
              className="grid gap-4 rounded-[1.5rem] border border-sky-200 bg-sky-50/70 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-slate-950">Edit product</h3>
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
                placeholder="Price"
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

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  name="category"
                  type="text"
                  value={editFormData.category}
                  onChange={handleEditChange}
                  required
                  placeholder="Category"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 outline-none transition focus:border-slate-900"
                />

                <input
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={editFormData.stock}
                  onChange={handleEditChange}
                  required
                  placeholder="Stock"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 outline-none transition focus:border-slate-900"
                />
              </div>

              <textarea
                name="description"
                rows="4"
                value={editFormData.description}
                onChange={handleEditChange}
                required
                placeholder="Description"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 outline-none transition focus:border-slate-900"
              />

              <div className="grid gap-3 sm:grid-cols-3">
                {sampleImageUrls.map((imageUrl, index) => (
                  <button
                    key={`edit-${imageUrl}`}
                    type="button"
                    onClick={() => handleUseEditSampleImage(imageUrl)}
                    className="rounded-2xl border border-sky-200 bg-white p-3 text-left text-sm text-slate-600 transition hover:border-sky-400"
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
                  className="h-56 w-full rounded-2xl object-cover"
                />
              ) : null}

              <button
                type="submit"
                disabled={editLoading}
                className="rounded-full bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {editLoading ? 'Updating product...' : 'Update Product'}
              </button>
            </form>
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
                key={product.id}
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
                      ${Number(product.price).toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                      {product.category} | {product.stock} in stock
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {product.description}
                    </p>
                    <p className="mt-2 truncate text-xs text-slate-500">
                      {product.image}
                    </p>
                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleEditProduct(product)}
                        className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id)}
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
      </section>
    </main>
  )
}

export default AdminManage

