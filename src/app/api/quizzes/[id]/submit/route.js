import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// POST /api/quizzes/[id]/submit
// Submit a quiz attempt
export async function POST(req, { params }) {
  const { id: quizId } = params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { answers } = await req.json();
  if (!answers) {
    return NextResponse.json({ error: 'Answers are required' }, { status: 400 });
  }

  // 1. Fetch quiz & questions
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select(`
      *,
      questions:quiz_questions (*)
    `)
    .eq('id', quizId)
    .single();

  if (quizError || !quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
  }

  // 2. Check enrollment in course
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', session.userId)
    .eq('course_id', quiz.course_id)
    .eq('status', 'active')
    .single();

  if (enrollmentError || !enrollment) {
    return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
  }

  // 3. Count past attempts
  const { count: pastAttempts } = await supabase
    .from('quiz_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.userId)
    .eq('quiz_id', quizId);

  const attemptNumber = (pastAttempts || 0) + 1;
  if (quiz.max_attempts && attemptNumber > quiz.max_attempts) {
    return NextResponse.json({ error: 'Maximum attempts limit reached for this quiz' }, { status: 400 });
  }

  // 4. Calculate score
  let studentScore = 0;
  let totalMarks = 0;
  let hasSubjective = false;

  quiz.questions.forEach(q => {
    totalMarks += q.marks || 1;
    if (q.type === 'mcq') {
      const studentAnswer = answers[q.id];
      if (studentAnswer !== undefined && String(studentAnswer) === String(q.correct_answer)) {
        studentScore += q.marks || 1;
      }
    } else if (q.type === 'subjective') {
      hasSubjective = true;
    }
  });

  const passScore = totalMarks * ((quiz.pass_score_percent || 60) / 100);
  const passed = !hasSubjective && studentScore >= passScore;
  const status = hasSubjective ? 'pending_grade' : 'auto_graded';

  // 5. Save attempt
  const { data: attempt, error: insertError } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: session.userId,
      quiz_id: quizId,
      answers,
      score: studentScore,
      total_marks: totalMarks,
      passed,
      status,
      attempt_number: attemptNumber,
      submitted_at: new Date().toISOString()
    })
    .select()
    .single();

  if (insertError) {
    console.error('Quiz attempt save error:', insertError);
    return NextResponse.json({ error: 'Failed to submit quiz attempt' }, { status: 500 });
  }

  return NextResponse.json({
    attempt,
    quiz: {
      id: quiz.id,
      title: quiz.title,
      type: quiz.type,
      show_correct_answers: quiz.show_correct_answers,
      pass_score_percent: quiz.pass_score_percent,
      questions: quiz.show_correct_answers ? quiz.questions : null
    }
  });
}
