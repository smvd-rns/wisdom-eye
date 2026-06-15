import { NextResponse } from 'next/server';
import { getSession, canManageCourses } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// GET /api/admin/packages/[id] — get details of a specific package + associated course IDs
export async function GET(req, { params }) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = params;

  // 1. Fetch package
  const { data: pkg, error: pkgError } = await supabase
    .from('packages')
    .select('*')
    .eq('id', id)
    .single();

  if (pkgError) {
    console.error('Fetch admin package error:', pkgError);
    return NextResponse.json({ error: 'Package not found.' }, { status: 404 });
  }

  // 2. Fetch associated course IDs
  const { data: mappings, error: mapError } = await supabase
    .from('package_courses')
    .select('course_id')
    .eq('package_id', id);

  if (mapError) {
    console.error('Fetch package courses map error:', mapError);
    return NextResponse.json({ error: 'Failed to fetch package courses.' }, { status: 500 });
  }

  const courseIds = (mappings || []).map(m => m.course_id);

  return NextResponse.json({ package: pkg, course_ids: courseIds });
}

// PUT /api/admin/packages/[id] — update package details + rewrite mapping
export async function PUT(req, { params }) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = params;
  const body = await req.json();
  const { title, short_description, description, thumbnail_url, price, original_price, status, course_ids } = body;

  if (!title) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
  }

  // 1. Update package details
  const { data: pkg, error: pkgError } = await supabase
    .from('packages')
    .update({
      title,
      short_description,
      description,
      thumbnail_url,
      price: price || 0,
      original_price: original_price || null,
      status: status || 'draft'
    })
    .eq('id', id)
    .select()
    .single();

  if (pkgError) {
    console.error('Update package DB error:', pkgError);
    return NextResponse.json({ error: 'Failed to update package.' }, { status: 500 });
  }

  // 2. Delete old mappings
  const { error: deleteError } = await supabase
    .from('package_courses')
    .delete()
    .eq('package_id', id);

  if (deleteError) {
    console.error('Delete old package course mappings error:', deleteError);
    return NextResponse.json({ error: 'Failed to update linked courses.' }, { status: 500 });
  }

  // 3. Insert new mappings
  if (course_ids && course_ids.length > 0) {
    const mappings = course_ids.map(courseId => ({
      package_id: id,
      course_id: courseId
    }));
    const { error: insertError } = await supabase
      .from('package_courses')
      .insert(mappings);

    if (insertError) {
      console.error('Insert package course mappings error:', insertError);
      return NextResponse.json({ error: 'Failed to relink courses.' }, { status: 500 });
    }
  }

  return NextResponse.json({ package: pkg });
}

// DELETE /api/admin/packages/[id] — delete package
export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = params;

  const { error } = await supabase
    .from('packages')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete package error:', error);
    return NextResponse.json({ error: 'Failed to delete package.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
