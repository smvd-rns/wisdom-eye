import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// GET /api/quizzes/[id]/attempts
// Retrieve all previous quiz attempts for the logged-in student
export async function GET(req, { params }) {
  const { id: quizId } = params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: attempts, error } = await supabase
    .from('quiz_attempts')
    .select('id, score, total_marks, passed, status, attempt_number, submitted_at, graded_at, evaluator_feedback')
    .eq('user_id', session.userId)
    .eq('quiz_id', quizId)
    .order('submitted_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 });
  }

  return NextResponse.json({ attempts: attempts || [] });
}
