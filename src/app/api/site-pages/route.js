import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

// GET /api/site-pages — list all pages (admin only)
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !['superadmin', 'admin', 'course_builder'].includes(session.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('site_pages')
      .select('id, slug, title, meta_description, is_published, created_at, updated_at, updated_by')
      .order('created_at', { ascending: false });

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ pages: data || [] });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/site-pages — create new page (admin only)
export async function POST(req) {
  try {
    const session = await getSession();
    if (!session || !['superadmin', 'admin'].includes(session.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { slug, title, meta_description, blocks } = await req.json();

    if (!slug || !title) {
      return Response.json({ error: 'slug and title are required' }, { status: 400 });
    }

    const cleanSlug = slug.startsWith('/') ? slug : `/${slug}`;

    const { data, error } = await supabase
      .from('site_pages')
      .insert({
        slug: cleanSlug,
        title,
        meta_description: meta_description || '',
        blocks: blocks || [],
        is_published: true,
        updated_by: session.name || session.email || 'admin',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return Response.json({ error: 'A page with this URL already exists.' }, { status: 409 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ page: data }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
