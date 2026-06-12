import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export async function POST(req, { params }) {
  const { id: courseId } = params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { coupon_code } = await req.json();

  // 1. Check if student is already enrolled in the course
  const { data: existingEnrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', session.userId)
    .eq('course_id', courseId)
    .eq('status', 'active')
    .single();

  if (existingEnrollment) {
    return NextResponse.json({ success: true, alreadyEnrolled: true });
  }

  // 2. Fetch course details
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (courseError || !course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  const basePrice = parseFloat(course.price) || 0;
  let finalPrice = basePrice;
  let discountAmount = 0;
  let validatedCoupon = null;

  // 3. Process Coupon if provided
  if (coupon_code) {
    const cleanCode = coupon_code.toUpperCase().trim();

    // Fetch coupon
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', cleanCode)
      .eq('is_active', true)
      .single();

    if (coupon) {
      const now = new Date();
      let isValid = true;

      // Check dates & max uses
      if (coupon.valid_from && new Date(coupon.valid_from) > now) isValid = false;
      if (coupon.valid_until && new Date(coupon.valid_until) < now) isValid = false;
      if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) isValid = false;

      // Check specific course matching
      if (coupon.applies_to === 'specific') {
        const { data: mapping } = await supabase
          .from('coupon_courses')
          .select('*')
          .eq('coupon_id', coupon.id)
          .eq('course_id', courseId)
          .single();

        if (!mapping) isValid = false;
      }

      // Check if user already used this coupon
      const { data: usage } = await supabase
        .from('coupon_uses')
        .select('id')
        .eq('coupon_id', coupon.id)
        .eq('user_id', session.userId)
        .single();

      if (usage) isValid = false;

      if (isValid) {
        validatedCoupon = coupon;
        if (coupon.type === 'free') {
          finalPrice = 0;
          discountAmount = basePrice;
        } else if (coupon.type === 'percent') {
          const discountPct = parseFloat(coupon.discount_value) || 0;
          discountAmount = basePrice * (discountPct / 100);
          finalPrice = Math.max(0, basePrice - discountAmount);
        } else if (coupon.type === 'fixed') {
          const discountVal = parseFloat(coupon.discount_value) || 0;
          discountAmount = discountVal;
          finalPrice = Math.max(0, basePrice - discountVal);
        }
      }
    }
  }

  // 4. Handle FREE Enrollment (price is 0)
  if (finalPrice <= 0) {
    // Start Supabase Transaction:
    // Create enrollment record
    const { error: enrollError } = await supabase
      .from('enrollments')
      .insert({
        user_id: session.userId,
        course_id: courseId,
        amount_paid: 0,
        status: 'active',
        coupon_id: validatedCoupon?.id || null
      });

    if (enrollError) {
      console.error('Free enrollment error:', enrollError);
      return NextResponse.json({ error: 'Failed to complete free enrollment' }, { status: 500 });
    }

    // Insert successful payment log
    const { data: payment } = await supabase
      .from('lms_payments')
      .insert({
        user_id: session.userId,
        course_id: courseId,
        original_amount: basePrice,
        discount_amount: discountAmount,
        final_amount: 0,
        status: 'success'
      })
      .select()
      .single();

    // Log coupon use if applicable
    if (validatedCoupon) {
      await supabase.from('coupon_uses').insert({
        coupon_id: validatedCoupon.id,
        user_id: session.userId,
        payment_id: payment?.id || null
      });

      // Increment coupon uses
      await supabase
        .from('coupons')
        .update({ uses_count: (validatedCoupon.uses_count || 0) + 1 })
        .eq('id', validatedCoupon.id);
    }

    // Initialize course progress record for this student
    const { count: totalLessons } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    await supabase.from('course_progress').upsert({
      user_id: session.userId,
      course_id: courseId,
      lessons_completed: 0,
      total_lessons: totalLessons || 0,
      percent_complete: 0,
      certificate_issued: false
    }, { onConflict: 'user_id,course_id' });

    return NextResponse.json({ success: true, free: true });
  }

  // 5. Handle PAID Enrollment via Razorpay Order Creation
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json({ error: 'Razorpay keys not configured on server' }, { status: 500 });
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });

  const finalAmountInPaise = Math.round(finalPrice * 100);

  try {
    const order = await razorpay.orders.create({
      amount: finalAmountInPaise,
      currency: 'INR',
      receipt: `lms_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    });

    // Record pending payment details
    const { error: dbError } = await supabase
      .from('lms_payments')
      .insert({
        user_id: session.userId,
        course_id: courseId,
        coupon_id: validatedCoupon?.id || null,
        original_amount: basePrice,
        discount_amount: discountAmount,
        final_amount: finalPrice,
        razorpay_order_id: order.id,
        status: 'pending'
      });

    if (dbError) {
      console.error('Pending payment db save error:', dbError);
      return NextResponse.json({ error: 'Failed to record registration order' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      free: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId
    });
  } catch (err) {
    console.error('Razorpay order creation failed:', err);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
