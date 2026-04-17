require('dotenv').config()

const { connectDB } = require('./config/db')
const Product = require('./models/Product')

const sampleProducts = [
  {
    name: 'Classic White Sneakers',
    price: 4999,
    category: 'Footwear',
    description:
      'Clean everyday sneakers with cushioned comfort, sharp stitching, and a minimalist finish that pairs with nearly anything.',
    stock: 18,
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Minimal Black Backpack',
    price: 6199,
    category: 'Accessories',
    description:
      'A structured daily backpack with smart storage, padded straps, and a matte-black profile for work or travel.',
    stock: 10,
    image:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Smart Casual Watch',
    price: 10999,
    category: 'Accessories',
    description:
      'A polished watch designed to move between office hours and evenings out with understated style.',
    stock: 7,
    image:
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Comfort Cotton Hoodie',
    price: 3599,
    category: 'Apparel',
    description:
      'Soft brushed cotton, relaxed structure, and all-day comfort for layering during cool mornings and late nights.',
    stock: 16,
    image:
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Everyday Sunglasses',
    price: 2899,
    category: 'Accessories',
    description:
      'Lightweight frames with everyday protection and a balanced silhouette that works across casual looks.',
    stock: 12,
    image:
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Leather Office Bag',
    price: 8499,
    category: 'Bags',
    description:
      'A refined office bag with a premium finish, dedicated document space, and durable everyday construction.',
    stock: 9,
    image:
      'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Wireless Noise-Canceling Earbuds',
    price: 6499,
    category: 'Electronics',
    description:
      'Compact earbuds with punchy sound, clear calls, and reliable battery life for commuting, work, and workouts.',
    stock: 14,
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Textured Ceramic Table Lamp',
    price: 3299,
    category: 'Home Decor',
    description:
      'A warm ambient lamp with a textured ceramic base and soft fabric shade for bedrooms, desks, or reading corners.',
    stock: 11,
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Performance Yoga Mat',
    price: 2199,
    category: 'Fitness',
    description:
      'High-grip cushioning and easy-roll portability for stretching, yoga flows, and home workouts.',
    stock: 20,
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Stainless Steel Water Bottle',
    price: 1199,
    category: 'Lifestyle',
    description:
      'Double-wall insulated bottle that keeps drinks cold for hours and fits easily into backpacks and car cup holders.',
    stock: 25,
    image:
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Printed Festive Kurta',
    price: 2799,
    category: 'Apparel',
    description:
      'A lightweight festive kurta with a tailored fit and subtle print that works for celebrations and family gatherings.',
    stock: 13,
    image:
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Runner Pro Sports Shoes',
    price: 5799,
    category: 'Footwear',
    description:
      'Breathable training shoes with responsive cushioning and stable support for daily runs and active routines.',
    stock: 15,
    image:
      'https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=900&q=80',
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
