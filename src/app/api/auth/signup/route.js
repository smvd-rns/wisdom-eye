import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { createSession } from '@/lib/session';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    // Check if email already registered
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
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
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Signup exception:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
