import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

// GET /api/site-pages/navigation — list all navigation links
export async function GET(req) {
  try {
    const { getActiveTenant } = await import('@/lib/tenant');
    const tenant = await getActiveTenant(req);

    const { data, error } = await supabase
      .from('site_navigation')
      .select('*')
      .eq('organization_id', tenant.id)
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      // Fallback defaults if table doesn't exist yet (or error reading)
      return Response.json({
        links: [
          { label: 'Home', url: '/', is_visible: true, order_index: 1 },
          { label: 'Courses', url: '/courses', is_visible: true, order_index: 2 },
        ]
      });
    }

    return Response.json({ links: data || [] });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/site-pages/navigation — save/bulk update navbar links (admin only)
export async function POST(req) {
  try {
    const session = await getSession();
    if (!session || !['superadmin', 'admin'].includes(session.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { getActiveTenant } = await import('@/lib/tenant');
    const tenant = await getActiveTenant(req);
    const targetOrgId = session.role === 'superadmin' ? (req.headers.get('x-target-org-id') || tenant.id) : session.organizationId;

    const { links } = await req.json();
    if (!links || !Array.isArray(links)) {
      return Response.json({ error: 'links array required' }, { status: 400 });
    }

    // Clear existing nav for this organization only
    await supabase
      .from('site_navigation')
      .delete()
      .eq('organization_id', targetOrgId);

    // Re-insert ordered items
    const records = links.map((link, idx) => ({
      label: link.label,
      url: link.url,
      order_index: idx + 1,
      is_visible: link.is_visible !== false,
      organization_id: targetOrgId
    }));

    const { error } = await supabase.from('site_navigation').insert(records);
    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
