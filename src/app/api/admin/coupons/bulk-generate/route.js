import { NextResponse } from 'next/server';
import { getSession, canManageCourses } from '@/lib/session';
import { supabase } from '@/lib/supabase';

function generateRandomSuffix(length = 4) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// POST /api/admin/coupons/bulk-generate
// Bulk generate randomized coupons
export async function POST(req) {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const {
    prefix, quantity, type, discount_value,
    applies_to, course_ids, max_uses, valid_from, valid_until
  } = await req.json();

  const qty = parseInt(quantity) || 1;
  if (qty <= 0 || qty > 250) {
    return NextResponse.json({ error: 'Quantity must be between 1 and 250' }, { status: 400 });
  }

  if (!type) {
    return NextResponse.json({ error: 'Discount type is required' }, { status: 400 });
  }

  const cleanPrefix = (prefix || 'COUPON').toUpperCase().trim();
  const generatedCoupons = [];
  const couponCoursesInsertions = [];

  // 1. Generate unique codes and construct coupon payloads
  for (let i = 0; i < qty; i++) {
    // Generate suffix and unique code
    const suffix = generateRandomSuffix();
    const code = `${cleanPrefix}-${suffix}`;

    generatedCoupons.push({
      code,
      description: `Bulk generated batch with prefix ${cleanPrefix}`,
      type,
      discount_value: parseFloat(discount_value) || 0,
      applies_to: applies_to || 'all',
      max_uses: max_uses ? parseInt(max_uses) : 1, // Default to 1 use for bulk coupon distributions
      uses_count: 0,
      valid_from: valid_from || new Date().toISOString(),
      valid_until: valid_until || null,
      is_active: true,
      created_by: session.userId
    });
  }

  // 2. Bulk insert coupons into Supabase
  const { data: inserted, error } = await supabase
    .from('coupons')
    .insert(generatedCoupons)
    .select();

  if (error) {
    console.error('Bulk generate coupons insert error:', error);
    return NextResponse.json({ error: 'Failed to insert generated coupons' }, { status: 500 });
  }

  // 3. Map to specific courses if applies_to is 'specific'
  if (applies_to === 'specific' && Array.isArray(course_ids) && course_ids.length > 0) {
    inserted.forEach(coupon => {
      course_ids.forEach(courseId => {
        couponCoursesInsertions.push({
          coupon_id: coupon.id,
          course_id: courseId
        });
      });
    });

    if (couponCoursesInsertions.length > 0) {
      const { error: mappingError } = await supabase
        .from('coupon_courses')
        .insert(couponCoursesInsertions);

      if (mappingError) {
        console.error('Bulk mapping error:', mappingError);
      }
    }
  }

  return NextResponse.json({
    success: true,
    count: inserted.length,
    coupons: inserted
  });
}
