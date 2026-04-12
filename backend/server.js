require('dotenv').config()

const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { connectDB } = require('./config/db')
const User = require('./models/User')
const Product = require('./models/Product')
const Order = require('./models/Order')
const Review = require('./models/Review')
const { protect, adminOnly } = require('./middleware/authMiddleware')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const issueToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  )

const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  savedAddresses: user.savedAddresses,
})

app.get('/', (req, res) => {
  res.send('Backend server is running.')
})

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' })
    }

    const existingUser = await User.findByEmail(email)

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    })

    const token = issueToken(user)

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: serializeUser(user),
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const user = await User.findByEmail(email)

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' })
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Use the admin login page for administrator access.' })
    }

    const token = issueToken(user)

    res.json({
      message: 'Login successful.',
      token,
      user: serializeUser(user),
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const user = await User.findByEmail(email)

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' })
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'This login page is only for administrators.' })
    }

    const token = issueToken(user)

    res.json({
      message: 'Admin login successful.',
      token,
      user: serializeUser(user),
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

app.get('/api/products', async (req, res) => {
  try {
    const { q = '', category = '', sort = 'newest' } = req.query
    const products = await Product.findAll({ query: q, category, sort })
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

app.get('/api/products/meta/categories', async (req, res) => {
  try {
    const categories = await Product.findCategories()
    res.json(categories)
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' })
    }

    const reviews = await Review.findByProductId(req.params.id)
    res.json({
      ...product,
      reviews,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

app.post('/api/products/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' })
    }

    if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5 || !String(comment || '').trim()) {
      return res.status(400).json({ message: 'A rating between 1 and 5 and a comment are required.' })
    }

    const review = await Review.upsert({
      productId: req.params.id,
      userId: req.user.id,
      rating: Number(rating),
      comment: String(comment),
    })

    res.status(201).json({
      message: 'Review saved successfully.',
      review,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

app.post('/api/products', protect, adminOnly, async (req, res) => {
  try {
    const { name, price, image, category, description, stock } = req.body

    if (!name || price === undefined || !image || !category || !description || stock === undefined) {
      return res.status(400).json({ message: 'Name, price, image, category, description, and stock are required.' })
    }

    if (!Number.isFinite(Number(price)) || !Number.isFinite(Number(stock)) || Number(price) < 0 || Number(stock) < 0) {
      return res.status(400).json({ message: 'Price and stock must be zero or greater.' })
    }

    const product = await Product.create({
      name,
      price,
      image,
      category,
      description,
      stock,
    })

    res.status(201).json({
      message: 'Product created successfully.',
      product,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

app.put('/api/products/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, price, image, category, description, stock } = req.body

    if (!name || price === undefined || !image || !category || !description || stock === undefined) {
      return res.status(400).json({ message: 'Name, price, image, category, description, and stock are required.' })
    }

    if (!Number.isFinite(Number(price)) || !Number.isFinite(Number(stock)) || Number(price) < 0 || Number(stock) < 0) {
      return res.status(400).json({ message: 'Price and stock must be zero or greater.' })
    }

    const product = await Product.updateById(req.params.id, {
      name,
      price,
      image,
      category,
      description,
      stock,
    })

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' })
    }

    res.json({
      message: 'Product updated successfully.',
      product,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

app.post('/api/orders', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one cart item is required.' })
    }

    if (!['cod', 'card', 'upi'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'A valid payment method is required.' })
    }

    const requiredAddressFields = ['fullName', 'addressLine1', 'city', 'postalCode', 'country']
    const hasMissingField = requiredAddressFields.some(
      (field) => !shippingAddress || !String(shippingAddress[field] || '').trim(),
    )

    if (hasMissingField) {
      return res.status(400).json({ message: 'Complete shipping details are required.' })
    }

    const order = await Order.create({
      userId: req.user.id,
      items,
      paymentMethod,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        addressLine2: String(shippingAddress.addressLine2 || '').trim(),
        city: shippingAddress.city.trim(),
        postalCode: shippingAddress.postalCode.trim(),
        country: shippingAddress.country.trim(),
      },
    })

    res.status(201).json({
      message: 'Order placed successfully.',
      order,
    })
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to place order.' })
  }
})

app.get('/api/orders/my', protect, async (req, res) => {
  try {
    const orders = await Order.findByUserId(req.user.id)
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

app.post('/api/orders/:id/payment-confirmation', protect, async (req, res) => {
  try {
    console.log('Payment confirmation request:', { orderId: req.params.id, userId: req.user?.id, body: req.body });
    const { reference = '', notes = '' } = req.body
    const order = await Order.findByIdForUser(req.params.id, req.user.id)
    console.log('Found order:', order ? 'YES' : 'NO', order);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' })
    }

    if (!['card', 'upi'].includes(order.paymentMethod)) {
      return res.status(400).json({ message: 'Payment confirmation is only needed for card or UPI orders.' })
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'This order is already marked as paid.' })
    }

    if (!String(reference).trim()) {
      return res.status(400).json({ message: 'A payment reference is required.' })
    }

    const updated = await Order.submitPaymentConfirmation({
      orderId: req.params.id,
      userId: req.user.id,
      reference: String(reference),
      notes: String(notes || ''),
    })
    console.log('Update result:', updated);

    if (!updated) {
      return res.status(400).json({ message: 'Unable to submit payment confirmation for this order.' })
    }

    const refreshedOrder = await Order.findByIdForUser(req.params.id, req.user.id)

    res.json({
      message: 'Payment confirmation submitted successfully.',
      order: refreshedOrder,
    })
  } catch (error) {
    console.error('Payment confirmation ERROR:', error);
    res.status(500).json({ message: 'Server error: ' + error.message })
  }
})

app.get('/api/admin/orders', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.findAll()
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

app.put('/api/admin/orders/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body

    if (!['placed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'A valid order status is required.' })
    }

    if (!['pending', 'confirmation_submitted', 'paid'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'A valid payment status is required.' })
    }

    const updated = await Order.updateStatus(req.params.id, { status, paymentStatus })

    if (!updated) {
      return res.status(404).json({ message: 'Order not found.' })
    }

    const orders = await Order.findAll()
    const order = orders.find((entry) => Number(entry.id) === Number(req.params.id))

    res.json({
      message: 'Order updated successfully.',
      order,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

app.put('/api/admin/orders/:id/tracking', protect, adminOnly, async (req, res) => {
  try {
    const { trackingMessage, currentLat, currentLng } = req.body

    if (!String(trackingMessage || '').trim()) {
      return res.status(400).json({ message: 'A tracking message is required.' })
    }

    if (
      currentLat === undefined ||
      currentLng === undefined ||
      !Number.isFinite(Number(currentLat)) ||
      !Number.isFinite(Number(currentLng))
    ) {
      return res.status(400).json({ message: 'Valid latitude and longitude are required.' })
    }

    const updated = await Order.updateTracking({
      orderId: req.params.id,
      trackingMessage: String(trackingMessage),
      currentLat: Number(currentLat),
      currentLng: Number(currentLng),
    })

    if (!updated) {
      return res.status(404).json({ message: 'Order not found.' })
    }

    const order = await Order.findById(req.params.id)

    res.json({
      message: 'Tracking updated successfully.',
      order,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

app.get('/api/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      savedAddresses: user.savedAddresses,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

app.put('/api/profile', protect, async (req, res) => {
  try {
    const { name, phone, savedAddresses } = req.body

    if (!String(name || '').trim()) {
      return res.status(400).json({ message: 'Name is required.' })
    }

    if (!Array.isArray(savedAddresses)) {
      return res.status(400).json({ message: 'Saved addresses must be an array.' })
    }

    const normalizedAddresses = savedAddresses.map((address) => ({
      label: String(address.label || '').trim(),
      fullName: String(address.fullName || '').trim(),
      addressLine1: String(address.addressLine1 || '').trim(),
      addressLine2: String(address.addressLine2 || '').trim(),
      city: String(address.city || '').trim(),
      postalCode: String(address.postalCode || '').trim(),
      country: String(address.country || '').trim(),
    }))

    const invalidAddress = normalizedAddresses.some(
      (address) =>
        !address.label ||
        !address.fullName ||
        !address.addressLine1 ||
        !address.city ||
        !address.postalCode ||
        !address.country,
    )

    if (invalidAddress) {
      return res.status(400).json({ message: 'Each saved address must be complete.' })
    }

    const user = await User.updateProfile(req.user.id, {
      name: String(name),
      phone: phone ? String(phone) : '',
      savedAddresses: normalizedAddresses,
    })

    res.json({
      message: 'Profile updated successfully.',
      user: serializeUser(user),
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

app.delete('/api/products/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.deleteById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' })
    }

    res.json({ message: 'Product deleted successfully.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

const startServer = async () => {
  try {
    await connectDB()

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()
