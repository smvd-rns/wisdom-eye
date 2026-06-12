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
      // Remove surrounding quotes if any
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1);
      }
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

// 2. Parse arguments
const email = process.argv[2];
const role = process.argv[3] || 'superadmin';

if (!email) {
  console.log('\nUsage: node promote.js <email> [role]');
  console.log('Available roles: superadmin, admin, course_builder, evaluator, student\n');
  process.exit(1);
}

const allowedRoles = ['superadmin', 'admin', 'course_builder', 'evaluator', 'student'];
if (!allowedRoles.includes(role)) {
  console.error(`Error: Invalid role "${role}". Must be one of: ${allowedRoles.join(', ')}`);
  process.exit(1);
}

// 3. Initialize Supabase client
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function run() {
  const cleanEmail = email.toLowerCase().trim();
  console.log(`Searching for user with email: ${cleanEmail}...`);

  // Find the user profile
  const { data: user, error: fetchError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', cleanEmail)
    .maybeSingle();

  if (fetchError) {
    console.error('Error querying database:', fetchError);
    process.exit(1);
  }

  if (!user) {
    console.error(`Error: No user found with email "${cleanEmail}". Make sure they have registered/logged in first.`);
    process.exit(1);
  }

  console.log(`Found user: "${user.name}" (ID: ${user.user_id}) currently having role "${user.role}".`);
  console.log(`Promoting/updating role to "${role}"...`);

  // Update role
  const { data: updated, error: updateError } = await supabase
    .from('user_profiles')
    .update({ role: role })
    .eq('email', cleanEmail)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating user role:', updateError);
    process.exit(1);
  }

  console.log(`Success! User "${updated.name}" role updated successfully to "${updated.role}".`);
}

run();
