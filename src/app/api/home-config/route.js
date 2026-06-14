import { supabase } from '@/lib/supabase';
import { DEFAULT_HOME_CONFIG } from '@/lib/homeConfig';
import { getSession } from '@/lib/session';

const CONFIG_ID = 'homepage_v1';

// GET — returns the current homepage config (public, cached)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('home_config')
      .select('config, updated_at, updated_by')
      .eq('id', CONFIG_ID)
      .single();

    if (error || !data) {
      // Return defaults if table doesn't have a row yet
      return Response.json(DEFAULT_HOME_CONFIG, {
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

// POST — saves a new config (superadmin only)
export async function POST(req) {
  try {
    // Auth check
    const session = await getSession();
    if (!session || !['superadmin', 'admin'].includes(session.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    // Validate top-level shape
    if (!body.sections || !Array.isArray(body.sections)) {
      return Response.json({ error: 'Invalid config: sections array required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('home_config')
      .upsert({
        id: CONFIG_ID,
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
