import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { getActiveTenant } = await import('@/lib/tenant');
    const tenant = await getActiveTenant(req);

    if (!tenant || tenant.id === 'default') {
      return NextResponse.json({
        name: 'Wisdom Eye',
        slogan: 'Vedic Character & Leadership Mentoring',
        description: 'Vedic Character & Leadership Mentoring under VOICE and VOICE Publication, ISKCON Pune.',
        address: 'Govardhan Ecovillage, Wada, Maharashtra',
        email: 'manager@voicepune.com',
        phone: '+91 8605036000'
      });
    }

    const org = tenant;

    // Return fields with robust fallback in case database columns do not exist yet
    return NextResponse.json({
      id: org.id,
      name: org.name || 'Wisdom Eye',
      slug: org.slug,
      custom_domain: org.custom_domain,
      logo_url: org.logo_url,
      primary_color: org.primary_color || '#FF9F1C',
      secondary_color: org.secondary_color || '#1A1B4B',
      slogan: org.slogan || 'Vedic Character & Leadership Mentoring',
      description: org.description || 'Vedic Character & Leadership Mentoring under VOICE and VOICE Publication, ISKCON Pune.',
      address: org.address || 'Govardhan Ecovillage, Wada, Maharashtra',
      email: org.email || 'manager@voicepune.com',
      phone: org.phone || '+91 8605036000',
      facebook_url: org.facebook_url || 'https://facebook.com',
      youtube_url: org.youtube_url || 'https://youtube.com',
      instagram_url: org.instagram_url || 'https://instagram.com',
      linkedin_url: org.linkedin_url || 'https://linkedin.com'
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
    const { name, slogan, description, address, email, phone, facebook_url, youtube_url, instagram_url, linkedin_url } = body;

    // Build update payload
    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (slogan !== undefined) updatePayload.slogan = slogan;
    if (description !== undefined) updatePayload.description = description;
    if (address !== undefined) updatePayload.address = address;
    if (email !== undefined) updatePayload.email = email;
    if (phone !== undefined) updatePayload.phone = phone;
    if (facebook_url !== undefined) updatePayload.facebook_url = facebook_url;
    if (youtube_url !== undefined) updatePayload.youtube_url = youtube_url;
    if (instagram_url !== undefined) updatePayload.instagram_url = instagram_url;
    if (linkedin_url !== undefined) updatePayload.linkedin_url = linkedin_url;

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
