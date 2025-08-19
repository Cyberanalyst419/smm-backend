// src/config/supabase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // service role

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file.');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('✅ Supabase client initialized successfully');

module.exports = { supabaseAdmin };
