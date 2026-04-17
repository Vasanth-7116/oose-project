const { connectDB, pool } = require('./db');

const migrate = async () => {
  await connectDB();
  try {
    // Align payment columns with the current application values.
    await pool.query(`
      ALTER TABLE orders 
      ALTER COLUMN payment_status TYPE VARCHAR(30),
      ALTER COLUMN payment_reference TYPE VARCHAR(120),
      ALTER COLUMN payment_notes TYPE TEXT;
    `);
    console.log('✅ Payment columns migrated: reference=VARCHAR(120), notes=TEXT');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await pool.end();
  }
};

migrate();
