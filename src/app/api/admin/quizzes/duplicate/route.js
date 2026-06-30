import { NextResponse } from 'next/server';
import { getSession, canManageCourses } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { getActiveTenant } = await import('@/lib/tenant');
  const tenant = await getActiveTenant(req);
  const targetOrgId = session.role === 'superadmin' ? (req.headers.get('x-target-org-id') || tenant.id) : session.organization_id;

  const { quiz_id, target_course_id, target_module_id } = await req.json();

  if (!quiz_id || !target_course_id) {
    return NextResponse.json({ error: 'quiz_id and target_course_id are required' }, { status: 400 });
  }

  // Fetch original quiz and verify it belongs to the org
  const { data: originalQuiz, error: quizError } = await supabase
    .from('quizzes')
    .select('*, course:courses!inner(organization_id)')
    .eq('id', quiz_id)
    .single();

  if (quizError || !originalQuiz) {
    return NextResponse.json({ error: 'Original quiz not found' }, { status: 404 });
  }

  if (originalQuiz.course.organization_id !== targetOrgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Fetch target course and verify it belongs to the org
  const { data: targetCourse, error: courseError } = await supabase
    .from('courses')
    .select('organization_id')
    .eq('id', target_course_id)
    .single();
    
  if (courseError || !targetCourse || targetCourse.organization_id !== targetOrgId) {
    return NextResponse.json({ error: 'Invalid target course' }, { status: 403 });
  }

  // Fetch original questions
  const { data: originalQuestions } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quiz_id);

  // Create new quiz
  const { data: newQuiz, error: createError } = await supabase
    .from('quizzes')
    .insert({
      course_id: target_course_id,
      module_id: target_module_id || null,
      lesson_id: null,
      title: `${originalQuiz.title}`,
      description: originalQuiz.description,
      type: originalQuiz.type,
      pass_score_percent: originalQuiz.pass_score_percent,
      time_limit_mins: originalQuiz.time_limit_mins,
      max_attempts: originalQuiz.max_attempts,
      show_correct_answers: originalQuiz.show_correct_answers,
      order_index: 0
    })
    .select()
    .single();

  if (createError) {
    return NextResponse.json({ error: 'Failed to create duplicate quiz' }, { status: 500 });
  }

  // Copy questions
  if (originalQuestions && originalQuestions.length > 0) {
    const newQuestions = originalQuestions.map(q => ({
      quiz_id: newQuiz.id,
      type: q.type,
      text: q.text,
      options: q.options,
      correct_answer: q.correct_answer,
      marks: q.marks,
      order_index: q.order_index
    }));

    const { error: qError } = await supabase
      .from('quiz_questions')
      .insert(newQuestions);
      
    if (qError) {
      console.error('Failed to duplicate questions:', qError);
    }
  }

  return NextResponse.json({ quiz: newQuiz }, { status: 201 });
}
