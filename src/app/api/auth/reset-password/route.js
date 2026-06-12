import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

const SECRET = new TextEncoder().encode(
  process.env.LMS_JWT_SECRET || 'wisdom-eye-lms-secret-change-in-production'
);

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    // 1. Verify token
    let payload;
    try {
      const verified = await jwtVerify(token, SECRET);
      payload = verified.payload;
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired password reset link. Please request a new one.' }, { status: 400 });
    }

    if (payload.purpose !== 'password_reset' || !payload.userId) {
      return NextResponse.json({ error: 'Invalid reset token purpose.' }, { status: 400 });
    }

    // 2. Hash new password
    const newHash = await bcrypt.hash(password, 12);

    // 3. Update database
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ password_hash: newHash })
      .eq('user_id', payload.userId);

    if (updateError) {
      console.error('Password reset update error:', updateError);
      return NextResponse.json({ error: 'Failed to update password. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Reset password exception:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
