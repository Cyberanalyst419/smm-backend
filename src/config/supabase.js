// src/config/supabase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Server-side (Service Role) credentials
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file.');
  process.exit(1); // stop server if credentials missing
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('✅ Supabase admin client initialized successfully');

module.exports = supabase; // export client directly
