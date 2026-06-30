import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// GET /api/courses/[id]/enrollment-check
export async function GET(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ enrolled: false });

  const { data } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', session.userId)
    .eq('course_id', params.id)
    .eq('status', 'active')
    .single();

  if (!data) {
    return NextResponse.json({ enrolled: false });
  }

  // Fetch course progress
  const { data: progressData } = await supabase
    .from('course_progress')
    .select('percent_complete, lessons_completed, last_lesson_id')
    .eq('user_id', session.userId)
    .eq('course_id', params.id)
    .single();

  // Fetch completed lesson IDs
  const { data: completedLessons } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', session.userId)
    .eq('course_id', params.id)
    .eq('completed', true);

  // Fetch completed quizzes (any submitted attempt)
  const { data: passedAttempts } = await supabase
    .from('quiz_attempts')
    .select('quiz_id')
    .eq('user_id', session.userId);

  const progress = {
    percent_complete: progressData?.percent_complete || 0,
    lessons_completed: progressData?.lessons_completed || 0,
    completed_lessons_ids: completedLessons ? completedLessons.map(lp => lp.lesson_id) : [],
    passed_quiz_ids: passedAttempts ? passedAttempts.map(a => a.quiz_id) : []
  };

  return NextResponse.json({
    enrolled: true,
    progress
  });
}
