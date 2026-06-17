import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export async function GET(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Resolve active tenant
  const { getActiveTenant } = await import('@/lib/tenant');
  const tenant = await getActiveTenant(req);

  // Refresh user data from DB
  const { data: user } = await supabase
    .from('user_profiles')
    .select('id, user_id, name, email, phone, avatar_url, role, is_active, current_streak, last_active_date, organization_id')
    .eq('user_id', session.userId)
    .eq('organization_id', tenant.id)
    .single();

  if (!user || !user.is_active) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user });
}
