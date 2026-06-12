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

const supabase = createClient(supabaseUrl, serviceKey);

async function run() {
  const module_id = 'ace42101-49e2-4171-9141-974f6b0bc9aa';
  const course_id = '194ae06c-f058-45cc-99db-ec40ab9cac0e';
  const title = 'Test Lesson Insertion';

  console.log('Inserting test lesson into Supabase database...');
  const { data, error } = await supabase
    .from('lessons')
    .insert({
      module_id,
      course_id,
      title,
      type: 'youtube',
      content_url: 'https://youtube.com',
      content_text: 'Hello content text',
      description: 'Hello description',
      duration_seconds: 120,
      order_index: 0,
      is_free_preview: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting lesson:', error);
  } else {
    console.log('Success! Inserted lesson:', data);
  }
}

run();
