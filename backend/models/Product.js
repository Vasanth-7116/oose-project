const { pool } = require('../config/db')

const mapProduct = (row) => {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    image: row.image,
    category: row.category,
    description: row.description,
    stock: Number(row.stock),
    averageRating: Number(row.average_rating || 0),
    reviewCount: Number(row.review_count || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const baseSelect = `
  SELECT
    p.id,
    p.name,
    p.price,
    p.image,
    p.category,
    p.description,
    p.stock,
    p.created_at,
    p.updated_at,
    COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average_rating,
    COUNT(r.id) AS review_count
  FROM products p
  LEFT JOIN reviews r ON r.product_id = p.id
`

const findAll = async ({ query = '', category = '', sort = 'newest' } = {}) => {
  const conditions = []
  const values = []

  if (query) {
    values.push(`%${query.trim()}%`)
    conditions.push(`(p.name ILIKE $${values.length} OR p.description ILIKE $${values.length})`)
  }

  if (category) {
    values.push(category)
    conditions.push(`p.category = $${values.length}`)
  }

  let orderBy = 'p.created_at DESC'

  if (sort === 'price-asc') {
    orderBy = 'p.price ASC'
  } else if (sort === 'price-desc') {
    orderBy = 'p.price DESC'
  } else if (sort === 'rating') {
    orderBy = 'average_rating DESC, review_count DESC, p.created_at DESC'
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const result = await pool.query(
    `
      ${baseSelect}
      ${whereClause}
      GROUP BY p.id
      ORDER BY ${orderBy}
    `,
    values,
  )

  return result.rows.map(mapProduct)
}

const findCategories = async () => {
  const result = await pool.query(
    `
      SELECT DISTINCT category
      FROM products
      ORDER BY category ASC
    `,
  )

  return result.rows.map((row) => row.category)
}

const findById = async (id) => {
  const result = await pool.query(
    `
      ${baseSelect}
      WHERE p.id = $1
      GROUP BY p.id
    `,
    [id],
  )

  return mapProduct(result.rows[0])
}

const create = async ({ name, price, image, category, description, stock }) => {
  const result = await pool.query(
    `
      INSERT INTO products (name, price, image, category, description, stock)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, price, image, category, description, stock, created_at, updated_at
    `,
    [
      name.trim(),
      price,
      image.trim(),
      (category || 'Featured').trim(),
      (description || 'A carefully selected item from the ShopEase collection.').trim(),
      Number(stock ?? 0),
    ],
  )

  return mapProduct(result.rows[0])
}

const updateById = async (id, { name, price, image, category, description, stock }) => {
  const result = await pool.query(
    `
      UPDATE products
      SET name = $2,
          price = $3,
          image = $4,
          category = $5,
          description = $6,
          stock = $7,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, price, image, category, description, stock, created_at, updated_at
    `,
    [
      id,
      name.trim(),
      price,
      image.trim(),
      (category || 'Featured').trim(),
      (description || 'A carefully selected item from the ShopEase collection.').trim(),
      Number(stock ?? 0),
    ],
  )

  return mapProduct(result.rows[0])
}

const deleteById = async (id) => {
  const result = await pool.query(
    `
      DELETE FROM products
      WHERE id = $1
      RETURNING id, name, price, image, category, description, stock, created_at, updated_at
    `,
    [id],
  )

  return mapProduct(result.rows[0])
}

const deleteAll = async () => {
  await pool.query('DELETE FROM products')
}

const insertMany = async (products) => {
  const insertedProducts = []

  for (const product of products) {
    const insertedProduct = await create(product)
    insertedProducts.push(insertedProduct)
  }

  return insertedProducts
}

module.exports = {
  create,
  deleteAll,
  deleteById,
  findAll,
  findCategories,
  findById,
  insertMany,
  updateById,
}
