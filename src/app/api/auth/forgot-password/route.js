import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { supabase } from '@/lib/supabase';
import { sendForgotPasswordEmail } from '@/lib/mail';

const SECRET = new TextEncoder().encode(
  process.env.LMS_JWT_SECRET || 'wisdom-eye-lms-secret-change-in-production'
);

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Resolve active tenant
    const { getActiveTenant } = await import('@/lib/tenant');
    const tenant = await getActiveTenant(req);

    // 1. Check if user exists in the active organization
    const { data: user, error } = await supabase
      .from('user_profiles')
      .select('user_id, name, email')
      .eq('email', cleanEmail)
      .eq('organization_id', tenant.id)
      .maybeSingle();

    if (error || !user) {
      // For security, you can choose to return success, but a descriptive error is helpful for learners
      return NextResponse.json({ error: 'No account found with this email address in this organization.' }, { status: 404 });
    }

    // 2. Generate a secure reset token (JWT expiring in 1 hour)
    const token = await new SignJWT({
      userId: user.user_id,
      email: user.email,
      purpose: 'password_reset'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(SECRET);

    // 3. Construct reset URL
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const resetLink = `${origin}/reset-password?token=${token}`;

    // 4. Send email
    const sent = await sendForgotPasswordEmail({
      email: user.email,
      name: user.name,
      resetLink
    });

    if (!sent) {
      return NextResponse.json({ error: 'Failed to send password reset email. Please contact support.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Forgot password exception:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
