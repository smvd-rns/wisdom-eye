import { NextResponse } from 'next/server';
import { getSession, canManageCourses } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// POST /api/admin/quizzes/questions
// Bulk overwrite questions for a quiz
export async function POST(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { quiz_id, questions } = await req.json();

  if (!quiz_id || !Array.isArray(questions)) {
    return NextResponse.json({ error: 'quiz_id and questions array are required' }, { status: 400 });
  }

  // Verify the quiz exists
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('id')
    .eq('id', quiz_id)
    .single();

  if (quizError || !quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
  }

  // 1. Delete all existing questions for this quiz
  const { error: deleteError } = await supabase
    .from('quiz_questions')
    .delete()
    .eq('quiz_id', quiz_id);

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to clear existing questions' }, { status: 500 });
  }

  // If there are no questions to insert, we are done
  if (questions.length === 0) {
    return NextResponse.json({ success: true, count: 0 });
  }

  // 2. Insert new questions
  const questionsToInsert = questions.map((q, i) => ({
    quiz_id,
    question_text: q.question_text,
    type: q.type || 'mcq',
    options: q.options || null, // Array of strings e.g. ['A', 'B']
    correct_answer: q.correct_answer || null,
    explanation: q.explanation || '',
    marks: parseInt(q.marks) || 1,
    order_index: i
  }));

  const { data: inserted, error: insertError } = await supabase
    .from('quiz_questions')
    .insert(questionsToInsert)
    .select();

  if (insertError) {
    console.error('Bulk questions insert error:', insertError);
    return NextResponse.json({ error: 'Failed to insert questions' }, { status: 500 });
  }

  // Determine if quiz type has changed
  // If there are subjective questions, mark the quiz type as 'subjective' or 'mixed'
  const hasMcq = questions.some(q => q.type === 'mcq');
  const hasSubjective = questions.some(q => q.type === 'subjective');
  let quizType = 'mcq';
  if (hasMcq && hasSubjective) quizType = 'mixed';
  else if (hasSubjective) quizType = 'subjective';

  await supabase
    .from('quizzes')
    .update({ type: quizType })
    .eq('id', quiz_id);

  return NextResponse.json({
    success: true,
    questions: inserted,
    count: inserted.length
  });
}
