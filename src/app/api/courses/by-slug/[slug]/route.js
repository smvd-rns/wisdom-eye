import { NextResponse } from 'next/server';
import { getSession, canManageCourses } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export async function GET(req, { params }) {
  const { slug } = params;
  const session = await getSession();

  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      *,
      modules (
        id, title, description, order_index,
        lessons (id, title, type, content_url, content_text, duration_seconds, order_index, is_free_preview, description),
        quizzes (id, title, description, type, pass_score_percent, time_limit_mins, max_attempts, order_index)
      )
    `)
    .eq('slug', slug)
    .single();

  if (error || !course) return NextResponse.json({ error: 'Course not found.' }, { status: 404 });

  if (course.status !== 'published' && (!session || !canManageCourses(session.role))) {
    return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
  }

  if (course.modules) {
    course.modules.sort((a, b) => a.order_index - b.order_index);
    course.modules.forEach(m => {
      if (m.lessons) m.lessons.sort((a, b) => a.order_index - b.order_index);
      if (m.quizzes) m.quizzes.sort((a, b) => a.order_index - b.order_index);
    });
  }

  return NextResponse.json({ course });
}
