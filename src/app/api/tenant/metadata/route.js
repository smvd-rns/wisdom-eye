import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { getActiveTenant } = await import('@/lib/tenant');
    const tenant = await getActiveTenant(req);

    // Fetch the organization details
    const { data: org, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', tenant.id)
      .single();

    if (error || !org) {
      return NextResponse.json({
        name: 'Radheshyam Das',
        slogan: 'Vedic Character & Leadership Mentoring',
        description: 'Vedic Character & Leadership Mentoring under VOICE and VOICE Publication, ISKCON Pune.',
        address: 'Govardhan Ecovillage, Wada, Maharashtra',
        email: 'manager@voicepune.com',
        phone: '+91 8605036000'
      });
    }

    // Return fields with robust fallback in case database columns do not exist yet
    return NextResponse.json({
      id: org.id,
      name: org.name || 'Radheshyam Das',
      slug: org.slug,
      custom_domain: org.custom_domain,
      logo_url: org.logo_url,
      primary_color: org.primary_color || '#FF9F1C',
      secondary_color: org.secondary_color || '#1A1B4B',
      slogan: org.slogan || 'Vedic Character & Leadership Mentoring',
      description: org.description || 'Vedic Character & Leadership Mentoring under VOICE and VOICE Publication, ISKCON Pune.',
      address: org.address || 'Govardhan Ecovillage, Wada, Maharashtra',
      email: org.email || 'manager@voicepune.com',
      phone: org.phone || '+91 8605036000'
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session || !['superadmin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { getActiveTenant } = await import('@/lib/tenant');
    const tenant = await getActiveTenant(req);
    const targetOrgId = session.role === 'superadmin' ? (req.headers.get('x-target-org-id') || tenant.id) : session.organization_id;

    const body = await req.json();
    const { name, slogan, description, address, email, phone } = body;

    // Build update payload
    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (slogan !== undefined) updatePayload.slogan = slogan;
    if (description !== undefined) updatePayload.description = description;
    if (address !== undefined) updatePayload.address = address;
    if (email !== undefined) updatePayload.email = email;
    if (phone !== undefined) updatePayload.phone = phone;

    const { data, error } = await supabase
      .from('organizations')
      .update(updatePayload)
      .eq('id', targetOrgId)
      .select()
      .single();

    if (error) {
      console.error('Update org metadata error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, organization: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
