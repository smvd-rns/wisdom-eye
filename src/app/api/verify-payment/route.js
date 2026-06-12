import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { sendEnrollmentEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';

// Helper function to call the Graphy Enroll Learner API
async function enrollInGraphy(email, name, mobile) {
  const merchantId = process.env.GRAPHY_MERCHANT_ID;
  const apiKey = process.env.GRAPHY_API_KEY;
  const courseId = process.env.GRAPHY_COURSE_ID || '689c419d8fb8275d3690dac1';

  if (!merchantId || !apiKey) {
    console.error('Graphy integration credentials missing (GRAPHY_MERCHANT_ID or GRAPHY_API_KEY).');
    throw new Error('Graphy credentials not configured');
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanName = name.trim();
  const cleanMobile = mobile.trim();

  console.log(`Starting Graphy 2-step enrollment for: ${cleanEmail}`);

  // Step 1: Register Learner
  try {
    const signupParams = new URLSearchParams();
    signupParams.append('mid', merchantId);
    signupParams.append('key', apiKey);
    signupParams.append('email', cleanEmail);
    signupParams.append('name', cleanName);
    signupParams.append('mobile', cleanMobile);
    signupParams.append('sendEmail', 'true');

    const signupRes = await fetch('https://api.ongraphy.com/public/v1/learners', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: signupParams.toString(),
    });

    const signupText = await signupRes.text();
    console.log(`Graphy Register Status: ${signupRes.status}, Response:`, signupText);
  } catch (err) {
    console.error('Error during Graphy registration step:', err.message);
  }

  // Step 2: Assign Course
  try {
    const assignParams = new URLSearchParams();
    assignParams.append('mid', merchantId);
    assignParams.append('key', apiKey);
    assignParams.append('email', cleanEmail);
    assignParams.append('productId', courseId);

    const assignRes = await fetch('https://api.ongraphy.com/public/v1/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: assignParams.toString(),
    });

    if (!assignRes.ok) {
      console.error(`Graphy assign API request failed with status: ${assignRes.status}`);
      return false;
    }

    const assignText = await assignRes.text();
    console.log(`Graphy Assign Status: ${assignRes.status}, Response:`, assignText);

    let assignData = {};
    try {
      assignData = JSON.parse(assignText);
    } catch (e) {
      console.error('Failed to parse assign response as JSON:', assignText);
      return false;
    }

    if (assignData.status === 'success') {
      console.log('Graphy course assignment succeeded.');
      return true;
    }

    if (assignData.error && (assignData.error.code === 19 || String(assignData.error.message).toLowerCase().includes('already assigned'))) {
      console.log('Graphy course was already assigned to user. Treating as success.');
      return true;
    }

    console.error('Graphy course assignment failed with error:', assignData.error);
    return false;
  } catch (err) {
    console.error('Error during Graphy assignment step:', err.message);
    return false;
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // 1. Check required parameters
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment signature verification parameters.' },
        { status: 400 }
      );
    }

    // 2. Retrieve the original registration record from Supabase
    const { data: registration, error: selectError } = await supabase
      .from('registrations')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (selectError || !registration) {
      console.error('Record not found for order:', razorpay_order_id, selectError);
      return NextResponse.json(
        { error: 'Registration order record not found.' },
        { status: 404 }
      );
    }

    // 3. Verify Razorpay Payment Signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: 'Payment signature secret missing on server.' },
        { status: 500 }
      );
    }

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isSignatureValid = generatedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.error('Invalid Razorpay signature for order:', razorpay_order_id);
      
      // Update registration status to failed in database
      await supabase
        .from('registrations')
        .update({ payment_status: 'failed' })
        .eq('razorpay_order_id', razorpay_order_id);

      return NextResponse.json(
        { error: 'Invalid payment signature. Transaction verification failed.' },
        { status: 400 }
      );
    }

    console.log(`Payment verified successfully for order: ${razorpay_order_id}`);

    // 4. Trigger Graphy enrollment
    const isEnrolled = await enrollInGraphy(registration.email, registration.name, registration.mobile);

    // 5. Update Registration status to Paid and set Graphy status in Supabase
    const { error: updateError } = await supabase
      .from('registrations')
      .update({
        payment_status: 'paid',
        razorpay_payment_id: razorpay_payment_id,
        graphy_status: isEnrolled ? 'success' : 'failed',
      })
      .eq('razorpay_order_id', razorpay_order_id);

    // 6. Send beautiful custom HTML enrollment email confirmation
    if (!updateError) {
      try {
        const origin = req.headers.get('origin') || 'http://localhost:3000';
        await sendEnrollmentEmail({
          email: registration.email,
          name: registration.name,
          deliveryType: registration.delivery_type,
          amount: registration.amount_paid,
          websiteUrl: origin,
        });
      } catch (mailErr) {
        console.error('Failed to send HTML enrollment notification email:', mailErr);
      }
    }

    if (updateError) {
      console.error('Failed to update Supabase record to paid:', updateError);
      return NextResponse.json(
        { error: 'Payment verified but failed to update dashboard status. Please contact support.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and learner registration updated.',
      enrolledOnGraphy: isEnrolled,
    });

  } catch (error) {
    console.error('Verify Payment Error:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred.' },
      { status: 500 }
    );
  }
}
