import { NextResponse } from 'next/server';
import { getSession, canManageCourses } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// GET /api/admin/modules?course_id=xxx
export async function GET(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('course_id');
  if (!courseId) return NextResponse.json({ error: 'course_id required' }, { status: 400 });

  const { data, error } = await supabase
    .from('modules')
    .select('*, lessons(id, title, type, order_index, duration_seconds, is_free_preview)')
    .eq('course_id', courseId)
    .order('order_index');

  if (error) return NextResponse.json({ error: 'Failed to fetch modules.' }, { status: 500 });
  return NextResponse.json({ modules: data || [] });
}

// POST /api/admin/modules — create module
export async function POST(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { course_id, title, description, order_index } = await req.json();
  if (!course_id || !title) return NextResponse.json({ error: 'course_id and title required.' }, { status: 400 });

  const { data, error } = await supabase
    .from('modules')
    .insert({ course_id, title, description, order_index: order_index || 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to create module.' }, { status: 500 });
  return NextResponse.json({ module: data }, { status: 201 });
}

// PUT /api/admin/modules — update module (id in body)
export async function PUT(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id, title, description, order_index } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required.' }, { status: 400 });

  const { data, error } = await supabase
    .from('modules')
    .update({ title, description, order_index, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to update module.' }, { status: 500 });
  return NextResponse.json({ module: data });
}

// DELETE /api/admin/modules?id=xxx
export async function DELETE(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required.' }, { status: 400 });

  const { error } = await supabase.from('modules').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'Failed to delete module.' }, { status: 500 });
  return NextResponse.json({ success: true });
}
