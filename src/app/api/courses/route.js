import { NextResponse } from 'next/server';
import { getSession, canManageCourses } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// GET /api/courses — public list of published courses
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  // Resolve active tenant
  const { getActiveTenant } = await import('@/lib/tenant');
  const tenant = await getActiveTenant(req);

  let query = supabase
    .from('courses')
    .select('id, title, slug, short_description, thumbnail_url, price, original_price, category, level, total_lessons, total_duration_seconds, has_certificate')
    .eq('status', 'published')
    .eq('organization_id', tenant.id)
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category', category);
  if (search) query = query.ilike('title', `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'Failed to fetch courses.' }, { status: 500 });
  // Only cache unfiltered lists; filtered lists (search/category) bypass CDN
  const cacheHeader = (!category && !search)
    ? { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60' }
    : { 'Cache-Control': 'no-store' };
  return NextResponse.json({ courses: data || [] }, { headers: cacheHeader });
}

// POST /api/courses — create new course (admin/course_builder)
export async function POST(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Enforce tenant organization boundary check (Admins can only write to their own org, Superadmins can set dynamically)
  const { getActiveTenant } = await import('@/lib/tenant');
  const tenant = await getActiveTenant(req);
  const targetOrgId = session.role === 'superadmin' ? (req.headers.get('x-target-org-id') || tenant.id) : session.organization_id;

  const body = await req.json();
  const { title, short_description, description, thumbnail_url, price, original_price, category, level, has_certificate } = body;

  if (!title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });

  // Generate slug from title
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '-' + Date.now().toString(36);

  const { data, error } = await supabase
    .from('courses')
    .insert({
      title, slug, short_description, description,
      thumbnail_url, price: price || 0,
      original_price: original_price || null,
      category: category || 'General',
      level: level || 'beginner',
      has_certificate: has_certificate || false,
      status: 'draft',
      created_by: session.userId,
      organization_id: targetOrgId
    })
    .select()
    .single();

  if (error) {
    console.error('Create course error:', error);
    return NextResponse.json({ error: 'Failed to create course.' }, { status: 500 });
  }

  return NextResponse.json({ course: data }, { status: 201 });
}
