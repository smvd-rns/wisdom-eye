import { NextResponse } from 'next/server';
import { getSession, canManageCourses } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// GET /api/admin/quizzes
// Get a single quiz (with questions) or list quizzes for a course
export async function GET(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const quizId = searchParams.get('id');
  const courseId = searchParams.get('course_id');

  if (quizId) {
    // Get single quiz with questions
    const { data: quiz, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions:quiz_questions (*)
      `)
      .eq('id', quizId)
      .single();

    if (error || !quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    if (quiz.questions) {
      quiz.questions.sort((a, b) => a.order_index - b.order_index);
    }

    return NextResponse.json({ quiz });
  }

  if (courseId) {
    // List quizzes for course
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
    }

    return NextResponse.json({ quizzes });
  }

  return NextResponse.json({ error: 'id or course_id required' }, { status: 400 });
}

// POST /api/admin/quizzes
// Create a new quiz
export async function POST(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const {
    course_id, module_id, lesson_id, title, description,
    type, pass_score_percent, time_limit_mins, max_attempts, show_correct_answers
  } = await req.json();

  if (!course_id || !title) {
    return NextResponse.json({ error: 'course_id and title are required' }, { status: 400 });
  }

  const { data: quiz, error } = await supabase
    .from('quizzes')
    .insert({
      course_id,
      module_id: module_id || null,
      lesson_id: lesson_id || null,
      title,
      description: description || null,
      type: type || 'mcq',
      pass_score_percent: parseInt(pass_score_percent) || 60,
      time_limit_mins: time_limit_mins ? parseInt(time_limit_mins) : null,
      max_attempts: max_attempts ? parseInt(max_attempts) : 3,
      show_correct_answers: show_correct_answers !== false
    })
    .select()
    .single();

  if (error) {
    console.error('Create quiz error:', error);
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 });
  }

  return NextResponse.json({ quiz }, { status: 201 });
}

// PUT /api/admin/quizzes
// Update an existing quiz
export async function PUT(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const allowedFields = [
    'title', 'description', 'type', 'pass_score_percent',
    'time_limit_mins', 'max_attempts', 'show_correct_answers', 'order_index'
  ];

  const safeUpdates = {};
  allowedFields.forEach(f => {
    if (updates[f] !== undefined) {
      if (['pass_score_percent', 'time_limit_mins', 'max_attempts', 'order_index'].includes(f)) {
        safeUpdates[f] = updates[f] === null ? null : parseInt(updates[f]);
      } else {
        safeUpdates[f] = updates[f];
      }
    }
  });

  const { data: quiz, error } = await supabase
    .from('quizzes')
    .update(safeUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to update quiz' }, { status: 500 });
  }

  return NextResponse.json({ quiz });
}

// DELETE /api/admin/quizzes
// Delete a quiz
export async function DELETE(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
