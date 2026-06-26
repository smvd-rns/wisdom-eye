import { NextResponse } from 'next/server';
import { getSession, isAdmin } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// PUT /api/admin/payments/tracking — Update shipping status and tracking number
export async function PUT(req) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { payment_id, shipping_status, tracking_id } = await req.json();

    if (!payment_id) {
      return NextResponse.json({ error: 'Payment ID is required.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('lms_payments')
      .update({
        shipping_status: shipping_status || 'pending_shipment',
        tracking_id: tracking_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment_id)
      .select()
      .single();

    if (error) {
      console.error('Update shipping tracking error:', error);
      return NextResponse.json({ error: 'Failed to update tracking details.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, payment: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
