import { NextResponse } from 'next/server';
import { getSession, isAdmin, canManageCourses } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const [coursesRes, studentsRes, enrollmentsRes, revenueRes] = await Promise.all([
    supabase.from('courses').select('id', { count: 'exact', head: true }),
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('lms_payments').select('final_amount').eq('status', 'success'),
  ]);

  const revenue = (revenueRes.data || []).reduce((sum, p) => sum + Number(p.final_amount || 0), 0);

  return NextResponse.json({
    courses: coursesRes.count || 0,
    students: studentsRes.count || 0,
    enrollments: enrollmentsRes.count || 0,
    revenue,
  });
}
