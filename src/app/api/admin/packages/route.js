import { NextResponse } from 'next/server';
import { getSession, canManageCourses } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// GET /api/admin/packages — admin list of all packages
export async function GET(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch admin packages error:', error);
    return NextResponse.json({ error: 'Failed to fetch packages.' }, { status: 500 });
  }

  return NextResponse.json({ packages: data || [] });
}

// POST /api/admin/packages — create a new package
export async function POST(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { title, short_description, description, thumbnail_url, price, original_price, status, course_ids } = body;

  if (!title) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
  }

  // Generate slug
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '-' + Date.now().toString(36);

  // 1. Insert package
  const { data: pkg, error: pkgError } = await supabase
    .from('packages')
    .insert({
      title,
      slug,
      short_description,
      description,
      thumbnail_url,
      price: price || 0,
      original_price: original_price || null,
      status: status || 'draft'
    })
    .select()
    .single();

  if (pkgError) {
    console.error('Create package DB error:', pkgError);
    return NextResponse.json({ error: 'Failed to create package.' }, { status: 500 });
  }

  // 2. Link courses manually
  if (course_ids && course_ids.length > 0) {
    const mappings = course_ids.map(courseId => ({
      package_id: pkg.id,
      course_id: courseId
    }));
    const { error: mapError } = await supabase
      .from('package_courses')
      .insert(mappings);

    if (mapError) {
      console.error('Create package courses mapping error:', mapError);
      // Clean up package if mapping fails
      await supabase.from('packages').delete().eq('id', pkg.id);
      return NextResponse.json({ error: 'Failed to link courses to package.' }, { status: 500 });
    }
  }

  return NextResponse.json({ package: pkg }, { status: 201 });
}
