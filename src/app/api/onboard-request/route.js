import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/onboard-request — Submit a new organization onboarding request
export async function POST(req) {
  try {
    const body = await req.json();
    const { orgName, subdomainSlug, adminName, adminEmail, adminPhone, orgType, estimatedStudents } = body;

    // 1. Validation: All fields are compulsory
    if (!orgName || !subdomainSlug || !adminName || !adminEmail || !adminPhone || !orgType || !estimatedStudents) {
      return NextResponse.json({ error: 'All fields are compulsory. Please fill out all fields.' }, { status: 400 });
    }

    const cleanSlug = subdomainSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    const cleanEmail = adminEmail.toLowerCase().trim();
    const cleanPhone = adminPhone.trim();

    if (cleanSlug.length < 3) {
      return NextResponse.json({ error: 'Subdomain slug must be at least 3 characters long.' }, { status: 400 });
    }

    // 2. Check if organization slug is already registered
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', cleanSlug)
      .maybeSingle();

    if (existingOrg) {
      return NextResponse.json({ error: 'This subdomain slug is already taken.' }, { status: 409 });
    }

    // 3. Check if there is already a pending request for this subdomain
    const { data: existingRequest } = await supabase
      .from('organization_requests')
      .select('id')
      .eq('subdomain_slug', cleanSlug)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingRequest) {
      return NextResponse.json({ error: 'A registration request for this subdomain is already pending approval.' }, { status: 409 });
    }

    // 4. Check if email is already registered in active user profiles
    const { data: existingUserEmail } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingUserEmail) {
      return NextResponse.json({ error: 'This email address is already registered.' }, { status: 409 });
    }

    // 5. Check if email is already used in a pending request
    const { data: existingRequestEmail } = await supabase
      .from('organization_requests')
      .select('id')
      .eq('admin_email', cleanEmail)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingRequestEmail) {
      return NextResponse.json({ error: 'A registration request with this email is already pending approval.' }, { status: 409 });
    }

    // 6. Check if mobile number is already registered in active user profiles
    const { data: existingUserPhone } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (existingUserPhone) {
      return NextResponse.json({ error: 'This mobile number is already registered.' }, { status: 409 });
    }

    // 7. Check if mobile number is already used in a pending request
    const { data: existingRequestPhone } = await supabase
      .from('organization_requests')
      .select('id')
      .eq('admin_phone', cleanPhone)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingRequestPhone) {
      return NextResponse.json({ error: 'A registration request with this mobile number is already pending approval.' }, { status: 409 });
    }

    // 8. Save the request to the database
    const { data, error } = await supabase
      .from('organization_requests')
      .insert({
        org_name: orgName.trim(),
        subdomain_slug: cleanSlug,
        admin_name: adminName.trim(),
        admin_email: cleanEmail,
        admin_phone: cleanPhone,
        org_type: orgType,
        estimated_students: estimatedStudents,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Onboard request insertion error:', error);
      return NextResponse.json({ error: 'Failed to submit request. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Onboarding request submitted successfully!' }, { status: 201 });

  } catch (err) {
    console.error('Onboard request exception:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
