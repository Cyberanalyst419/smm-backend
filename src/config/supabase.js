// src/config/supabase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // server side key

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('✅ Supabase admin client initialized successfully');

module.exports = supabase; // <-- export the client directly
