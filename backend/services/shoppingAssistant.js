const Product = require('../models/Product')

const DEFAULT_MODEL = process.env.HF_CHAT_MODEL || 'google/gemma-2-2b-it'
const HF_API_URL = process.env.HF_CHAT_API_URL || 'https://router.huggingface.co/v1/chat/completions'
const formatCurrency = (value) => `₹${Number(value).toLocaleString('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})}`
const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'any',
  'best',
  'buy',
  'for',
  'from',
  'gift',
  'good',
  'have',
  'i',
  'im',
  'in',
  'is',
  'it',
  'made',
  'me',
  'need',
  'of',
  'on',
  'or',
  'please',
  'recommend',
  'show',
  'something',
  'that',
  'the',
  'these',
  'this',
  'to',
  'want',
  'with',
])

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/₹|rs\.?/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const stemWord = (word) => {
  if (word.length > 4 && word.endsWith('ies')) {
    return `${word.slice(0, -3)}y`
  }

  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) {
    return word.slice(0, -1)
  }

  return word
}

const tokenizeKeywords = (value) =>
  normalizeText(value)
    .split(' ')
    .map(stemWord)
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word))

const getKeywordStats = (product, message) => {
  const queryKeywords = [...new Set(tokenizeKeywords(message))]
  const productKeywords = new Set(
    tokenizeKeywords(`${product.name} ${product.category} ${product.description}`),
  )

  let matchedCount = 0
  let unmatchedCount = 0

  queryKeywords.forEach((keyword) => {
    if (productKeywords.has(keyword)) {
      matchedCount += 1
    } else {
      unmatchedCount += 1
    }
  })

  return {
    queryKeywords,
    matchedCount,
    unmatchedCount,
  }
}

const formatProduct = (product) => ({
  id: product.id,
  name: product.name,
  category: product.category,
  price: Number(product.price),
  stock: Number(product.stock || 0),
  averageRating: Number(product.averageRating || 0),
  description: product.description,
  image: product.image,
})

const buildCatalogSnippet = (products) =>
  products
    .map(
      (product) =>
        `#${product.id} | ${product.name} | ${product.category} | ${formatCurrency(product.price)} | stock ${product.stock} | rating ${Number(product.averageRating || 0).toFixed(1)} | ${product.description}`,
    )
    .join('\n')

const extractJson = (text) => {
  if (!text) {
    return null
  }

  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null
  }

  try {
    return JSON.parse(text.slice(firstBrace, lastBrace + 1))
  } catch {
    return null
  }
}

const scoreProduct = (product, message) => {
  const text = `${product.name} ${product.category} ${product.description}`.toLowerCase()
  const normalized = message.toLowerCase()
  const keywordStats = getKeywordStats(product, message)
  let score = Number(product.averageRating || 0) * 3

  if (normalized.includes(product.category.toLowerCase())) {
    score += 18
  }

  score += keywordStats.matchedCount * 14
  score -= keywordStats.unmatchedCount * 9

  const normalizedText = normalizeText(text)
  const normalizedMessage = normalizeText(message)

  if (normalizedMessage.includes('leather') && normalizedText.includes('leather')) {
    score += 14
  }

  if (
    (normalizedMessage.includes('hand bag') || normalizedMessage.includes('handbag')) &&
    (normalizedText.includes('hand bag') || normalizedText.includes('handbag'))
  ) {
    score += 18
  }

  if (normalizedMessage.includes('bag') && normalizedText.includes('bag')) {
    score += 12
  }

  if (/\bcheap\b|\bbudget\b|\baffordable\b|\blow cost\b/.test(normalized)) {
    score += Math.max(0, 20 - Number(product.price) / 500)
  }

  if (/\bpremium\b|\bluxury\b|\bbest\b|\bhigh end\b/.test(normalized)) {
    score += Number(product.price) / 1000
  }

  if (/\bgift\b/.test(normalized)) {
    score += product.averageRating >= 4 ? 10 : 0
  }

  if (product.stock > 0) {
    score += 6
  }

  const budgetMatch = normalized.match(/(?:under|below|less than|max(?:imum)?)[^\d]*(\d[\d,]*(?:\.\d+)?)/)

  if (budgetMatch) {
    const maxBudget = Number(budgetMatch[1].replace(/,/g, ''))

    if (Number(product.price) <= maxBudget) {
      score += 25
    } else {
      score -= 20
    }
  }

  return score
}

const isRatingQuery = (message) => {
  const normalized = normalizeText(message)
return /\\b(rat|best|top|highest|popular|favorite)\\b/.test(normalized)
}

