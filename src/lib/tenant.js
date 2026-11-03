import { unstable_cache } from 'next/cache';
import { supabase } from './supabase';

// In-memory cache for organization settings to prevent DB overhead
const tenantCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Persistent Next.js Data Cache lookups
const getOrgBySlugCached = unstable_cache(
  async (slug) => {
    try {
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .limit(1)
        .maybeSingle();
      return data;
    } catch {
      return null;
    }
  },
  ['org-by-slug'],
  { revalidate: 3600, tags: ['organizations'] }
);

const getOrgByHostCached = unstable_cache(
  async (cleanHost) => {
    try {
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .or(`custom_domain.eq.${cleanHost},slug.eq.${cleanHost.split('.')[0]}`)
        .limit(1)
        .maybeSingle();
      return data;
    } catch {
      return null;
    }
  },
  ['org-by-host'],
  { revalidate: 3600, tags: ['organizations'] }
);

/**
 * Resolves the active organization based on the request's hostname.
 * Falls back to the default organization if not found or on local testing environments.
 */
export async function getActiveTenant(req) {
  // 1. Extract hostname and slug override from request headers
  let host = '';
  let tenantSlug = '';
  if (req && req.headers) {
    if (typeof req.headers.get === 'function') {
      host = req.headers.get('host') || '';
      tenantSlug = req.headers.get('x-tenant-slug') || '';
    } else {
      if (req.headers.host) host = req.headers.host;
      if (req.headers['x-tenant-slug']) tenantSlug = req.headers['x-tenant-slug'];
    }
  }

  // Clean hostname (remove port numbers if any)
  const cleanHost = host.split(':')[0].toLowerCase();
  const cacheKey = tenantSlug ? `slug:${tenantSlug}` : cleanHost;

  // 2. Check L1 in-memory cache first
  const cached = tenantCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  try {
    let org = null;

    // Prioritize slug override if provided (useful for vercel.app/local testing)
    if (tenantSlug) {
      org = await getOrgBySlugCached(tenantSlug);
    }

    if (!org && cleanHost && cleanHost !== 'localhost' && cleanHost !== '127.0.0.1') {
      org = await getOrgByHostCached(cleanHost);
    }

    // 3. Fallback to default organization ('wisdom-eye')
    if (!org) {
      org = await getOrgBySlugCached('wisdom-eye');
    }

    if (org) {
      tenantCache.set(cacheKey, {
        data: org,
        timestamp: Date.now()
      });
      return org;
    }
  } catch (err) {
    console.error('Error resolving active tenant:', err);
  }

  // Final fallback structure to prevent app crashes if database is unreachable
  return {
    id: 'default',
    name: 'Wisdom Eye',
    slug: 'wisdom-eye',
    primary_color: '#FF9F1C',
    secondary_color: '#1A1B4B'
  };
}
