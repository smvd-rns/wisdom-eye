import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabase } from '@/lib/supabase';

// Standard dynamic marker to force dynamic server execution (avoiding static route compilation)
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, mobile, deliveryType, addressDetails } = body;

    // 1. Validate mandatory fields
    if (!name || !email || !mobile || !deliveryType) {
      return NextResponse.json(
        { error: 'Missing mandatory fields: name, email, mobile, and deliveryType are required.' },
        { status: 400 }
      );
    }

    if (deliveryType !== 'pickup' && deliveryType !== 'delivery') {
      return NextResponse.json(
        { error: "Invalid deliveryType. Must be 'pickup' or 'delivery'." },
        { status: 400 }
      );
    }

    // 2. Validate address if delivery type is home delivery
    if (deliveryType === 'delivery') {
      if (!addressDetails || !addressDetails.address || !addressDetails.city || !addressDetails.state || !addressDetails.pincode) {
        return NextResponse.json(
          { error: 'Missing address details for Home Delivery option.' },
          { status: 400 }
        );
      }
    }

    // 3. Determine amount based on delivery type (INR)
    // Book cost = dynamic basePrice. Self pick-up fee = ₹0. Home delivery fee = ₹50.
    const basePrice = Number(body.basePrice) || 200;
    const shippingFee = deliveryType === 'delivery' ? 50 : 0;
    const totalAmount = basePrice + shippingFee;
    const totalAmountInPaise = totalAmount * 100; // Razorpay takes amount in paise

    // 4. Initialize Razorpay
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('Razorpay API keys missing in environment variables!');
      return NextResponse.json(
        { error: 'Payment gateway configuration issue on server. Please try again later.' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // 5. Create Razorpay Order
    const options = {
      amount: totalAmountInPaise,
      currency: 'INR',
      receipt: `rec_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    const order = await razorpay.orders.create(options);

    // 6. Insert Pending Registration record into Supabase PostgreSQL
    const { error: dbError } = await supabase
      .from('registrations')
      .insert([
        {
          name,
          email: email.toLowerCase().trim(),
          mobile: mobile.trim(),
          delivery_type: deliveryType,
          address: deliveryType === 'delivery' ? addressDetails.address.trim() : null,
          city: deliveryType === 'delivery' ? addressDetails.city.trim() : null,
          state: deliveryType === 'delivery' ? addressDetails.state.trim() : null,
          pincode: deliveryType === 'delivery' ? addressDetails.pincode.trim() : null,
          amount_paid: totalAmount,
          razorpay_order_id: order.id,
          payment_status: 'pending',
          graphy_status: 'pending',
          shipping_status: deliveryType === 'delivery' ? 'pending_shipment' : 'not_applicable',
        },
      ]);

    if (dbError) {
      console.error('Supabase DB Insert Error:', dbError);
      return NextResponse.json(
        { error: 'Failed to record registration order. Please contact administrator.' },
        { status: 500 }
      );
    }

    // 7. Return Razorpay order details to frontend client
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId, // Sending public Key ID for Razorpay frontend checkout
    });

  } catch (error) {
    console.error('Create Order Error:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred.' },
      { status: 500 }
    );
  }
}
