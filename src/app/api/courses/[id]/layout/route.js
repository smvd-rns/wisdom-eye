import { NextResponse } from 'next/server';
import { getSession, canManageCourses } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// GET /api/courses/[id]/layout — returns is_special + custom_layout
export async function GET(req, { params }) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Try to fetch including the new columns; fall back gracefully if they don't exist yet
  let data, error;
  ({ data, error } = await supabase
    .from('courses')
    .select('id, title, is_special, custom_layout')
    .eq('id', params.id)
    .single());

  // If the columns don't exist yet (schema not migrated), fall back to basic fetch
  if (error && (error.code === '42703' || error.message?.includes('column'))) {
    const fallback = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', params.id)
      .single();
    if (fallback.error || !fallback.data) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }
    return NextResponse.json({ ...fallback.data, is_special: false, custom_layout: null });
  }

  if (error || !data) return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
  return NextResponse.json(data);
}

// PATCH /api/courses/[id]/layout — saves is_special + custom_layout
export async function PATCH(req, { params }) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const update = {};

  if (typeof body.is_special === 'boolean') update.is_special = body.is_special;
  if (body.custom_layout !== undefined) update.custom_layout = body.custom_layout;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('courses')
    .update(update)
    .eq('id', params.id)
    .select('id, title, is_special, custom_layout')
    .single();

  if (error) {
    console.error('Layout save error:', error);
    if (error.code === '42703' || error.message?.includes('column')) {
      return NextResponse.json({ 
        error: 'Database migration required. Please run the SQL migration in your Supabase SQL Editor: ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_special BOOLEAN DEFAULT FALSE, ADD COLUMN IF NOT EXISTS custom_layout JSONB DEFAULT NULL;' 
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to save layout.' }, { status: 500 });
  }

  return NextResponse.json(data);
}
