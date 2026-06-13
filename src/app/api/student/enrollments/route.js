import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 1. Fetch active enrollments
  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select(`
      id, enrolled_at, amount_paid, status,
      courses (id, title, slug, thumbnail_url, category, total_lessons)
    `)
    .eq('user_id', session.userId)
    .eq('status', 'active')
    .order('enrolled_at', { ascending: false });

  if (enrollError) {
    console.error('Enrollments fetch error:', enrollError);
    return NextResponse.json({ error: 'Failed to fetch enrollments.' }, { status: 500 });
  }

  // 2. Fetch course progress for these courses
  const courseIds = enrollments.map(e => e.courses?.id).filter(Boolean);
  let progressMap = {};

  if (courseIds.length > 0) {
    const { data: progress, error: progressError } = await supabase
      .from('course_progress')
      .select('course_id, percent_complete, lessons_completed, last_lesson_id, completed_at')
      .eq('user_id', session.userId)
      .in('course_id', courseIds);

    if (progressError) {
      console.error('Progress fetch error:', progressError);
    } else if (progress) {
      progress.forEach(p => {
        progressMap[p.course_id] = p;
      });
    }
  }

  // 3. Merge progress into enrollments
  const mergedEnrollments = enrollments.map(e => ({
    ...e,
    course_progress: progressMap[e.courses?.id] || null
  }));

  return NextResponse.json({ enrollments: mergedEnrollments });
}
