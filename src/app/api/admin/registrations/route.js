import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabase';
import { sendEnrollmentEmail, sendShipmentEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';

// Helper to authenticate session and get role
function getSessionRole(req) {
  const tokenCookie = req.cookies.get('auth_token');
  if (!tokenCookie) return null;

  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
  try {
    const decoded = jwt.verify(tokenCookie.value, jwtSecret);
    return decoded.role; // returns 'admin' or 'viewer'
  } catch (err) {
    return null;
  }
}

// Helper to retry Graphy Enrollment
async function enrollInGraphy(email, name, mobile) {
  const merchantId = process.env.GRAPHY_MERCHANT_ID;
  const apiKey = process.env.GRAPHY_API_KEY;
  const courseId = process.env.GRAPHY_COURSE_ID || '689c419d8fb8275d3690dac1';

  if (!merchantId || !apiKey) {
    throw new Error('Graphy credentials not configured');
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanName = name.trim();
  const cleanMobile = mobile.trim();

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
    console.log(`Graphy Register Status: ${signupRes.status}, Response: ${signupText}`);
  } catch (err) {
    console.error('Error during Graphy registration step:', err.message);
  }

  // Step 2: Assign Course
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
    throw new Error(`Graphy assign API request failed with status: ${assignRes.status}`);
  }

  const assignText = await assignRes.text();
  console.log(`Graphy Assign Status: ${assignRes.status}, Response: ${assignText}`);

  let assignData = {};
  try {
    assignData = JSON.parse(assignText);
  } catch (e) {
    throw new Error(`Failed to parse assign response as JSON: ${assignText}`);
  }

  if (assignData.status === 'success') {
    return true;
  }

  if (assignData.error && (assignData.error.code === 19 || String(assignData.error.message).toLowerCase().includes('already assigned'))) {
    console.log('Graphy course was already assigned to user. Treating as success.');
    return true;
  }

  throw new Error(`Graphy course assignment failed: ${assignData.error ? assignData.error.message : assignText}`);
}

// GET registrations list (Allowed for both 'admin' and 'viewer')
export async function GET(req) {
  try {
    const role = getSessionRole(req);
    if (!role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all registrations from Supabase, sorted by creation date descending
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching registrations:', error);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    return NextResponse.json({ registrations: data });
  } catch (error) {
    console.error('GET registrations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST registration updates (Allowed ONLY for 'admin' role)
export async function POST(req) {
  try {
    const role = getSessionRole(req);
    if (!role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Restrict write access to 'admin' role only
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. View-only access cannot modify records.' }, { status: 403 });
    }

    const body = await req.json();
    const { action, registrationId, shippingStatus, trackingId } = body;

    if (!registrationId) {
      return NextResponse.json({ error: 'registrationId is required.' }, { status: 400 });
    }

    // ACTION: Update shipping status
    if (action === 'update_shipping') {
      if (!shippingStatus) {
        return NextResponse.json({ error: 'shippingStatus is required.' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('registrations')
        .update({
          shipping_status: shippingStatus,
          tracking_id: trackingId || null,
        })
        .eq('id', registrationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating shipping status:', error);
        return NextResponse.json({ error: 'Failed to update shipping status.' }, { status: 500 });
      }

      // If marked as Shipped and payment is confirmed, send shipment email alert to customer
      if (shippingStatus === 'shipped' && data.payment_status === 'paid') {
        try {
          const origin = req.headers.get('origin') || 'http://localhost:3000';
          await sendShipmentEmail({
            email: data.email,
            name: data.name,
            trackingId: data.tracking_id,
            courierStatus: data.shipping_status,
            websiteUrl: origin,
          });
        } catch (mailErr) {
          console.error('Failed to send shipping email notification:', mailErr);
        }
      }

      return NextResponse.json({ success: true, registration: data });
    }

    // ACTION: Retry Graphy enrollment
    if (action === 'retry_graphy') {
      // Get the existing registration record
      const { data: registration, error: fetchError } = await supabase
        .from('registrations')
        .select('*')
        .eq('id', registrationId)
        .single();

      if (fetchError || !registration) {
        return NextResponse.json({ error: 'Registration record not found.' }, { status: 404 });
      }

      let isEnrolled = false;
      try {
        isEnrolled = await enrollInGraphy(registration.email, registration.name, registration.mobile);
      } catch (err) {
        console.error('Graphy enrollment retry exception:', err);
      }

      // Update Graphy status in database
      const { data: updatedReg, error: updateError } = await supabase
        .from('registrations')
        .update({
          graphy_status: isEnrolled ? 'success' : 'failed',
        })
        .eq('id', registrationId)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update database record after retry.' }, { status: 500 });
      }

      // Send/Retry confirmation email to user upon successful registration retry
      if (isEnrolled) {
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
          console.error('Failed to send custom enrollment confirmation email on retry:', mailErr);
        }
      }

      return NextResponse.json({
        success: isEnrolled,
        registration: updatedReg,
        message: isEnrolled ? 'Learner successfully enrolled.' : 'Enrollment retry failed. Check credentials.',
      });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });

  } catch (error) {
    console.error('POST registrations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
