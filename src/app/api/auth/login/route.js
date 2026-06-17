import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { createSession } from '@/lib/session';

export async function POST(req) {
  try {
    const { email, password, organizationCode } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Resolve active tenant
    const { getActiveTenant } = await import('@/lib/tenant');
    const tenant = await getActiveTenant(req);
    let targetOrgId = tenant.id;

    // If student explicitly provided an organization code/slug (useful on shared/main domain)
    if (organizationCode) {
      const cleanOrgCode = organizationCode.toLowerCase().trim();
      const { data: org, error: orgErr } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', cleanOrgCode)
        .maybeSingle();
      
      if (orgErr || !org) {
        return NextResponse.json({ error: 'Invalid organization code.' }, { status: 400 });
      }
      targetOrgId = org.id;
    }

    // 1. Fetch user profile matching organization_id context
    const { data: user, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', cleanEmail)
      .eq('organization_id', targetOrgId)
      .maybeSingle();

    if (error) {
      console.error('Login database error:', error);
      return NextResponse.json({ error: 'Database error occurred. Please try again.' }, { status: 500 });
    }

    // 2. If user does not exist, ask them to sign up
    if (!user) {
      return NextResponse.json({ 
        error: 'User account does not exist. Please sign up to create an account.' 
      }, { status: 404 });
    }

    // 3. User exists: Perform regular authentication checks
    if (!user.is_active) {
      return NextResponse.json({ error: 'Your account has been deactivated. Please contact support.' }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Create session cookie
    await createSession(user);

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, organization_id: user.organization_id },
      is_new: false,
    });
  } catch (err) {
    console.error('Login exception:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
