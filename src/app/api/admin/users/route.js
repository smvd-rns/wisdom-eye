import { NextResponse } from 'next/server';
import { getSession, isAdmin } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// GET /api/admin/users
// Lists all registered users with search filters (Admin/Superadmin only)
export async function GET(req) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || 'All';

  let query = supabase
    .from('user_profiles')
    .select('id, user_id, name, email, phone, role, is_active, created_at')
    .order('created_at', { ascending: false });

  // If not superadmin, isolate by organization_id
  if (session.role !== 'superadmin') {
    query = query.eq('organization_id', session.organizationId);
  }

  if (role !== 'All') {
    query = query.eq('role', role);
  }

  const { data: users, error } = await query;

  if (error) {
    console.error('Fetch users list error:', error);
    return NextResponse.json({ error: 'Failed to fetch users list.' }, { status: 500 });
  }

  // Filter in memory for search query (name or email match)
  let filtered = users || [];
  if (search.trim()) {
    const term = search.toLowerCase().trim();
    filtered = filtered.filter(
      u => u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)
    );
  }

  return NextResponse.json({ users: filtered });
}

// PUT /api/admin/users
// Updates a user's role or active status (Admin/Superadmin only)
export async function PUT(req) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { user_id, role, is_active } = await req.json();

  if (!user_id) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  // Prevent admin from lockouts: Can't modify their own status or role
  if (user_id === session.userId) {
    return NextResponse.json({ 
      error: 'Access denied: You cannot alter your own admin role or status.' 
    }, { status: 400 });
  }

  // 1. Fetch user to verify organization and role
  const { data: targetUser, error: fetchError } = await supabase
    .from('user_profiles')
    .select('organization_id, role')
    .eq('user_id', user_id)
    .single();

  if (fetchError || !targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // If not superadmin, enforce organization boundary
  if (session.role !== 'superadmin' && targetUser.organization_id !== session.organizationId) {
    return NextResponse.json({ error: 'Unauthorized: User is outside your organization.' }, { status: 403 });
  }

  const ROLE_ORDER = ['student', 'evaluator', 'course_builder', 'admin', 'superadmin'];

  // Enforce role hierarchy: Actor cannot alter someone with a higher role than their own
  if (ROLE_ORDER.indexOf(targetUser.role) > ROLE_ORDER.indexOf(session.role)) {
    return NextResponse.json({ error: 'Unauthorized: You cannot modify a user with a higher role than your own.' }, { status: 403 });
  }

  // Enforce role hierarchy: Actor cannot assign a role higher than their own
  if (role && ROLE_ORDER.indexOf(role) > ROLE_ORDER.indexOf(session.role)) {
    return NextResponse.json({ error: 'Unauthorized: You cannot assign a role higher than your own.' }, { status: 403 });
  }

  // Build update payload
  const updateData = {};
  if (role) {
    const allowedRoles = ['superadmin', 'admin', 'course_builder', 'evaluator', 'student'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    updateData.role = role;
  }

  if (is_active !== undefined) {
    updateData.is_active = !!is_active;
  }

  const { data: updatedUser, error: updateError } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('user_id', user_id)
    .select('id, user_id, name, email, role, is_active')
    .single();

  if (updateError) {
    console.error('Update user profile error:', updateError);
    return NextResponse.json({ error: 'Failed to update user profile.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, user: updatedUser });
}
