const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,            // limit max clients
  idleTimeoutMillis: 30000, // close idle clients after 30s
  connectionTimeoutMillis: 5000,
  family: 4
});

// Query wrapper
const query = (text, params) => pool.query(text, params);

// Test connection
(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Database connected at:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1); // exit if DB not available
  }
})();

module.exports = { query, pool };
