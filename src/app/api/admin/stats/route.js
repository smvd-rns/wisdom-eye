import { NextResponse } from 'next/server';
import { getSession, isAdmin, canManageCourses } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  let coursesQuery = supabase.from('courses').select('id', { count: 'exact', head: true });
  let studentsQuery = supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('role', 'student');
  let enrollmentsQuery = supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('status', 'active');
  let revenueQuery = supabase.from('lms_payments').select('final_amount').eq('status', 'success');

  if (session.role !== 'superadmin') {
    // Fetch organization course IDs
    const { data: orgCourses } = await supabase
      .from('courses')
      .select('id')
      .eq('organization_id', session.organizationId);
    const orgCourseIds = orgCourses?.map(c => c.id) || [];

    coursesQuery = coursesQuery.eq('organization_id', session.organizationId);
    studentsQuery = studentsQuery.eq('organization_id', session.organizationId);
    
    if (orgCourseIds.length > 0) {
      enrollmentsQuery = enrollmentsQuery.in('course_id', orgCourseIds);
      revenueQuery = revenueQuery.in('course_id', orgCourseIds);
    } else {
      // Force empty results if no courses exist
      enrollmentsQuery = enrollmentsQuery.eq('course_id', '00000000-0000-0000-0000-000000000000');
      revenueQuery = revenueQuery.eq('course_id', '00000000-0000-0000-0000-000000000000');
    }
  }

  const [coursesRes, studentsRes, enrollmentsRes, revenueRes] = await Promise.all([
    coursesQuery,
    studentsQuery,
    enrollmentsQuery,
    revenueQuery,
  ]);

  const revenue = (revenueRes.data || []).reduce((sum, p) => sum + Number(p.final_amount || 0), 0);

  return NextResponse.json({
    courses: coursesRes.count || 0,
    students: studentsRes.count || 0,
    enrollments: enrollmentsRes.count || 0,
    revenue,
  });
}
