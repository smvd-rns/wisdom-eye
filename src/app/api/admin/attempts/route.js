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
