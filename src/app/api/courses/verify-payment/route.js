import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: 'Missing signature verification parameters' }, { status: 400 });
  }

  // 1. Fetch the pending lms_payments record
  const { data: payment, error: fetchError } = await supabase
    .from('lms_payments')
    .select('*')
    .eq('razorpay_order_id', razorpay_order_id)
    .eq('status', 'pending')
    .single();

  if (fetchError || !payment) {
    return NextResponse.json({ error: 'Pending payment order not found' }, { status: 404 });
  }

  // 2. Verify Razorpay Signature
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: 'Gateway signature secret missing on server' }, { status: 500 });
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const isValid = generatedSignature === razorpay_signature;

  if (!isValid) {
    console.error('Invalid signature for order:', razorpay_order_id);
    await supabase
      .from('lms_payments')
      .update({ status: 'failed' })
      .eq('id', payment.id);

    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  // 3. Mark payment as successful
  await supabase
    .from('lms_payments')
    .update({
      status: 'success',
      razorpay_payment_id,
      razorpay_signature
    })
    .eq('id', payment.id);

  // 4. Create enrollment record
  const { error: enrollError } = await supabase
    .from('enrollments')
    .insert({
      user_id: session.userId,
      course_id: payment.course_id,
      payment_id: payment.id,
      coupon_id: payment.coupon_id || null,
      amount_paid: payment.final_amount,
      status: 'active'
    });

  if (enrollError) {
    console.error('Create enrollment failed:', enrollError);
    return NextResponse.json({ error: 'Payment verified, but failed to activate enrollment' }, { status: 500 });
  }

  // 5. Process Coupon Uses if a coupon was used
  if (payment.coupon_id) {
    await supabase.from('coupon_uses').insert({
      coupon_id: payment.coupon_id,
      user_id: session.userId,
      payment_id: payment.id
    });

    // Fetch and increment uses count on coupons
    const { data: coupon } = await supabase
      .from('coupons')
      .select('uses_count')
      .eq('id', payment.coupon_id)
      .single();

    if (coupon) {
      await supabase
        .from('coupons')
        .update({ uses_count: (coupon.uses_count || 0) + 1 })
        .eq('id', payment.coupon_id);
    }
  }

  // 6. Initialize course progress record for this student
  const { count: totalLessons } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', payment.course_id);

  await supabase.from('course_progress').upsert({
    user_id: session.userId,
    course_id: payment.course_id,
    lessons_completed: 0,
    total_lessons: totalLessons || 0,
    percent_complete: 0,
    certificate_issued: false
  }, { onConflict: 'user_id,course_id' });

  return NextResponse.json({ success: true });
}