const isRelevantRecommendation = (product, message, isRating = false) => {
  if (isRating) {
    return true // Skip keyword filter for rating queries, rely on score sort
  }

  const normalizedMessage = normalizeText(message)
  const { queryKeywords, matchedCount } = getKeywordStats(product, message)

  if (queryKeywords.length === 0) {
    return true
  }

  if (queryKeywords.length === 1) {
    return matchedCount >= 1
  }

  if (normalizedMessage.includes('leather') && normalizedMessage.includes('bag')) {
    return matchedCount >= 2
  }

  return matchedCount >= Math.min(2, queryKeywords.length)
}

const buildFallbackResponse = (products, message) => {
  const ratingQuery = isRatingQuery(message)
  const rankedProducts = [...products]
    .filter((product) => product.stock > 0)
    .sort((left, right) => scoreProduct(right, message) - scoreProduct(left, message))
    .filter((product) => isRelevantRecommendation(product, message, ratingQuery))
    .slice(0, 3)

  if (rankedProducts.length === 0) {
    return {
      reply:
        'I could not find an in-stock product match right now. Please try asking about your budget, category, or preferred use.',
      recommendations: [],
      provider: 'local-fallback',
      usedFallback: true,
    }
  }

  const recommendationText = rankedProducts
    .map(
      (product) =>
        `${product.name} in ${product.category} for ${formatCurrency(product.price)} with a ${Number(product.averageRating || 0).toFixed(1)} rating`,
    )
    .join('; ')

  return {
    reply: `Based on your needs, I recommend these options: ${recommendationText}. Tell me your budget or use case and I can narrow it down further.`,
    recommendations: rankedProducts,
    provider: 'local-fallback',
    usedFallback: true,
  }
}



const askHuggingFace = async ({ products, message, history }) => {
  const token = process.env.HF_API_TOKEN

  if (!token) {
    return null
  }

  const systemPrompt = [
    'You are a shopping assistant for an e-commerce website called ShopEase.',
    'Only recommend products from the provided catalog.',
    'Ask at most one short follow-up question if needed.',
    'Keep the answer friendly and practical.',
    'Return strict JSON with this shape:',
    '{"reply":"short helpful answer","recommendationIds":[1,2,3]}',
    'Do not include markdown fences.',
    'Prefer in-stock items.',
    'Catalog:',
    buildCatalogSnippet(products),
  ].join('\n')

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6).map((entry) => ({
      role: entry.role === 'assistant' ? 'assistant' : 'user',
      content: String(entry.content || ''),
    })),
    { role: 'user', content: message },
  ]

  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 350,
    }),
  })

  if (!response.ok) {
    throw new Error(`Hugging Face request failed with status ${response.status}`)
  }

  const payload = await response.json()
  const content = payload?.choices?.[0]?.message?.content || ''
  const parsed = extractJson(content)

  if (!parsed || !parsed.reply) {
    throw new Error('Unable to parse Hugging Face chatbot response.')
  }

  const productMap = new Map(products.map((product) => [Number(product.id), product]))
  const recommendations = Array.isArray(parsed.recommendationIds)
    ? parsed.recommendationIds
        .map((id) => productMap.get(Number(id)))
        .filter(Boolean)
        .filter((product) => isRelevantRecommendation(product, message))
        .sort((left, right) => scoreProduct(right, message) - scoreProduct(left, message))
        .slice(0, 3)
    : []

  return {
    reply:
      recommendations.length > 0
        ? String(parsed.reply).trim()
        : 'I could not find a strong match for that request in the current catalog. Try a more specific budget, color, or style and I will narrow it down.',
    recommendations,
    provider: `huggingface:${DEFAULT_MODEL}`,
    usedFallback: false,
  }
}

const getShoppingAssistantReply = async ({ message, history = [] }) => {
  const { q = '', category = '', sort = 'newest' } = {} // No req.query available here
  const products = await Product.findAll({}).map(formatProduct)

  if (!products.length) {
    return {
      reply: 'There are no products in the catalog yet, so I cannot make a recommendation right now.',
      recommendations: [],
      provider: 'local-fallback',
      usedFallback: true,
    }
  }

  try {
    const result = await askHuggingFace({ products, message, history })

    if (result) {
      return result
    }
  } catch (error) {
    console.error('Shopping assistant provider failed:', error.message)
  }

  return buildFallbackResponse(products, message)
}

module.exports = {
  getShoppingAssistantReply,
}
