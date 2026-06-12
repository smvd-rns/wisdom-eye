import { NextResponse } from 'next/server';
import { getSession, canManageCourses } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// GET /api/lessons/[id]
// Retrieve complete lesson details (including content_text/url) if authorized
export async function GET(req, { params }) {
  const { id: lessonId } = params;
  const session = await getSession();

  // 1. Fetch lesson details
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('*, courses(slug, has_certificate)')
    .eq('id', lessonId)
    .single();

  if (lessonError || !lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  // 2. Authorization check
  let isAuthorized = false;

  // Free preview bypasses check
  if (lesson.is_free_preview) {
    isAuthorized = true;
  } else {
    // If not a free preview, user must be logged in
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admins and course managers bypass check
    if (canManageCourses(session.role)) {
      isAuthorized = true;
    } else {
      // Check student enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', session.userId)
        .eq('course_id', lesson.course_id)
        .eq('status', 'active')
        .single();

      if (!enrollmentError && enrollment) {
        isAuthorized = true;
      }
    }
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
  }

  // 3. Fetch student's progress for this lesson if logged in
  let progress = { completed: false, watch_seconds: 0 };
  if (session) {
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('completed, watch_seconds')
      .eq('user_id', session.userId)
      .eq('lesson_id', lessonId)
      .single();

    if (progressData) {
      progress = progressData;
    }
  }

  return NextResponse.json({
    lesson,
    progress
  });
}
