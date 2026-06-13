import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// GET /api/quizzes/[id]
// Get a single quiz for student (omits correct_answers to prevent cheating)
export async function GET(req, { params }) {
  const { id: quizId } = params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Fetch quiz details with questions (specifically omitting correct_answer)
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select(`
      *,
      questions:quiz_questions (
        id, quiz_id, question_text, type, options, marks, order_index, created_at
      )
    `)
    .eq('id', quizId)
    .single();

  if (quizError || !quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
  }

  // 2. Check student enrollment in the course
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', session.userId)
    .eq('course_id', quiz.course_id)
    .eq('status', 'active')
    .single();

  // If not admin/staff AND not enrolled in the course, deny access
  const isStaffUser = ['superadmin', 'admin', 'course_builder', 'evaluator'].includes(session.role);
  if (!isStaffUser && (enrollmentError || !enrollment)) {
    return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
  }

  // Sort questions by order_index
  if (quiz.questions) {
    quiz.questions.sort((a, b) => a.order_index - b.order_index);
  }

  return NextResponse.json({ quiz });
}
