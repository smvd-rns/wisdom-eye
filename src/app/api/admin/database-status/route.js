import { NextResponse } from 'next/server';
import { getSession, canManageCourses } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const tables = ['user_profiles', 'courses', 'packages', 'package_courses', 'enrollments', 'lms_payments', 'settings'];
  const status = {};

  await Promise.all(
    tables.map(async (table) => {
      try {
        // Query the first row from the table to see if it exists
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          // Postgres error code '42P01' is undefined_table
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            status[table] = { exists: false, error: error.message };
          } else {
            // If it exists but returns RLS or another error, it still exists
            status[table] = { exists: true, error: error.message };
          }
        } else {
          status[table] = { exists: true };
        }
      } catch (err) {
        status[table] = { exists: false, error: err.message };
      }
    })
  );

  return NextResponse.json({ success: true, status });
}
