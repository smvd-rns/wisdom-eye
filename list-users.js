const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Load .env.local manually
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      process.env[key] = val;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

// 2. Initialize Supabase client
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function run() {
  console.log('Fetching all registered users from database...');
  const { data: users, error } = await supabase
    .from('user_profiles')
    .select('id, user_id, name, email, role, is_active, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    process.exit(1);
  }

  if (users.length === 0) {
    console.log('No users found in user_profiles.');
    return;
  }

  console.log('\n--- REGISTERED USERS ---');
  console.table(users.map(u => ({
    Name: u.name,
    Email: u.email,
    Role: u.role,
    Status: u.is_active ? 'Active' : 'Deactivated',
    Created: u.created_at
  })));
  console.log('\nUse "node promote.js <email> [role]" to change any user\'s role.');
}

run();
