import { NextResponse } from 'next/server';
import { getSession, canManageCourses } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// GET /api/admin/coupons
// List all coupons
export async function GET(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Resolve active tenant
  const { getActiveTenant } = await import('@/lib/tenant');
  const tenant = await getActiveTenant(req);
  const targetOrgId = session.role === 'superadmin' ? (req.headers.get('x-target-org-id') || tenant.id) : session.organizationId;

  // Fetch coupons
  const { data: coupons, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('organization_id', targetOrgId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }

  // Fetch course mapping for coupons
  const couponIds = coupons.map(c => c.id);
  let mappings = [];
  if (couponIds.length > 0) {
    const { data } = await supabase
      .from('coupon_courses')
      .select('coupon_id, course_id, courses(title)')
      .in('coupon_id', couponIds);
    mappings = data || [];
  }

  const couponsWithCourses = coupons.map(c => ({
    ...c,
    courses: mappings.filter(m => m.coupon_id === c.id).map(m => ({
      id: m.course_id,
      title: m.courses?.title || 'Unknown Course'
    }))
  }));

  return NextResponse.json({ coupons: couponsWithCourses });
}

// POST /api/admin/coupons
// Create a new single coupon
export async function POST(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Resolve active tenant
  const { getActiveTenant } = await import('@/lib/tenant');
  const tenant = await getActiveTenant(req);
  const targetOrgId = session.role === 'superadmin' ? (req.headers.get('x-target-org-id') || tenant.id) : session.organizationId;

  const {
    code, description, type, discount_value,
    applies_to, course_ids, max_uses, valid_from, valid_until, is_active
  } = await req.json();

  if (!code || !type) {
    return NextResponse.json({ error: 'code and type are required' }, { status: 400 });
  }

  const cleanCode = code.toUpperCase().trim();

  // Create coupon
  const { data: coupon, error } = await supabase
    .from('coupons')
    .insert({
      code: cleanCode,
      description: description || null,
      type,
      discount_value: parseFloat(discount_value) || 0,
      applies_to: applies_to || 'all',
      max_uses: max_uses ? parseInt(max_uses) : null,
      uses_count: 0,
      valid_from: valid_from || new Date().toISOString(),
      valid_until: valid_until || null,
      is_active: is_active !== false,
      created_by: session.userId,
      organization_id: targetOrgId
    })
    .select()
    .single();

  if (error) {
    console.error('Create coupon error:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }

  // Insert specific course mapping if applies_to is 'specific'
  if (applies_to === 'specific' && Array.isArray(course_ids) && course_ids.length > 0) {
    const mappings = course_ids.map(courseId => ({
      coupon_id: coupon.id,
      course_id: courseId
    }));
    await supabase.from('coupon_courses').insert(mappings);
  }

  return NextResponse.json({ coupon }, { status: 201 });
}

// DELETE /api/admin/coupons
// Delete a coupon
export async function DELETE(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  // If not superadmin, verify that the coupon belongs to this organization
  if (session.role !== 'superadmin') {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('organization_id')
      .eq('id', id)
      .single();

    if (coupon && coupon.organization_id !== session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized: Coupon is outside your organization.' }, { status: 403 });
    }
  }

  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
