import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

// GET /api/site-pages/navigation — list all navigation links
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('site_navigation')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      // Fallback defaults if table doesn't exist yet (or error reading)
      return Response.json({
        links: [
          { label: 'Home', url: '/', is_visible: true, order_index: 1 },
          { label: 'Courses', url: '/courses', is_visible: true, order_index: 2 },
          { label: 'Books', url: '/books', is_visible: true, order_index: 3 },
          { label: 'Media', url: '/media', is_visible: true, order_index: 4 },
          { label: 'Daily Reading', url: '/daily-reading', is_visible: true, order_index: 5 },
          { label: 'About', url: '/about', is_visible: true, order_index: 6 },
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

    const { links } = await req.json();
    if (!links || !Array.isArray(links)) {
      return Response.json({ error: 'links array required' }, { status: 400 });
    }

    // Clear existing nav
    await supabase.from('site_navigation').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Re-insert ordered items
    const records = links.map((link, idx) => ({
      label: link.label,
      url: link.url,
      order_index: idx + 1,
      is_visible: link.is_visible !== false
    }));

    const { error } = await supabase.from('site_navigation').insert(records);
    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
