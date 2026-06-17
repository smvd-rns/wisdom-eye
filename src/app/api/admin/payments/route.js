import { NextResponse } from 'next/server';
import { getSession, isAdmin } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// GET /api/admin/payments
// List payments and calculate overall revenue statistics (Admin only)
export async function GET(req) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Fetch payments (isolated by organization courses)
  let query = supabase
    .from('lms_payments')
    .select(`
      *,
      courses!inner(title, organization_id)
    `)
    .order('created_at', { ascending: false });

  if (session.role !== 'superadmin') {
    query = query.eq('courses.organization_id', session.organizationId);
  }

  const { data: payments, error } = await query;

  if (error) {
    console.error('Fetch payments error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }

  // Fetch profiles
  const userIds = [...new Set(payments.map(p => p.user_id))];
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, name, email')
    .in('user_id', userIds);

  const profileMap = {};
  profiles?.forEach(p => {
    profileMap[p.user_id] = p;
  });

  // Fetch coupons used
  const couponIds = [...new Set(payments.filter(p => p.coupon_id).map(p => p.coupon_id))];
  let couponMap = {};
  if (couponIds.length > 0) {
    const { data: coupons } = await supabase
      .from('coupons')
      .select('id, code')
      .in('id', couponIds);
    coupons?.forEach(c => {
      couponMap[c.id] = c.code;
    });
  }

  const finalPayments = payments.map(p => ({
    ...p,
    student: profileMap[p.user_id] || { name: 'Unknown Student', email: '' },
    coupon_code: p.coupon_id ? couponMap[p.coupon_id] || null : null
  }));

  // Stats calculation
  const successfulPayments = finalPayments.filter(p => p.status === 'success');
  const totalRevenue = successfulPayments.reduce((s, p) => s + parseFloat(p.final_amount), 0);
  const totalSales = successfulPayments.length;
  const totalDiscount = successfulPayments.reduce((s, p) => s + parseFloat(p.discount_amount || 0), 0);

  return NextResponse.json({
    payments: finalPayments,
    stats: {
      totalRevenue,
      totalSales,
      totalDiscount
    }
  });
}
