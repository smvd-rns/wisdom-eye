import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Graphy Webhook received:', JSON.stringify(body));

    // Graphy webhooks send standard payloads. We check the event type.
    // Standard payload details:
    // Event: "user.course.enrolled" or similar
    // Data: { email, name, mobile, courseId }
    const event = body.event || body.eventType;
    const data = body.data || body;

    const email = data.email || data.user_email || (data.user && data.user.email);
    const name = data.name || data.user_name || (data.user && data.user.name) || 'Graphy Student';
    const mobile = data.mobile || data.user_mobile || (data.user && data.user.mobile) || 'N/A';
    const courseId = data.courseId || data.course_id || (data.course && data.course.id);

    // 1. Verify the course ID is our Wisdom Eye course
    const targetCourseId = process.env.GRAPHY_COURSE_ID || '689c419d8fb8275d3690dac1';
    if (courseId && String(courseId) !== String(targetCourseId)) {
      console.log(`Webhook ignored: Course ID ${courseId} does not match targeted Wisdom Eye course ${targetCourseId}`);
      return NextResponse.json({ success: true, message: 'Event ignored: Course ID mismatch.' });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email missing from webhook payload.' }, { status: 400 });
    }

    // 2. Check if learner already exists in our Supabase records
    const cleanEmail = email.toLowerCase().trim();
    const { data: existingReg, error: selectError } = await supabase
      .from('registrations')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (selectError) {
      console.error('Supabase query error in Graphy Webhook:', selectError);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    if (existingReg) {
      console.log(`Student ${cleanEmail} already exists in shipping registers. Updating Graphy enrollment status.`);
      
      // Update Graphy status to success if it was marked as failed/pending
      if (existingReg.graphy_status !== 'success') {
        await supabase
          .from('registrations')
          .update({ graphy_status: 'success' })
          .eq('id', existingReg.id);
      }
      
      return NextResponse.json({ success: true, message: 'Student record already exists. Status updated.' });
    }

    // 3. Create a new record in registrations table since this student enrolled directly on Graphy
    // We log it so the admin knows to deliver them their physical study materials!
    const { error: insertError } = await supabase
      .from('registrations')
      .insert([
        {
          name,
          email: cleanEmail,
          mobile: mobile.trim(),
          delivery_type: 'pickup', // Default to pickup since no shipping address is present in Graphy checkout
          address: 'Enrolled via Graphy Webhook directly. Please verify shipping address.',
          city: 'Address Needed',
          state: 'Address Needed',
          pincode: '000000',
          amount_paid: 200, // Default course base price
          payment_status: 'paid',
          graphy_status: 'success',
          shipping_status: 'pending_shipment', // Put in admin queue so staff can follow up for shipping details
        },
      ]);

    if (insertError) {
      console.error('Failed to log direct Graphy enrollment in webhook:', insertError);
      return NextResponse.json({ error: 'Failed to record registration' }, { status: 500 });
    }

    console.log(`Direct Graphy enrollment successfully logged in database for: ${cleanEmail}`);
    return NextResponse.json({ success: true, message: 'Direct Graphy enrollment logged in system for books shipment.' });

  } catch (error) {
    console.error('Graphy Webhook Route Exception:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
