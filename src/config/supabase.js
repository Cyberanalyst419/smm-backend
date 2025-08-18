// src/config/supabase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // use service role key

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file.');
  process.exit(1);
}

let supabaseAdmin;

try {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false } // disable session persistence on backend
  });
  console.log('✅ Supabase client initialized successfully');
} catch (err) {
  console.error('❌ Failed to initialize Supabase client:', err.message);
  process.exit(1);
}

module.exports = { supabaseAdmin };
