import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { createSession } from '@/lib/session';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, phone, organizationCode } = body;

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ error: 'Name, email, mobile number, and password are all required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

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

    // Check if email already registered in this organization
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .eq('organization_id', targetOrgId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists in this organization.' }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create a unique user_id
    const userId = crypto.randomUUID();

    // Insert user profile
    const { data: user, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        password_hash: passwordHash,
        role: 'student',
        organization_id: targetOrgId
      })
      .select()
      .single();

    if (error) {
      console.error('Signup error:', error);
      return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 });
    }

    // Create session
    await createSession(user);

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, organization_id: user.organization_id },
    });
  } catch (err) {
    console.error('Signup exception:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
