import { NextResponse } from 'next/server';
import { getSession, canManageCourses } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// GET /api/admin/reports
// Fetch course progress analytics and student completion reports
export async function GET(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('course_id');

  if (courseId) {
    // Check that the requested courseId belongs to the user's organization
    if (session.role !== 'superadmin') {
      const { data: courseCheck } = await supabase
        .from('courses')
        .select('organization_id')
        .eq('id', courseId)
        .single();
      if (!courseCheck || courseCheck.organization_id !== session.organizationId) {
        return NextResponse.json({ error: 'Unauthorized: Course belongs to another organization.' }, { status: 403 });
      }
    }

    // 1. Fetch detailed student progress for specific course
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select('user_id, enrolled_at, status')
      .eq('course_id', courseId);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch enrolled students' }, { status: 500 });
    }

    const userIds = enrollments.map(e => e.user_id);
    let progressList = [];
    let profiles = [];

    if (userIds.length > 0) {
      // Fetch progress
      const { data: progress } = await supabase
        .from('course_progress')
        .select('*')
        .eq('course_id', courseId)
        .in('user_id', userIds);
      progressList = progress || [];

      // Fetch student profiles
      const { data: users } = await supabase
        .from('user_profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);
      profiles = users || [];
    }

    const progressMap = {};
    progressList.forEach(p => {
      progressMap[p.user_id] = p;
    });

    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.user_id] = p;
    });

    const report = enrollments.map(e => {
      const studentProgress = progressMap[e.user_id] || {
        lessons_completed: 0,
        total_lessons: 0,
        percent_complete: 0,
        certificate_issued: false
      };
      const studentProfile = profileMap[e.user_id] || { name: 'Unknown Student', email: '' };

      return {
        user_id: e.user_id,
        enrolled_at: e.enrolled_at,
        status: e.status,
        name: studentProfile.name,
        email: studentProfile.email,
        progress: studentProgress
      };
    });

    return NextResponse.json({ report });
  }

  // 2. Summary stats for all courses
  let coursesQuery = supabase
    .from('courses')
    .select('id, title, category, status')
    .order('created_at', { ascending: false });

  if (session.role !== 'superadmin') {
    coursesQuery = coursesQuery.eq('organization_id', session.organizationId);
  }

  const { data: courses, error: coursesError } = await coursesQuery;

  if (coursesError) {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }

  // Fetch all enrollments
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_id, user_id');

  // Fetch all progress
  const { data: progresses } = await supabase
    .from('course_progress')
    .select('course_id, percent_complete, certificate_issued');

  const stats = courses.map(c => {
    const courseEnrollments = enrollments?.filter(e => e.course_id === c.id) || [];
    const courseProgresses = progresses?.filter(p => p.course_id === c.id) || [];
    
    const enrolledCount = courseEnrollments.length;
    const completedCount = courseProgresses.filter(p => parseFloat(p.percent_complete) >= 100).length;
    const certsIssuedCount = courseProgresses.filter(p => p.certificate_issued).length;

    const avgCompletion = enrolledCount > 0
      ? courseProgresses.reduce((sum, p) => sum + parseFloat(p.percent_complete), 0) / enrolledCount
      : 0;

    return {
      id: c.id,
      title: c.title,
      category: c.category,
      status: c.status,
      enrolled_count: enrolledCount,
      completed_count: completedCount,
      certs_issued_count: certsIssuedCount,
      avg_completion: Math.round(avgCompletion)
    };
  });

  return NextResponse.json({ courses: stats });
}
