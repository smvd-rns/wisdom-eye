import { NextResponse } from 'next/server';
import { getSession, canManageCourses } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// GET /api/admin/quizzes/evaluators
// Fetches all eligible evaluators (staff) and the currently assigned evaluator user IDs for a given quiz
export async function GET(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const quizId = searchParams.get('quiz_id');

  if (!quizId) {
    return NextResponse.json({ error: 'quiz_id parameter is required' }, { status: 400 });
  }

  // 1. Fetch all users with staff roles (admin, superadmin, evaluator, course_builder)
  const { data: staffList, error: staffError } = await supabase
    .from('user_profiles')
    .select('user_id, name, email, role')
    .in('role', ['superadmin', 'admin', 'course_builder', 'evaluator'])
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (staffError) {
    console.error('Error fetching staff list:', staffError);
    return NextResponse.json({ error: 'Failed to fetch eligible evaluators' }, { status: 500 });
  }

  // 2. Fetch assigned evaluators for this specific quiz
  const { data: assignments, error: assignError } = await supabase
    .from('quiz_evaluators')
    .select('evaluator_user_id')
    .eq('quiz_id', quizId);

  if (assignError) {
    console.error('Error fetching assignments:', assignError);
    return NextResponse.json({ error: 'Failed to fetch assigned evaluators' }, { status: 500 });
  }

  const assignedEvaluatorIds = assignments.map(a => a.evaluator_user_id);

  return NextResponse.json({
    allEvaluators: staffList || [],
    assignedEvaluatorIds
  });
}

// POST /api/admin/quizzes/evaluators
// Overwrites assignments for a given quiz with the provided list of evaluator user IDs
export async function POST(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { quiz_id, evaluator_user_ids } = await req.json();

  if (!quiz_id || !Array.isArray(evaluator_user_ids)) {
    return NextResponse.json({ error: 'quiz_id and evaluator_user_ids array are required' }, { status: 400 });
  }

  // 1. Delete all existing assignments for this quiz
  const { error: deleteError } = await supabase
    .from('quiz_evaluators')
    .delete()
    .eq('quiz_id', quiz_id);

  if (deleteError) {
    console.error('Error clearing old assignments:', deleteError);
    return NextResponse.json({ error: 'Failed to update evaluator assignments' }, { status: 500 });
  }

  // 2. Insert new assignments if any are selected
  if (evaluator_user_ids.length > 0) {
    const recordsToInsert = evaluator_user_ids.map(userId => ({
      quiz_id,
      evaluator_user_id: userId,
      assigned_by: session.userId
    }));

    const { error: insertError } = await supabase
      .from('quiz_evaluators')
      .insert(recordsToInsert);

    if (insertError) {
      console.error('Error inserting new assignments:', insertError);
      return NextResponse.json({ error: 'Failed to save evaluator assignments' }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
