import { NextResponse } from 'next/server';
import { getSession, canManageCourses, isAdmin } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// GET /api/courses/[id] — get full course with modules + lessons
export async function GET(req, { params }) {
  const { id } = params;
  const session = await getSession();

  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      *,
      modules (
        id, title, description, order_index,
        lessons (id, title, type, content_url, duration_seconds, order_index, is_free_preview, description)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !course) return NextResponse.json({ error: 'Course not found.' }, { status: 404 });

  // Non-admins can only see published courses
  if (course.status !== 'published' && (!session || !canManageCourses(session.role))) {
    return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
  }

  // Sort modules and lessons by order_index
  if (course.modules) {
    course.modules.sort((a, b) => a.order_index - b.order_index);
    course.modules.forEach(m => {
      if (m.lessons) m.lessons.sort((a, b) => a.order_index - b.order_index);
    });
  }

  return NextResponse.json({ course });
}

// PUT /api/courses/[id] — update course
export async function PUT(req, { params }) {
  const { id } = params;
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const allowedFields = [
    'title', 'short_description', 'description', 'thumbnail_url',
    'price', 'original_price', 'category', 'level', 'status',
    'has_certificate', 'certificate_image_url'
  ];

  const updates = {};
  allowedFields.forEach(f => { if (body[f] !== undefined) updates[f] = body[f]; });
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to update course.' }, { status: 500 });
  return NextResponse.json({ course: data });
}

// DELETE /api/courses/[id] — delete course (admin only)
export async function DELETE(req, { params }) {
  const { id } = params;
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { error } = await supabase.from('courses').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'Failed to delete course.' }, { status: 500 });
  return NextResponse.json({ success: true });
}
