import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// POST /api/admin/coupons/validate
// Validate coupon eligibility and calculate discounted price
export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { code, course_id } = await req.json();

  if (!code || !course_id) {
    return NextResponse.json({ error: 'code and course_id are required' }, { status: 400 });
  }

  const cleanCode = code.toUpperCase().trim();

  // Resolve active tenant
  const { getActiveTenant } = await import('@/lib/tenant');
  const tenant = await getActiveTenant(req);

  // 1. Fetch coupon
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', cleanCode)
    .eq('organization_id', tenant.id)
    .single();

  if (error || !coupon) {
    return NextResponse.json({ success: false, valid: false, error: 'Invalid coupon code' }, { status: 400 });
  }

  // 2. Check active
  if (!coupon.is_active) {
    return NextResponse.json({ success: false, valid: false, error: 'This coupon is inactive' }, { status: 400 });
  }

  const now = new Date();

  // 3. Check dates
  if (coupon.valid_from && new Date(coupon.valid_from) > now) {
    return NextResponse.json({ success: false, valid: false, error: 'This coupon is not active yet' }, { status: 400 });
  }

  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    return NextResponse.json({ success: false, valid: false, error: 'This coupon has expired' }, { status: 400 });
  }

  // 4. Check total usage count limit
  if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
    return NextResponse.json({ success: false, valid: false, error: 'This coupon usage limit has been reached' }, { status: 400 });
  }

  // 5. Check course specific mapping
  if (coupon.applies_to === 'specific') {
    const { data: mapping, error: mapError } = await supabase
      .from('coupon_courses')
      .select('*')
      .eq('coupon_id', coupon.id)
      .eq('course_id', course_id)
      .single();

    if (mapError || !mapping) {
      return NextResponse.json({ success: false, valid: false, error: 'This coupon is not valid for this course' }, { status: 400 });
    }
  }

  // 6. Check if user already used this coupon (one use per user)
  const { data: usage, error: usageError } = await supabase
    .from('coupon_uses')
    .select('id')
    .eq('coupon_id', coupon.id)
    .eq('user_id', session.userId)
    .single();

  if (!usageError && usage) {
    return NextResponse.json({ success: false, valid: false, error: 'You have already used this coupon code' }, { status: 400 });
  }

  // 7. Fetch course price to calculate discount
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('price')
    .eq('id', course_id)
    .single();

  if (courseError || !course) {
    return NextResponse.json({ success: false, valid: false, error: 'Course price details not found' }, { status: 400 });
  }

  const basePrice = parseFloat(course.price) || 0;
  let finalPrice = basePrice;
  let discountAmount = 0;
  let description = '';

  if (coupon.type === 'free') {
    finalPrice = 0;
    discountAmount = basePrice;
    description = '100% free checkout';
  } else if (coupon.type === 'percent') {
    const pct = parseFloat(coupon.discount_value) || 0;
    discountAmount = basePrice * (pct / 100);
    finalPrice = Math.max(0, basePrice - discountAmount);
    description = `${pct}% off`;
  } else if (coupon.type === 'fixed') {
    const val = parseFloat(coupon.discount_value) || 0;
    discountAmount = Math.min(basePrice, val);
    finalPrice = Math.max(0, basePrice - val);
    description = `₹${val} off`;
  }

  return NextResponse.json({
    success: true,
    valid: true,
    final_price: finalPrice,
    discount_amount: discountAmount,
    description: description,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      discount_value: coupon.discount_value
    }
  });
}
