const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // use service role

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file.');
}

let supabaseAdmin;

try {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('✅ Supabase admin client initialized successfully');
} catch (err) {
  console.error('❌ Failed to initialize Supabase client:', err.message);
}

module.exports = { supabaseAdmin };
