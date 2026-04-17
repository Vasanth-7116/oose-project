require('dotenv').config()

const { connectDB } = require('./config/db')
const User = require('./models/User')
const bcrypt = require('bcryptjs')

const sampleUsers = [
  { name: 'John Doe', email: 'john@example.com', password: 'password123', role: 'user' },
  { name: 'Jane Smith', email: 'jane@example.com', password: 'password123', role: 'user' },
  { name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin' },
]

const seedUsers = async () => {
  try {
    await connectDB()

    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      await User.create({
        ...userData,
        password: hashedPassword,
      })
    }

    console.log('Seeded sample users successfully.')
    process.exit(0)
  } catch (error) {
    console.error('Failed to seed users:', error.message)
    process.exit(1)
  }
}

seedUsers()

