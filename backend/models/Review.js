const { pool } = require('../config/db')

const mapReview = (row) => {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    userName: row.user_name,
    rating: Number(row.rating),
    comment: row.comment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const findByProductId = async (productId) => {
  const result = await pool.query(
    `
      SELECT r.id, r.product_id, r.user_id, u.name AS user_name, r.rating, r.comment, r.created_at, r.updated_at
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC
    `,
    [productId],
  )

  return result.rows.map(mapReview)
}

const upsert = async ({ productId, userId, rating, comment }) => {
  const result = await pool.query(
    `
      INSERT INTO reviews (product_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (product_id, user_id)
      DO UPDATE SET
        rating = EXCLUDED.rating,
        comment = EXCLUDED.comment,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, product_id, user_id, rating, comment, created_at, updated_at
    `,
    [productId, userId, rating, comment.trim()],
  )

  const reviewRow = result.rows[0]
  const userResult = await pool.query('SELECT name FROM users WHERE id = $1 LIMIT 1', [userId])

  return mapReview({
    ...reviewRow,
    user_name: userResult.rows[0]?.name || 'Customer',
  })
}

module.exports = {
  findByProductId,
  upsert,
}
