import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { createSession } from '@/lib/session';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Fetch user profile
    const { data: user, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (error) {
      console.error('Login database error:', error);
      return NextResponse.json({ error: 'Database error occurred. Please try again.' }, { status: 500 });
    }

    // 2. If user does not exist, automatically register them!
    if (!user) {
      if (password.length < 8) {
        return NextResponse.json({ 
          error: 'Your email was not found. To register a new account, the password must be at least 8 characters long.' 
        }, { status: 400 });
      }

      // Generate a default name from email
      const defaultName = cleanEmail.split('@')[0];
      const passwordHash = await bcrypt.hash(password, 12);
      const userId = crypto.randomUUID();

      // Insert new profile
      const { data: newUser, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          name: defaultName,
          email: cleanEmail,
          password_hash: passwordHash,
          role: 'student',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Auto-registration insertion failed:', insertError);
        return NextResponse.json({ error: 'Failed to create a new account automatically.' }, { status: 500 });
      }

      // Create session cookie
      await createSession(newUser);

      return NextResponse.json({
        success: true,
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
        is_new: true,
      });
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
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      is_new: false,
    });
  } catch (err) {
    console.error('Login exception:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
