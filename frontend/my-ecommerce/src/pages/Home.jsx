import { Link } from 'react-router-dom'

function Home() {
  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 px-6 py-18 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:px-10 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
            Fresh arrivals for every day
          </p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl md:text-6xl lg:text-7xl">
            Discover everything you need in one stylish place
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            Shop the latest essentials, trending picks, and everyday favorites
            with a simple and seamless experience.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex rounded-full bg-sky-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:-translate-y-0.5 hover:bg-sky-500"
            >
              Shop Now
            </Link>
            <Link
              to="/register"
              className="inline-flex rounded-full border border-slate-300 bg-white px-8 py-3.5 text-base font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
            >
              Create Account
            </Link>
          </div>
          <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5">
              <p className="text-sm font-semibold text-slate-900">Fast browsing</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Clean product discovery with a responsive layout that feels light on every screen.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5">
              <p className="text-sm font-semibold text-slate-900">Simple checkout flow</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Save products to your cart instantly and keep them around with local storage.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5">
              <p className="text-sm font-semibold text-slate-900">Admin ready</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Sign in as admin to manage products without leaving the app.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
