require('dotenv').config()

const { connectDB } = require('./config/db')
const Product = require('./models/Product')

const sampleProducts = [
  {
    name: 'Classic White Sneakers',
    price: 59.99,
    category: 'Footwear',
    description:
      'Clean everyday sneakers with cushioned comfort, sharp stitching, and a minimalist finish that pairs with nearly anything.',
    stock: 18,
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Minimal Black Backpack',
    price: 74.5,
    category: 'Accessories',
    description:
      'A structured daily backpack with smart storage, padded straps, and a matte-black profile for work or travel.',
    stock: 10,
    image:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Smart Casual Watch',
    price: 129.0,
    category: 'Accessories',
    description:
      'A polished watch designed to move between office hours and evenings out with understated style.',
    stock: 7,
    image:
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Comfort Cotton Hoodie',
    price: 42.75,
    category: 'Apparel',
    description:
      'Soft brushed cotton, relaxed structure, and all-day comfort for layering during cool mornings and late nights.',
    stock: 16,
    image:
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Everyday Sunglasses',
    price: 34.99,
    category: 'Accessories',
    description:
      'Lightweight frames with everyday protection and a balanced silhouette that works across casual looks.',
    stock: 12,
    image:
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Leather Office Bag',
    price: 98.0,
    category: 'Bags',
    description:
      'A refined office bag with a premium finish, dedicated document space, and durable everyday construction.',
    stock: 9,
    image:
      'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80',
  },
]

const seedProducts = async () => {
  try {
    await connectDB()
    await Product.deleteAll()
    await Product.insertMany(sampleProducts)
    console.log('Sample products added successfully.')
    process.exit(0)
  } catch (error) {
    console.error('Failed to seed products:', error.message)
    process.exit(1)
  }
}

seedProducts()
