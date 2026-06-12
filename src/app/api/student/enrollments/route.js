import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select(`
      id, enrolled_at, amount_paid, status,
      courses (id, title, slug, thumbnail_url, category, total_lessons),
      course_progress (percent_complete, lessons_completed, last_lesson_id, completed_at)
    `)
    .eq('user_id', session.userId)
    .eq('status', 'active')
    .order('enrolled_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch enrollments.' }, { status: 500 });
  }

  return NextResponse.json({ enrollments: enrollments || [] });
}
