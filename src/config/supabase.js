// src/config/supabase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for server

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file.');
}

let supabase;

try {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('✅ Supabase admin client initialized successfully');
} catch (err) {
  console.error('❌ Failed to initialize Supabase client:', err.message);
}

module.exports = supabase;
