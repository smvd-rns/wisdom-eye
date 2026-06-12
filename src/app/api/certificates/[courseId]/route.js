import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// GET /api/certificates/[courseId]
// Retrieve verified certificate info for a student
export async function GET(req, { params }) {
  const { courseId } = params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Fetch course details to check if certificate is enabled
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('title, has_certificate, certificate_image_url')
    .eq('id', courseId)
    .single();

  if (courseError || !course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  if (!course.has_certificate) {
    return NextResponse.json({ error: 'This course does not offer a certificate' }, { status: 400 });
  }

  // 2. Verify course progress is 100% complete
  const { data: progress, error: progressError } = await supabase
    .from('course_progress')
    .select('completed_at, percent_complete')
    .eq('user_id', session.userId)
    .eq('course_id', courseId)
    .single();

  if (progressError || !progress || parseFloat(progress.percent_complete) < 100) {
    return NextResponse.json({ error: 'Course is not completed yet' }, { status: 400 });
  }

  // 3. Get student name
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('name')
    .eq('user_id', session.userId)
    .single();

  // Mark certificate_issued = true if not already
  await supabase
    .from('course_progress')
    .update({
      certificate_issued: true,
      certificate_issued_at: new Date().toISOString()
    })
    .eq('user_id', session.userId)
    .eq('course_id', courseId)
    .eq('certificate_issued', false);

  return NextResponse.json({
    success: true,
    student_name: profile?.name || 'Graduated Student',
    course_title: course.title,
    completed_at: progress.completed_at,
    certificate_image_url: course.certificate_image_url || 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1400'
  });
}
