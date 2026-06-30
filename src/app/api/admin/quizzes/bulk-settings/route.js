import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// POST /api/admin/quizzes/bulk-settings
// Bulk-update show_correct_answers on all quizzes in a course
export async function POST(req) {
  const session = await getSession();
  if (!session || !['superadmin', 'admin', 'course_builder'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { course_id, show_correct_answers } = await req.json();

  if (!course_id) {
    return NextResponse.json({ error: 'course_id is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('quizzes')
    .update({ show_correct_answers: Boolean(show_correct_answers) })
    .eq('course_id', course_id);

  if (error) {
    console.error('Bulk quiz update error:', error);
    return NextResponse.json({ error: 'Failed to update quizzes' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
