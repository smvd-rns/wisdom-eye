import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// GET /api/courses/[id]/enrollment-check
export async function GET(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ enrolled: false });

  const { data } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', session.userId)
    .eq('course_id', params.id)
    .eq('status', 'active')
    .single();

  return NextResponse.json({ enrolled: !!data });
}
