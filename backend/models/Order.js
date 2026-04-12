const { pool } = require('../config/db')

const mapOrderItem = (row) => ({
  productId: row.product_id,
  productName: row.product_name,
  productImage: row.product_image,
  quantity: Number(row.quantity),
  unitPrice: Number(row.unit_price),
  lineTotal: Number(row.unit_price) * Number(row.quantity),
})

const buildTracking = (row) => ({
  currentLat: row.current_lat === null || row.current_lat === undefined ? null : Number(row.current_lat),
  currentLng: row.current_lng === null || row.current_lng === undefined ? null : Number(row.current_lng),
  message: row.tracking_message,
  updatedAt: row.tracking_updated_at,
})

const buildPayment = (row) => ({
  method: row.payment_method,
  status: row.payment_status,
  reference: row.payment_reference || '',
  notes: row.payment_notes || '',
  submittedAt: row.payment_submitted_at,
})

const groupOrders = (rows) => {
  const orders = []
  const byId = new Map()

  for (const row of rows) {
    if (!byId.has(row.order_id)) {
      const order = {
        id: row.order_id,
        status: row.status,
        total: Number(row.total),
        paymentMethod: row.payment_method,
        paymentStatus: row.payment_status,
        paymentReference: row.payment_reference || '',
        paymentNotes: row.payment_notes || '',
        paymentSubmittedAt: row.payment_submitted_at,
        payment: buildPayment(row),
        tracking: buildTracking(row),
        customer: row.customer_name
          ? {
              id: row.user_id,
              name: row.customer_name,
              email: row.customer_email,
            }
          : null,
        shippingAddress: row.shipping_address,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        items: [],
      }

      byId.set(row.order_id, order)
      orders.push(order)
    }

    byId.get(row.order_id).items.push(mapOrderItem(row))
  }

  return orders
}

const baseSelect = `
  SELECT
    o.id AS order_id,
    o.user_id,
    o.status,
    o.total,
    o.payment_method,
    o.payment_status,
    o.payment_reference,
    o.payment_notes,
    o.payment_submitted_at,
    o.shipping_address,
    o.current_lat,
    o.current_lng,
    o.tracking_message,
    o.tracking_updated_at,
    o.created_at,
    o.updated_at,
    oi.product_id,
    oi.product_name,
    oi.product_image,
    oi.quantity,
    oi.unit_price
`

