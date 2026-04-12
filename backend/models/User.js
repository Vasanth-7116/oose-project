const { pool } = require('../config/db')

const mapUser = (row) => {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role,
    phone: row.phone,
    savedAddresses: row.saved_addresses || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const findByEmail = async (email) => {
  const result = await pool.query(
    `
      SELECT id, name, email, password, role, phone, saved_addresses, created_at, updated_at
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email.toLowerCase()],
  )

  return mapUser(result.rows[0])
}

const findById = async (id) => {
  const result = await pool.query(
    `
      SELECT id, name, email, password, role, phone, saved_addresses, created_at, updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  )

  return mapUser(result.rows[0])
}

const create = async ({ name, email, password, role }) => {
  const result = await pool.query(
    `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, password, role, phone, saved_addresses, created_at, updated_at
    `,
    [name.trim(), email.toLowerCase(), password, role],
  )

  return mapUser(result.rows[0])
}

const updateProfile = async (id, { name, phone, savedAddresses }) => {
  const result = await pool.query(
    `
      UPDATE users
      SET name = $2,
          phone = $3,
          saved_addresses = $4::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, email, password, role, phone, saved_addresses, created_at, updated_at
    `,
    [id, name.trim(), phone ? phone.trim() : null, JSON.stringify(savedAddresses || [])],
  )

  return mapUser(result.rows[0])
}

module.exports = {
  create,
  findByEmail,
  findById,
  updateProfile,
}
