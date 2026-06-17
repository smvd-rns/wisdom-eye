import { supabase } from '@/lib/supabase';
import { DEFAULT_HOME_CONFIG, EMPTY_HOME_CONFIG } from '@/lib/homeConfig';
import { getSession } from '@/lib/session';

// GET — returns the current homepage config (public, cached)
export async function GET(req) {
  try {
    // Resolve active tenant
    const { getActiveTenant } = await import('@/lib/tenant');
    const tenant = await getActiveTenant(req);
    const configId = `homepage_${tenant.id}`;

    const { data, error } = await supabase
      .from('home_config')
      .select('config, updated_at, updated_by')
      .eq('id', configId)
      .single();

    if (error || !data) {
      // Return defaults for main site, empty config for other tenants
      const fallbackConfig = tenant.slug === 'wisdom-eye' ? DEFAULT_HOME_CONFIG : EMPTY_HOME_CONFIG;
      return Response.json(fallbackConfig, {
        headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' }
      });
    }

    return Response.json(data.config, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        'X-Last-Updated': data.updated_at,
        'X-Updated-By': data.updated_by || '',
      }
    });
  } catch (err) {
    console.error('[home-config GET]', err);
    return Response.json(DEFAULT_HOME_CONFIG);
  }
}

// POST — saves a new config
export async function POST(req) {
  try {
    // Auth check
    const session = await getSession();
    if (!session || !['superadmin', 'admin'].includes(session.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Resolve active tenant boundary
    const { getActiveTenant } = await import('@/lib/tenant');
    const tenant = await getActiveTenant(req);

    // Admins write to their own organization config. Superadmins can write dynamically.
    const targetOrgId = session.role === 'superadmin' ? (req.headers.get('x-target-org-id') || tenant.id) : session.organizationId;
    const configId = `homepage_${targetOrgId}`;

    const body = await req.json();

    // Validate top-level shape
    if (!body.sections || !Array.isArray(body.sections)) {
      return Response.json({ error: 'Invalid config: sections array required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('home_config')
      .upsert({
        id: configId,
        config: body,
        updated_at: new Date().toISOString(),
        updated_by: session.name || session.email || session.id,
      }, { onConflict: 'id' });

    if (error) {
      console.error('[home-config POST] Supabase error:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('[home-config POST]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
