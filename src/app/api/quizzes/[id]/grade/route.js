import { NextResponse } from 'next/server';
import { getSession, canGrade } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// PUT /api/quizzes/[id]/grade
// Grade a subjective quiz attempt (Admin/Evaluator only)
export async function PUT(req, { params }) {
  const session = await getSession();
  if (!session || !canGrade(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { attempt_id, scores, feedback } = await req.json();

  if (!attempt_id || !scores) {
    return NextResponse.json({ error: 'attempt_id and scores are required' }, { status: 400 });
  }

  // 1. Fetch the attempt details
  const { data: attempt, error: attemptError } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('id', attempt_id)
    .single();

  if (attemptError || !attempt) {
    return NextResponse.json({ error: 'Quiz attempt not found' }, { status: 404 });
  }

  // 2. Fetch the quiz questions
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select(`
      *,
      questions:quiz_questions (*)
    `)
    .eq('id', attempt.quiz_id)
    .single();

  if (quizError || !quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
  }

  // 3. Compute final score
  let finalScore = 0;
  let totalMarks = 0;

  quiz.questions.forEach(q => {
    totalMarks += q.marks || 1;
    if (q.type === 'mcq') {
      // For MCQ, retrieve correct/incorrect from the original answers log
      const studentAnswer = attempt.answers[q.id];
      if (studentAnswer !== undefined && String(studentAnswer) === String(q.correct_answer)) {
        finalScore += q.marks || 1;
      }
    } else if (q.type === 'subjective') {
      // For Subjective, retrieve from the graded scores body
      const marksGiven = parseFloat(scores[q.id]) || 0;
      // Cap marks given to question's max marks
      finalScore += Math.min(marksGiven, q.marks || 1);
    }
  });

  const passScore = totalMarks * ((quiz.pass_score_percent || 60) / 100);
  const passed = finalScore >= passScore;

  // 4. Update attempt
  const { data: updatedAttempt, error: updateError } = await supabase
    .from('quiz_attempts')
    .update({
      score: finalScore,
      passed,
      status: 'graded',
      graded_by: session.userId,
      evaluator_feedback: feedback || null,
      graded_at: new Date().toISOString()
    })
    .eq('id', attempt_id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: 'Failed to save graded attempt' }, { status: 500 });
  }

  // Fetch student details to send notification email
  const { data: student } = await supabase
    .from('user_profiles')
    .select('name, email')
    .eq('user_id', attempt.user_id)
    .single();

  if (student) {
    try {
      const { sendGradedNotificationEmail } = await import('@/lib/mail');
      await sendGradedNotificationEmail({
        email: student.email,
        name: student.name,
        quizTitle: quiz.title,
        score: finalScore,
        totalMarks,
        passed,
        feedback
      });
    } catch (err) {
      console.error('Failed to dispatch grading email:', err);
    }
  }

  return NextResponse.json({
    success: true,
    attempt: updatedAttempt
  });
}
