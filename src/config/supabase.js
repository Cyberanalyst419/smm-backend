// src/config/supabase.js
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1); // Stop server if keys are missing
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Optional: simple test on startup
(async () => {
  const { data, error } = await supabaseAdmin.from('users').select('id').limit(1);
  if (error) console.error('❌ Supabase test query failed:', error.message);
  else console.log('✅ Supabase connected successfully');
})();

module.exports = { supabaseAdmin };
