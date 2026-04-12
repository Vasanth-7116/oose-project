import { useEffect, useState } from 'react'
import api from '../lib/api'
import { getAuthConfig } from '../lib/auth'

const emptyAddress = {
  label: '',
  fullName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postalCode: '',
  country: '',
}

function Profile({ onProfileUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    savedAddresses: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        const response = await api.get('/api/profile', getAuthConfig())
        setFormData({
          name: response.data.name || '',
          phone: response.data.phone || '',
          email: response.data.email || '',
          savedAddresses: Array.isArray(response.data.savedAddresses) ? response.data.savedAddresses : [],
        })
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.message || 'Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleAddressChange = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      savedAddresses: current.savedAddresses.map((address, addressIndex) =>
        addressIndex === index ? { ...address, [field]: value } : address,
      ),
    }))
  }

  const handleAddAddress = () => {
    setFormData((current) => ({
      ...current,
      savedAddresses: [...current.savedAddresses, { ...emptyAddress }],
    }))
  }

  const handleRemoveAddress = (index) => {
    setFormData((current) => ({
      ...current,
      savedAddresses: current.savedAddresses.filter((_, addressIndex) => addressIndex !== index),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const response = await api.put(
        '/api/profile',
        {
          name: formData.name,
          phone: formData.phone,
          savedAddresses: formData.savedAddresses,
        },
        getAuthConfig(),
      )

      onProfileUpdate?.(response.data.user)
      setSuccess('Profile updated successfully.')
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/70 bg-white/90 p-8 text-slate-500 shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
          Loading profile...
        </section>
      </main>
    )
  }

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
          Profile
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
          Manage your account
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Update your personal details and save delivery addresses for faster checkout.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name"
              required
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-slate-900 focus:bg-white"
            />
            <input
              value={formData.email}
              disabled
              className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3.5 text-slate-500 outline-none"
            />
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-slate-900 focus:bg-white sm:col-span-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">Saved addresses</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Reuse these at checkout to speed up delivery details.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddAddress}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                Add Address
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {formData.savedAddresses.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  No saved addresses yet.
                </div>
              ) : (
                formData.savedAddresses.map((address, index) => (
                  <div
                    key={`${address.label}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        value={address.label}
                        onChange={(event) => handleAddressChange(index, 'label', event.target.value)}
                        placeholder="Label (Home, Office)"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
                      />
                      <input
                        value={address.fullName}
                        onChange={(event) => handleAddressChange(index, 'fullName', event.target.value)}
                        placeholder="Recipient name"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
                      />
                      <input
                        value={address.addressLine1}
                        onChange={(event) => handleAddressChange(index, 'addressLine1', event.target.value)}
                        placeholder="Address line 1"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 sm:col-span-2"
                      />
                      <input
                        value={address.addressLine2}
                        onChange={(event) => handleAddressChange(index, 'addressLine2', event.target.value)}
                        placeholder="Address line 2"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 sm:col-span-2"
                      />
                      <input
                        value={address.city}
                        onChange={(event) => handleAddressChange(index, 'city', event.target.value)}
                        placeholder="City"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
                      />
                      <input
                        value={address.postalCode}
                        onChange={(event) => handleAddressChange(index, 'postalCode', event.target.value)}
                        placeholder="Postal code"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
                      />
                      <input
                        value={address.country}
                        onChange={(event) => handleAddressChange(index, 'country', event.target.value)}
                        placeholder="Country"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 sm:col-span-2"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAddress(index)}
                      className="mt-4 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
                    >
                      Remove Address
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? 'Saving profile...' : 'Save Profile'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default Profile
