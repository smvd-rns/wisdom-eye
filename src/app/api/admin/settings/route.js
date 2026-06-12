import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function getSessionRole(req) {
  const tokenCookie = req.cookies.get('auth_token');
  if (!tokenCookie) return null;

  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
  try {
    const decoded = jwt.verify(tokenCookie.value, jwtSecret);
    return decoded.role;
  } catch (err) {
    return null;
  }
}

export async function POST(req) {
  try {
    const role = getSessionRole(req);
    
    // 1. Verify Authentication & Admin role
    if (!role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Only administrators can modify security settings.' }, { status: 403 });
    }

    const { adminPassword, viewerPassword } = await req.json();

    const updates = [];

    if (adminPassword && adminPassword.trim()) {
      updates.push({ key: 'admin_password', value: adminPassword.trim() });
    }

    if (viewerPassword && viewerPassword.trim()) {
      updates.push({ key: 'viewer_password', value: viewerPassword.trim() });
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No password updates provided' }, { status: 400 });
    }

    // Write updates to settings table
    const { error } = await supabase
      .from('settings')
      .upsert(updates);

    if (error) {
      console.error('Error writing password updates to database settings:', error);
      return NextResponse.json({ error: 'Failed to update passwords in database.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Security credentials updated successfully in database.',
    });

  } catch (error) {
    console.error('POST settings error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
