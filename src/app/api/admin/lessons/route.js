import { NextResponse } from 'next/server';
import { getSession, canManageCourses } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// POST /api/admin/lessons — create lesson
export async function POST(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { module_id, course_id, title, type, content_url, content_text, description, duration_seconds, order_index, is_free_preview } = await req.json();
  if (!module_id || !course_id || !title) {
    return NextResponse.json({ error: 'module_id, course_id, and title are required.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('lessons')
    .insert({
      module_id, course_id, title,
      type: type || 'youtube',
      content_url: content_url || null,
      content_text: content_text || null,
      description: description || null,
      duration_seconds: duration_seconds || 0,
      order_index: order_index || 0,
      is_free_preview: is_free_preview || false,
    })
    .select()
    .single();

  if (error) {
    console.error('Create lesson error:', error);
    return NextResponse.json({ error: 'Failed to create lesson.' }, { status: 500 });
  }

  // Update total_lessons count on course
  await supabase.rpc('increment_course_lessons', { course_id_param: course_id }).catch(() => {});

  return NextResponse.json({ lesson: data }, { status: 201 });
}

// PUT /api/admin/lessons — update lesson
export async function PUT(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'id required.' }, { status: 400 });

  const allowed = ['title', 'type', 'content_url', 'content_text', 'description', 'duration_seconds', 'order_index', 'is_free_preview'];
  const safeUpdates = {};
  allowed.forEach(f => { if (updates[f] !== undefined) safeUpdates[f] = updates[f]; });
  safeUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('lessons')
    .update(safeUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to update lesson.' }, { status: 500 });
  return NextResponse.json({ lesson: data });
}

// DELETE /api/admin/lessons?id=xxx
export async function DELETE(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required.' }, { status: 400 });

  const { error } = await supabase.from('lessons').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'Failed to delete lesson.' }, { status: 500 });
  return NextResponse.json({ success: true });
}
