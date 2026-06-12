import { NextResponse } from 'next/server';
import { getSession, canManageCourses } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('enrollments')
    .select('id, enrolled_at, amount_paid, status, user_profiles(name, email), courses(title)')
    .order('enrolled_at', { ascending: false })
    .limit(10);

  if (error) return NextResponse.json({ enrollments: [] });
  return NextResponse.json({ enrollments: data || [] });
}
