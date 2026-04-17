import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { formatCurrency } from '../lib/currency'

const starterPrompts = [
  'I need a budget-friendly option under ₹5,000',
  'Suggest a good gift for daily use',
  'Which product has the best ratings?',
]

const getChatErrorMessage = (error) => {
  const responseBody = error.response?.data

  if (error.response?.status === 404) {
    return 'The chatbot API route was not found. Restart the backend server so it picks up the new chatbot endpoint.'
  }

  if (typeof responseBody === 'string' && /Cannot POST\s+\/api\/chatbot\/message/i.test(responseBody)) {
    return 'The backend is still running an older version without the chatbot route. Restart the backend server and try again.'
  }

  if (typeof responseBody?.message === 'string' && responseBody.message.trim()) {
    return responseBody.message
  }

  return 'The shopping assistant is unavailable right now. Please try again in a moment.'
}

function ShoppingAssistant({ onAddToCart, canAddToCart = true }) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content:
        'Tell me what you need, your budget, or who you are shopping for, and I will recommend products from this store.',
      recommendations: [],
    },
  ])

  const history = useMemo(
    () =>
      messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    [messages],
  )

  const sendMessage = async (rawMessage) => {
    const trimmedMessage = rawMessage.trim()

    if (!trimmedMessage || loading) {
      return
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: trimmedMessage,
      recommendations: [],
    }

    setMessages((current) => [...current, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await api.post('/api/chatbot/message', {
        message: trimmedMessage,
        history,
      })

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.data.reply,
          recommendations: Array.isArray(response.data.recommendations)
            ? response.data.recommendations
            : [],
          provider: response.data.provider,
        },
      ])
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: getChatErrorMessage(error),
          recommendations: [],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
      {isOpen ? (
        <section className="flex h-[70vh] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.2)]">
          <div className="flex items-start justify-between gap-4 bg-slate-950 px-5 py-4 text-white">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-200">
                Shopping Assistant
              </p>
              <h2 className="mt-1 text-lg font-bold">Find the right product faster</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-white/20 px-3 py-1 text-sm font-semibold text-white/90 transition hover:bg-white/10"
            >
              Close
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-[1.5rem] px-4 py-3 text-sm leading-6 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-sky-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <p>{message.content}</p>

                  {message.recommendations?.length ? (
                    <div className="mt-3 space-y-3">
                      {message.recommendations.map((product) => (
                        <article
                          key={product.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-800"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">{product.name}</p>
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                {product.category}
                              </p>
                            </div>
                            <p className="text-sm font-bold">{formatCurrency(product.price)}</p>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-slate-600">
                            {product.description}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Link
                              to={`/products/${product.id}`}
                              className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                              onClick={() => setIsOpen(false)}
                            >
                              View
                            </Link>
                            {canAddToCart ? (
                              <button
                                type="button"
                                onClick={() => onAddToCart(product)}
                                disabled={product.stock < 1}
                                className="rounded-full bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                              >
                                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                              </button>
                            ) : null}
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {!loading && messages.length === 1 ? (
              <div className="space-y-2">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}

            {loading ? (
              <div className="max-w-[88%] rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                Finding the best match for your needs...
              </div>
            ) : null}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              sendMessage(input)
            }}
            className="border-t border-slate-200 bg-white p-4"
          >
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Describe your needs, budget, or preferred category"
                className="flex-1 rounded-full border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Send
              </button>
            </div>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.25)] transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Ask Shop Assistant
        </button>
      )}
    </div>
  )
}

export default ShoppingAssistant
