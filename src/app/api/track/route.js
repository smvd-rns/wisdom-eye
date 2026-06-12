import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { identifier } = await req.json();

    if (!identifier || !identifier.trim()) {
      return NextResponse.json({ error: 'Email address or Mobile number is required.' }, { status: 400 });
    }

    const cleanInput = identifier.trim().toLowerCase();

    // Query Supabase registrations table
    const { data: records, error } = await supabase
      .from('registrations')
      .select('*')
      .or(`email.ilike.${cleanInput},mobile.eq.${cleanInput}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error tracking parcel details:', error);
      return NextResponse.json({ error: 'Database search query failed.' }, { status: 500 });
    }

    if (!records || records.length === 0) {
      return NextResponse.json({ error: 'No registrations found matching that email or mobile number.' }, { status: 404 });
    }

    // Censorship utility for privacy
    const censorEmail = (email) => {
      const parts = email.split('@');
      if (parts.length !== 2) return email;
      const name = parts[0];
      const domain = parts[1];
      if (name.length <= 2) return `${name[0]}***@${domain}`;
      return `${name[0]}***${name[name.length - 1]}@${domain}`;
    };

    // Map records to a safe public payload
    const safeRecords = records.map(reg => ({
      id: reg.id,
      name: reg.name,
      email: censorEmail(reg.email),
      delivery_type: reg.delivery_type,
      payment_status: reg.payment_status,
      graphy_status: reg.graphy_status,
      shipping_status: reg.shipping_status,
      tracking_id: reg.tracking_id || null,
      created_at: reg.created_at,
    }));

    return NextResponse.json({ registrations: safeRecords });

  } catch (error) {
    console.error('Public track API error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
