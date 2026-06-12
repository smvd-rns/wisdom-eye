import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    // Default Env Fallbacks
    let adminPassword = process.env.ADMIN_DASHBOARD_PASSWORD || 'Gauranga@!08smvd';
    let viewerPassword = process.env.VIEWER_DASHBOARD_PASSWORD || 'Prabhupada@108';

    // Query password overrides from Supabase settings table
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['admin_password', 'viewer_password']);

      if (!error && data && data.length > 0) {
        const dbAdmin = data.find(s => s.key === 'admin_password');
        const dbViewer = data.find(s => s.key === 'viewer_password');
        if (dbAdmin) adminPassword = dbAdmin.value;
        if (dbViewer) viewerPassword = dbViewer.value;
      }
    } catch (dbErr) {
      console.warn('Could not query database settings table. Using env fallback values.', dbErr.message);
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';

    let role = null;

    if (password === adminPassword) {
      role = 'admin';
    } else if (password === viewerPassword) {
      role = 'viewer';
    }


    if (!role) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Sign the JWT session token
    const token = jwt.sign({ role }, jwtSecret, { expiresIn: '7d' });

    // Build the response with cookie set
    const response = NextResponse.json({ success: true, role });
    
    // Set token in httpOnly cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Admin Auth API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add a check endpoint or log out endpoint
export async function GET(req) {
  const tokenCookie = req.cookies.get('auth_token');
  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';

  if (!tokenCookie) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(tokenCookie.value, jwtSecret);
    return NextResponse.json({ authenticated: true, role: decoded.role });
  } catch (err) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  // Clear the cookie by setting it to empty and expiring it
  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
