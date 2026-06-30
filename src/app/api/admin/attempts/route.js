import { NextResponse } from 'next/server';
import { getSession, canGrade } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// GET /api/admin/attempts
// List attempts requiring grading, or load a specific attempt
export async function GET(req) {
  const session = await getSession();
  if (!session || !canGrade(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const attemptId = searchParams.get('id');
  const courseId = searchParams.get('course_id');
  const status = searchParams.get('status'); // e.g. pending_grade

  if (attemptId) {
    // 1. Fetch single attempt
    const { data: attempt, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', attemptId)
      .single();

    if (error || !attempt) {
      return NextResponse.json({ error: 'Quiz attempt not found' }, { status: 404 });
    }

    // Verify ownership of the quiz/course before showing single attempt
    if (session.role !== 'superadmin') {
      const { data: courseCheck } = await supabase
        .from('quizzes')
        .select('courses(organization_id)')
        .eq('id', attempt.quiz_id)
        .single();
      if (!courseCheck || courseCheck.courses?.organization_id !== session.organizationId) {
        return NextResponse.json({ error: 'Unauthorized: Attempt belongs to another organization.' }, { status: 403 });
      }
    }

    // 2. Fetch quiz and questions details
    const { data: quiz } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions:quiz_questions (*)
      `)
      .eq('id', attempt.quiz_id)
      .single();

    if (quiz?.questions) {
      quiz.questions.sort((a, b) => a.order_index - b.order_index);
    }

    // 3. Fetch student profile
    const { data: student } = await supabase
      .from('user_profiles')
      .select('name, email')
      .eq('user_id', attempt.user_id)
      .single();

    return NextResponse.json({
      attempt,
      quiz,
      student: student || { name: 'Unknown Student', email: '' }
    });
  }

  // Fetch organization course IDs to filter attempts listing
  let orgCourseIds = [];
  if (session.role !== 'superadmin') {
    const { data: orgCourses } = await supabase
      .from('courses')
      .select('id')
      .eq('organization_id', session.organizationId);
    orgCourseIds = orgCourses?.map(c => c.id) || [];
  }

  // Listing query builder
  let query = supabase.from('quiz_attempts').select(`
    id, user_id, quiz_id, score, total_marks, passed, status, attempt_number, submitted_at,
    quizzes (title, course_id, courses(title))
  `);

  if (status) {
    query = query.eq('status', status);
  }

  const { data: attempts, error } = await query.order('submitted_at', { ascending: false });
  if (error) {
    console.error('List attempts error:', error);
    return NextResponse.json({ error: 'Failed to fetch attempts list' }, { status: 500 });
  }

  // Filter in memory by organization courses and optionally by courseId
  let filteredAttempts = attempts || [];
  if (session.role !== 'superadmin') {
    filteredAttempts = filteredAttempts.filter(a => orgCourseIds.includes(a.quizzes?.course_id));
  }
  if (courseId) {
    filteredAttempts = filteredAttempts.filter(a => a.quizzes?.course_id === courseId);
  }

  // Get all user ids
  const userIds = [...new Set(filteredAttempts.map(a => a.user_id))];
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, name, email')
    .in('user_id', userIds);

  const profileMap = {};
  profiles?.forEach(p => {
    profileMap[p.user_id] = p;
  });

  const finalAttempts = filteredAttempts.map(a => ({
    ...a,
    student: profileMap[a.user_id] || { name: 'Unknown Student', email: '' }
  }));

  return NextResponse.json({ attempts: finalAttempts });
}

// DELETE /api/admin/attempts?id=<attemptId>
// Delete a quiz attempt so the student can re-take the quiz
export async function DELETE(req) {
  const session = await getSession();
  if (!session || !canGrade(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const attemptId = searchParams.get('id');

  if (!attemptId) {
    return NextResponse.json({ error: 'Attempt id is required' }, { status: 400 });
  }

  // Fetch attempt with user_id so we can reset progress afterwards
  const { data: attempt, error: fetchError } = await supabase
    .from('quiz_attempts')
    .select('id, quiz_id, user_id')
    .eq('id', attemptId)
    .single();

  if (fetchError || !attempt) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }

  // Org check for non-superadmins
  if (session.role !== 'superadmin') {
    const { data: quizCheck } = await supabase
      .from('quizzes')
      .select('courses(organization_id)')
      .eq('id', attempt.quiz_id)
      .single();
    if (!quizCheck || quizCheck.courses?.organization_id !== session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized: Attempt belongs to another organization.' }, { status: 403 });
    }
  }

  // Get the quiz's linked lesson_id (if any) so we can reset only that lesson's progress
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('lesson_id, course_id')
    .eq('id', attempt.quiz_id)
    .single();

  // Delete ONLY this attempt row
  const { error: deleteError } = await supabase
    .from('quiz_attempts')
    .delete()
    .eq('id', attemptId);

  if (deleteError) {
    console.error('Delete attempt error:', deleteError);
    return NextResponse.json({ error: 'Failed to delete attempt' }, { status: 500 });
  }

  // After deletion: check if student has any remaining passing attempt for this quiz
  const { data: passingAttempts } = await supabase
    .from('quiz_attempts')
    .select('id')
    .eq('quiz_id', attempt.quiz_id)
    .eq('user_id', attempt.user_id)
    .eq('passed', true)
    .limit(1);

  const stillPassed = passingAttempts && passingAttempts.length > 0;

  // If no passing attempt remains AND quiz has a linked lesson, mark that lesson as incomplete
  // This resets ONLY the quiz's own lesson_progress row — all other lessons remain untouched
  if (!stillPassed && quiz?.lesson_id) {
    await supabase
      .from('lesson_progress')
      .update({ completed: false, completed_at: null })
      .eq('user_id', attempt.user_id)
      .eq('lesson_id', quiz.lesson_id);

    // Also recalculate course_progress for this student (re-count completed lessons)
    if (quiz?.course_id) {
      const { count: completedLessons } = await supabase
        .from('lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', attempt.user_id)
        .eq('course_id', quiz.course_id)
        .eq('completed', true);

      const { count: totalLessons } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', quiz.course_id);

      const percentComplete = totalLessons > 0 ? ((completedLessons || 0) / totalLessons) * 100 : 0;

      await supabase
        .from('course_progress')
        .update({
          lessons_completed: completedLessons || 0,
          percent_complete: percentComplete,
          completed_at: percentComplete >= 100 ? new Date().toISOString() : null,
        })
        .eq('user_id', attempt.user_id)
        .eq('course_id', quiz.course_id);
    }
  }

  return NextResponse.json({ success: true });
}
