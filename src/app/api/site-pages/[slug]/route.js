import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

// GET /api/site-pages/[slug] — public read, used by the page renderer
export async function GET(req, { params }) {
  try {
    const rawSlug = decodeURIComponent(params.slug);
    const slug = rawSlug.startsWith('/') ? rawSlug : `/${rawSlug}`;

    const { getActiveTenant } = await import('@/lib/tenant');
    const tenant = await getActiveTenant(req);

    const { data, error } = await supabase
      .from('site_pages')
      .select('id, slug, title, meta_description, blocks, is_published')
      .eq('slug', slug)
      .eq('organization_id', tenant.id)
      .single();

    if (error || !data) {
      return Response.json({ error: 'Page not found' }, { status: 404 });
    }

    if (!data.is_published) {
      const session = await getSession();
      if (!session || !['superadmin', 'admin', 'course_builder'].includes(session.role)) {
        return Response.json({ error: 'Page not found' }, { status: 404 });
      }
    }

    return Response.json({ page: data });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/site-pages/[slug] — update page blocks/meta (admin only)
export async function PUT(req, { params }) {
  try {
    const session = await getSession();
    if (!session || !['superadmin', 'admin', 'course_builder'].includes(session.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { getActiveTenant } = await import('@/lib/tenant');
    const tenant = await getActiveTenant(req);
    const targetOrgId = session.role === 'superadmin' ? (req.headers.get('x-target-org-id') || tenant.id) : session.organization_id;

    const rawSlug = decodeURIComponent(params.slug);
    const slug = rawSlug.startsWith('/') ? rawSlug : `/${rawSlug}`;
    const body = await req.json();

    const updateData = {
      updated_at: new Date().toISOString(),
      updated_by: session.name || session.email || 'admin',
    };

    if (body.blocks !== undefined) updateData.blocks = body.blocks;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.meta_description !== undefined) updateData.meta_description = body.meta_description;
    if (body.is_published !== undefined) updateData.is_published = body.is_published;

    const { error } = await supabase
      .from('site_pages')
      .update(updateData)
      .eq('slug', slug)
      .eq('organization_id', targetOrgId);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/site-pages/[slug] — delete page (superadmin only)
export async function DELETE(req, { params }) {
  try {
    const session = await getSession();
    if (!session || !['superadmin', 'admin'].includes(session.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { getActiveTenant } = await import('@/lib/tenant');
    const tenant = await getActiveTenant(req);
    const targetOrgId = session.role === 'superadmin' ? (req.headers.get('x-target-org-id') || tenant.id) : session.organization_id;

    const rawSlug = decodeURIComponent(params.slug);
    const slug = rawSlug.startsWith('/') ? rawSlug : `/${rawSlug}`;

    const { error } = await supabase
      .from('site_pages')
      .delete()
      .eq('slug', slug)
      .eq('organization_id', targetOrgId);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
