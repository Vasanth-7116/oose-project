require('dotenv').config()

const { connectDB } = require('./config/db')
const Review = require('./models/Review')

const sampleReviews = [
  // Classic White Sneakers (productId 1)
  { productId: 1, userId: 1, rating: 4.8, comment: 'Comfortable and stylish for daily wear' },
  { productId: 1, userId: 2, rating: 4.5, comment: 'Great value true to size' },
  { productId: 1, userId: 3, rating: 5.0, comment: 'Best sneakers Ive owned' },

  // Minimal Black Backpack (productId 2)
  { productId: 2, userId: 4, rating: 4.7, comment: 'Perfect for work and travel' },
  { productId: 2, userId: 5, rating: 4.6, comment: 'Lots of compartments' },

  // Smart Casual Watch (productId 3)
  { productId: 3, userId: 6, rating: 4.9, comment: 'Elegant design accurate time' },
  { productId: 3, userId: 7, rating: 4.8, comment: 'Premium feel' },

  // Comfort Cotton Hoodie (productId 4)
  { productId: 4, userId: 8, rating: 4.4, comment: 'Super soft material' },

  // Everyday Sunglasses (productId 5)
  { productId: 5, userId: 9, rating: 4.2, comment: 'Good UV protection' },

  // Leather Office Bag (productId 6)
  { productId: 6, userId: 10, rating: 4.9, comment: 'High quality leather' },

  // Wireless Earbuds (productId 7)
  { productId: 7, userId: 11, rating: 4.6, comment: 'Excellent sound quality' },

  // Table Lamp (productId 8)
  { productId: 8, userId: 12, rating: 4.3, comment: 'Nice warm light' },

  // Yoga Mat (productId 9)
  { productId: 9, userId: 13, rating: 4.7, comment: 'Great grip during yoga' },

  // Water Bottle (productId 10)
  { productId: 10, userId: 14, rating: 4.5, comment: 'Keeps water cold all day' },

  // Festive Kurta (productId 11)
  { productId: 11, userId: 15, rating: 4.1, comment: 'Comfortable fit' },

  // Runner Shoes (productId 12)
  { productId: 12, userId: 16, rating: 4.8, comment: 'Supportive for running' },
]

const seedReviews = async () => {
  try {
    await connectDB()

    const inserted = []
    for (const reviewData of sampleReviews) {
      const review = await Review.upsert(reviewData)
      inserted.push(review)
    }

    console.log(`Seeded ${inserted.length} sample reviews successfully.`)
    console.log('Top rated products now have averageRating >4.0')
    process.exit(0)
  } catch (error) {
    console.error('Failed to seed reviews:', error.message)
    process.exit(1)
  }
}

seedReviews()

