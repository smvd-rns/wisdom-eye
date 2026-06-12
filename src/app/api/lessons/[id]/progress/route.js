import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// GET /api/lessons/[id]/progress
// Retrieve progress for a specific lesson
export async function GET(req, { params }) {
  const { id: lessonId } = params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: progress, error } = await supabase
    .from('lesson_progress')
    .select('completed, watch_seconds, last_accessed_at, completed_at')
    .eq('user_id', session.userId)
    .eq('lesson_id', lessonId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is code for no rows found
    return NextResponse.json({ error: 'Failed to fetch lesson progress' }, { status: 500 });
  }

  return NextResponse.json({
    progress: progress || { completed: false, watch_seconds: 0 }
  });
}

// POST /api/lessons/[id]/progress
// Update progress for a lesson and update course progress
export async function POST(req, { params }) {
  const { id: lessonId } = params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { completed, watch_seconds } = await req.json();

  // 1. Get lesson details to check which course it belongs to
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('course_id')
    .eq('id', lessonId)
    .single();

  if (lessonError || !lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  const courseId = lesson.course_id;

  // 2. Check if user is enrolled in this course
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', session.userId)
    .eq('course_id', courseId)
    .eq('status', 'active')
    .single();

  if (enrollmentError || !enrollment) {
    return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
  }

  // 3. Upsert lesson progress
  const now = new Date().toISOString();
  const { error: upsertError } = await supabase
    .from('lesson_progress')
    .upsert({
      user_id: session.userId,
      lesson_id: lessonId,
      course_id: courseId,
      completed: !!completed,
      watch_seconds: parseInt(watch_seconds) || 0,
      last_accessed_at: now,
      completed_at: completed ? now : null
    }, { onConflict: 'user_id,lesson_id' });

  if (upsertError) {
    return NextResponse.json({ error: 'Failed to update lesson progress' }, { status: 500 });
  }

  // 4. Calculate total lessons in course
  const { count: totalLessons, error: countError } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);

  if (countError) {
    return NextResponse.json({ error: 'Failed to count lessons' }, { status: 500 });
  }

  // 5. Calculate completed lessons in course
  const { count: completedLessons, error: completedCountError } = await supabase
    .from('lesson_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.userId)
    .eq('course_id', courseId)
    .eq('completed', true);

  if (completedCountError) {
    return NextResponse.json({ error: 'Failed to count completed lessons' }, { status: 500 });
  }

  const percentComplete = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const isFinished = percentComplete >= 100;

  // 6. Check existing course progress to preserve certificate_issued values
  const { data: existingProgress } = await supabase
    .from('course_progress')
    .select('certificate_issued, certificate_issued_at, completed_at')
    .eq('user_id', session.userId)
    .eq('course_id', courseId)
    .single();

  // 7. Upsert course progress
  const completedAt = isFinished ? (existingProgress?.completed_at || now) : null;

  const { error: progressError } = await supabase
    .from('course_progress')
    .upsert({
      user_id: session.userId,
      course_id: courseId,
      lessons_completed: completedLessons,
      total_lessons: totalLessons,
      percent_complete: percentComplete,
      last_lesson_id: lessonId,
      completed_at: completedAt,
      last_accessed_at: now,
      certificate_issued: existingProgress?.certificate_issued || false,
      certificate_issued_at: existingProgress?.certificate_issued_at || null
    }, { onConflict: 'user_id,course_id' });

  if (progressError) {
    return NextResponse.json({ error: 'Failed to update course progress' }, { status: 500 });
  }

  // If completed course for the first time, send completion email
  if (isFinished && !existingProgress?.completed_at) {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('name, email')
        .eq('user_id', session.userId)
        .single();
      const { data: course } = await supabase
        .from('courses')
        .select('title')
        .eq('id', courseId)
        .single();

      if (profile && course) {
        const { sendCompletionNotificationEmail } = await import('@/lib/mail');
        await sendCompletionNotificationEmail({
          email: profile.email,
          name: profile.name,
          courseTitle: course.title
        });
      }
    } catch (err) {
      console.error('Failed to dispatch completion email:', err);
    }
  }

  return NextResponse.json({
    success: true,
    progress: {
      completed: !!completed,
      watch_seconds: parseInt(watch_seconds) || 0,
      percent_complete: percentComplete,
      lessons_completed: completedLessons,
      total_lessons: totalLessons
    }
  });
}
