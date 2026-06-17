import { NextResponse } from 'next/server';
import { getSession, canManageCourses } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export async function GET(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Resolve active tenant
  const { getActiveTenant } = await import('@/lib/tenant');
  const tenant = await getActiveTenant(req);
  const targetOrgId = session.role === 'superadmin' ? (req.headers.get('x-target-org-id') || tenant.id) : session.organization_id;

  const { data, error } = await supabase
    .from('courses')
    .select('id, title, slug, thumbnail_url, price, original_price, category, level, status, total_lessons, has_certificate, created_at')
    .eq('organization_id', targetOrgId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Failed to fetch.' }, { status: 500 });
  return NextResponse.json({ courses: data || [] });
}
