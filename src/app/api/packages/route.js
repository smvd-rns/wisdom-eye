import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/packages — public list of published packages with associated courses
export async function GET(req) {
  try {
    // Resolve active tenant
    const { getActiveTenant } = await import('@/lib/tenant');
    const tenant = await getActiveTenant(req);

    // 1. Fetch published packages for the current organization
    const { data: rawPackages, error: pkgError } = await supabase
      .from('packages')
      .select('*')
      .eq('status', 'published')
      .eq('organization_id', tenant.id);

    if (pkgError) {
      console.error('Fetch packages DB error:', pkgError);
      throw pkgError;
    }

    if (!rawPackages || rawPackages.length === 0) {
      return NextResponse.json({ packages: [] });
    }

    // Sort packages in memory by created_at DESC
    const packages = [...rawPackages].sort((a, b) => {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    // 2. Fetch associated courses for these packages
    const packageIds = packages.map(p => p.id);
    const { data: mappings, error: mapError } = await supabase
      .from('package_courses')
      .select('package_id, courses (id, title, slug, thumbnail_url, price, original_price, category, level, total_lessons, total_duration_seconds, has_certificate)')
      .in('package_id', packageIds);

    if (mapError) {
      console.error('Fetch package courses mapping error:', mapError);
      throw mapError;
    }

    // 3. Group courses by package_id
    const packagesWithCourses = packages.map(pkg => {
      const pkgCourses = (mappings || [])
        .filter(m => m.package_id === pkg.id && m.courses)
        .map(m => m.courses);
      return {
        ...pkg,
        courses: pkgCourses,
        courses_count: pkgCourses.length,
        included_courses: pkgCourses.map(c => c.title)
      };
    });

    return NextResponse.json({ packages: packagesWithCourses });
  } catch (err) {
    console.error('Fetch packages exception:', err);
    return NextResponse.json({ error: 'Failed to fetch packages.' }, { status: 500 });
  }
}
