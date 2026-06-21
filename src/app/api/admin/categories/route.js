import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

// GET /api/admin/categories — Fetch tenant's custom categories
export async function GET(req) {
  try {
    const { getActiveTenant } = await import('@/lib/tenant');
    const tenant = await getActiveTenant(req);

    const { data, error } = await supabase
      .from('course_categories')
      .select('name')
      .eq('organization_id', tenant.id)
      .order('name', { ascending: true });

    if (error) {
      // Graceful fallback if table doesn't exist yet
      return NextResponse.json({ categories: [] });
    }

    return NextResponse.json({ categories: data.map(c => c.name) || [] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/categories — Add a custom category
export async function POST(req) {
  try {
    const session = await getSession();
    if (!session || !['superadmin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { getActiveTenant } = await import('@/lib/tenant');
    const tenant = await getActiveTenant(req);
    const targetOrgId = session.role === 'superadmin' ? (req.headers.get('x-target-org-id') || tenant.id) : session.organization_id;

    const body = await req.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }

    const cleanName = name.trim();

    const { data, error } = await supabase
      .from('course_categories')
      .insert({ name: cleanName, organization_id: targetOrgId })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Category already exists.' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, category: data.name }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/categories — Delete a custom category
export async function DELETE(req) {
  try {
    const session = await getSession();
    if (!session || !['superadmin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { getActiveTenant } = await import('@/lib/tenant');
    const tenant = await getActiveTenant(req);
    const targetOrgId = session.role === 'superadmin' ? (req.headers.get('x-target-org-id') || tenant.id) : session.organization_id;

    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('course_categories')
      .delete()
      .eq('name', name.trim())
      .eq('organization_id', targetOrgId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
