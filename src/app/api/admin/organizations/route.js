import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { getSession, isSuperAdmin } from '@/lib/session';
import { sendOrganizationApprovalEmail } from '@/lib/mail';

// GET /api/admin/organizations — Retrieve lists of registered tenants and pending requests
export async function GET(req) {
  try {
    const session = await getSession();
    if (!session || !isSuperAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized. Superadmin role required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'active'; // 'active' or 'requests'

    // Fetch routing mode setting
    const { data: routingModeSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'tenant_routing_mode')
      .maybeSingle();
    const routingMode = routingModeSetting ? routingModeSetting.value : 'simulation';

    if (type === 'requests') {
      const { data: requests, error } = await supabase
        .from('organization_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ requests: requests || [], routingMode });
    } else {
      const { data: orgs, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ organizations: orgs || [], routingMode });
    }
  } catch (err) {
    console.error('Superadmin GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/organizations — Handle approval actions on pending registration requests
export async function POST(req) {
  try {
    const session = await getSession();
    if (!session || !isSuperAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized. Superadmin role required.' }, { status: 403 });
    }

    const body = await req.json();
    const { requestId, action, routingMode: newRoutingMode } = body; // action: 'approve' | 'reject' | 'set_routing_mode'

    if (action === 'set_routing_mode') {
      if (!newRoutingMode || !['simulation', 'custom_domain'].includes(newRoutingMode)) {
        return NextResponse.json({ error: 'Invalid routing mode.' }, { status: 400 });
      }
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'tenant_routing_mode', value: newRoutingMode });

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (!requestId || !action) {
      return NextResponse.json({ error: 'requestId and action are required.' }, { status: 400 });
    }

    // 1. Fetch the registration request details
    const { data: request, error: fetchErr } = await supabase
      .from('organization_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchErr || !request) {
      return NextResponse.json({ error: 'Registration request not found.' }, { status: 404 });
    }

    if (request.status !== 'pending') {
      return NextResponse.json({ error: 'Request has already been processed.' }, { status: 400 });
    }

    if (action === 'reject') {
      await supabase
        .from('organization_requests')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId);
      return NextResponse.json({ success: true, message: 'Request rejected.' });
    }

    // 2. Action is 'approve' -> Register the new Organization (Tenant)
    const { data: routingModeSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'tenant_routing_mode')
      .maybeSingle();
    const routingMode = routingModeSetting ? routingModeSetting.value : 'simulation';

    const hostHeader = req.headers.get('host') || 'edulms.co.in';
    let baseDomain = 'edulms.co.in';
    let protocol = 'https';
    let loginUrl = '';

    if (routingMode === 'simulation') {
      // In simulation mode (Free Vercel mode), use the query parameter override
      const cleanHost = hostHeader.split(':')[0];
      if (cleanHost.includes('localhost') || cleanHost.includes('127.0.0.1')) {
        loginUrl = `http://${hostHeader}/login?tenant=${request.subdomain_slug}`;
      } else {
        loginUrl = `https://edulms.co.in/login?tenant=${request.subdomain_slug}`;
      }
    } else {
      // In Custom Domain / Production mode, use the subdomain pattern
      if (hostHeader.includes('localhost') || hostHeader.includes('127.0.0.1')) {
        baseDomain = hostHeader; // matches "localhost:3001" or similar
        protocol = 'http';
        loginUrl = `${protocol}://${request.subdomain_slug}.${baseDomain}/login`;
      } else {
        const parts = hostHeader.split('.');
        if (parts.length >= 2) {
          baseDomain = parts.slice(-2).join('.');
        }
        if (baseDomain === 'vercel.app' || baseDomain === 'wisdom-eye.in' || baseDomain === 'in') {
          baseDomain = 'edulms.co.in';
        }
        loginUrl = `${protocol}://${request.subdomain_slug}.${baseDomain}/login`;
      }
    }
    
    const { data: newOrg, error: orgErr } = await supabase
      .from('organizations')
      .insert({
        name: request.org_name,
        slug: request.subdomain_slug,
        custom_domain: `${request.subdomain_slug}.edulms.co.in`,
        primary_color: '#FF9F1C',
        secondary_color: '#1A1B4B'
      })
      .select()
      .single();

    if (orgErr) {
      console.error('Error creating organization:', orgErr);
      return NextResponse.json({ error: 'Failed to create organization. Slug might be taken.' }, { status: 400 });
    }

    // 3. Auto-generate password and register Admin user account for the organization
    const plainPassword = Math.random().toString(36).substring(2, 10) + '!@2026';
    const passwordHash = await bcrypt.hash(plainPassword, 12);
    const adminUserId = crypto.randomUUID();

    const { error: userErr } = await supabase
      .from('user_profiles')
      .insert({
        user_id: adminUserId,
        name: request.admin_name,
        email: request.admin_email.toLowerCase().trim(),
        phone: request.admin_phone,
        password_hash: passwordHash,
        role: 'admin',
        organization_id: newOrg.id,
        is_active: true
      });

    if (userErr) {
      console.error('Error creating organization admin:', userErr);
      // Rollback organization creation
      await supabase.from('organizations').delete().eq('id', newOrg.id);
      return NextResponse.json({ error: 'Failed to register the organization admin account.' }, { status: 500 });
    }

    // 4. Mark request status as approved
    await supabase
      .from('organization_requests')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    // 5. Seed default navigation links (Only Home & Courses to keep it blank/customizable)
    try {
      const defaultLinks = [
        { label: 'Home', url: '/', order_index: 1, is_visible: true, organization_id: newOrg.id },
        { label: 'Courses', url: '/courses', order_index: 2, is_visible: true, organization_id: newOrg.id },
      ];
      await supabase.from('site_navigation').insert(defaultLinks);
    } catch (seedErr) {
      console.error('Failed to seed default navigation links:', seedErr);
    }

    // Send email containing login details automatically to the new admin
    let emailSent = false;
    try {
      emailSent = await sendOrganizationApprovalEmail({
        email: request.admin_email,
        name: request.admin_name,
        orgName: request.org_name,
        loginUrl,
        password: plainPassword
      });
    } catch (mailErr) {
      console.error('Failed to send auto approval email:', mailErr);
    }

    console.log(`NEW TENANT ACTIVATED: ${request.org_name}. Admin login details sent to ${request.admin_email} (Password: ${plainPassword}), email sent status: ${emailSent}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Organization created and Admin profile registered successfully.',
      email_sent: emailSent,
      credentials: {
        email: request.admin_email,
        password: plainPassword,
        loginUrl: loginUrl
      }
    });

  } catch (err) {
    console.error('Superadmin POST exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/organizations — Delete an organization and its associated admin/user accounts
export async function DELETE(req) {
  try {
    const session = await getSession();
    if (!session || !isSuperAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized. Superadmin role required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('id');

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID is required.' }, { status: 400 });
    }

    // 1. Fetch organization to get its slug before deletion
    const { data: org, error: fetchErr } = await supabase
      .from('organizations')
      .select('slug')
      .eq('id', orgId)
      .single();

    if (!fetchErr && org) {
      // Delete corresponding onboarding requests
      await supabase
        .from('organization_requests')
        .delete()
        .eq('subdomain_slug', org.slug);
    }

    // 2. Delete user profiles associated with the organization
    const { error: userErr } = await supabase
      .from('user_profiles')
      .delete()
      .eq('organization_id', orgId);

    if (userErr) {
      console.error('Error deleting organization user profiles:', userErr);
      return NextResponse.json({ error: 'Failed to delete organization users.' }, { status: 500 });
    }

    // 2. Delete the organization itself
    const { error: orgErr } = await supabase
      .from('organizations')
      .delete()
      .eq('id', orgId);

    if (orgErr) {
      console.error('Error deleting organization:', orgErr);
      return NextResponse.json({ error: 'Failed to delete organization.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Organization deleted successfully.' });
  } catch (err) {
    console.error('Superadmin DELETE exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