const create = async ({ userId, shippingAddress, items, paymentMethod }) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const uniqueProductIds = [...new Set(items.map((item) => Number(item.productId)))]
    const productsResult = await client.query(
      `
        SELECT id, name, price, image, stock
        FROM products
        WHERE id = ANY($1::int[])
      `,
      [uniqueProductIds],
    )

    const productsById = new Map(
      productsResult.rows.map((row) => [
        Number(row.id),
        {
          id: Number(row.id),
          name: row.name,
          price: Number(row.price),
          image: row.image,
          stock: Number(row.stock),
        },
      ]),
    )

    let total = 0
    const normalizedItems = items.map((item) => {
      const productId = Number(item.productId)
      const quantity = Number(item.quantity)
      const product = productsById.get(productId)

      if (!product) {
        throw new Error(`Product ${productId} was not found.`)
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error(`Product ${product.name} has an invalid quantity.`)
      }

      if (product.stock < quantity) {
        throw new Error(`Only ${product.stock} units left for ${product.name}.`)
      }

      total += product.price * quantity

      return {
        productId,
        quantity,
        unitPrice: product.price,
        productName: product.name,
        productImage: product.image,
      }
    })

    const paymentStatus = 'pending'
    const trackingMessage =
      paymentMethod === 'cod'
        ? 'Order placed. Payment will be collected on delivery.'
        : 'Order placed. Submit your payment confirmation to continue processing.'

    const orderResult = await client.query(
      `
        INSERT INTO orders (
          user_id,
          total,
          payment_method,
          payment_status,
          shipping_address,
          tracking_message,
          tracking_updated_at
        )
        VALUES ($1, $2, $3, $4, $5::jsonb, $6, CURRENT_TIMESTAMP)
        RETURNING
          id,
          status,
          total,
          payment_method,
          payment_status,
          payment_reference,
          payment_notes,
          payment_submitted_at,
          shipping_address,
          current_lat,
          current_lng,
          tracking_message,
          tracking_updated_at,
          created_at,
          updated_at
      `,
      [userId, total.toFixed(2), paymentMethod, paymentStatus, JSON.stringify(shippingAddress), trackingMessage],
    )

    const order = orderResult.rows[0]

    for (const item of normalizedItems) {
      await client.query(
        `
          INSERT INTO order_items (order_id, product_id, quantity, unit_price, product_name, product_image)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          order.id,
          item.productId,
          item.quantity,
          item.unitPrice.toFixed(2),
          item.productName,
          item.productImage,
        ],
      )

      await client.query(
        `
          UPDATE products
          SET stock = stock - $2,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `,
        [item.productId, item.quantity],
      )
    }

    await client.query('COMMIT')

    return {
      id: order.id,
      status: order.status,
      total: Number(order.total),
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      paymentReference: order.payment_reference || '',
      paymentNotes: order.payment_notes || '',
      paymentSubmittedAt: order.payment_submitted_at,
      payment: buildPayment(order),
      shippingAddress: order.shipping_address,
      tracking: buildTracking(order),
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: normalizedItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.unitPrice * item.quantity,
      })),
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

const findByUserId = async (userId) => {
  const result = await pool.query(
    `
      ${baseSelect}
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC, oi.id ASC
    `,
    [userId],
  )

  return groupOrders(result.rows)
}

const findAll = async () => {
  const result = await pool.query(
    `
      ${baseSelect},
      u.name AS customer_name,
      u.email AS customer_email
      FROM orders o
      JOIN users u ON u.id = o.user_id
      JOIN order_items oi ON oi.order_id = o.id
      ORDER BY o.created_at DESC, oi.id ASC
    `,
  )

  return groupOrders(result.rows)
}

const findById = async (id) => {
  const result = await pool.query(
    `
      ${baseSelect},
      u.name AS customer_name,
      u.email AS customer_email
      FROM orders o
      JOIN users u ON u.id = o.user_id
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id = $1
      ORDER BY oi.id ASC
    `,
    [id],
  )

  return groupOrders(result.rows)[0] || null
}

const findByIdForUser = async (id, userId) => {
  const result = await pool.query(
    `
      ${baseSelect}
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id = $1 AND o.user_id = $2
      ORDER BY oi.id ASC
    `,
    [id, userId],
  )

  return groupOrders(result.rows)[0] || null
}

const updateStatus = async (id, { status, paymentStatus }) => {
  const result = await pool.query(
    `
      UPDATE orders
      SET status = $2::varchar(20),
          payment_status = $3::varchar(30),
          tracking_message = CASE
            WHEN $2::text = 'processing' THEN 'Order is being prepared for dispatch.'
            WHEN $2::text = 'shipped' THEN
              CASE
                WHEN tracking_message IS NULL
                  OR tracking_message = ''
                  OR tracking_message = 'Order placed'
                  OR tracking_message = 'Order placed. Payment will be collected on delivery.'
                  OR tracking_message = 'Order placed. Submit your payment confirmation to continue processing.'
                THEN 'Order is out for delivery.'
                ELSE tracking_message
              END
            WHEN $2::text = 'delivered' THEN 'Order delivered successfully.'
            WHEN $2::text = 'cancelled' THEN 'Order was cancelled.'
            ELSE tracking_message
          END,
          tracking_updated_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `,
    [id, status, paymentStatus],
  )

  return result.rows[0] || null
}

const submitPaymentConfirmation = async ({ orderId, userId, reference, notes }) => {
  const result = await pool.query(
    `
      UPDATE orders
      SET payment_status = 'confirmation_submitted',
          payment_reference = $3::varchar(120),
          payment_notes = $4::text,
          payment_submitted_at = CURRENT_TIMESTAMP,
          tracking_message = 'Payment confirmation submitted. Awaiting admin verification.',
          tracking_updated_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
        AND user_id = $2
        AND payment_method IN ('card', 'upi')
      RETURNING id
    `,
    [orderId, userId, reference.trim(), notes.trim()],
  )

  return result.rows[0] || null
}

const updateTracking = async ({ orderId, trackingMessage, currentLat, currentLng }) => {
  const result = await pool.query(
    `
      UPDATE orders
      SET tracking_message = $2,
          current_lat = $3,
          current_lng = $4,
          tracking_updated_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `,
    [orderId, trackingMessage.trim(), currentLat, currentLng],
  )

  return result.rows[0] || null
}

module.exports = {
  create,
  findAll,
  findById,
  findByIdForUser,
  findByUserId,
  submitPaymentConfirmation,
  updateStatus,
  updateTracking,
}
