import nodemailer from 'nodemailer';

// Create a reusable transporter using SMTP configuration
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(port),
    secure: parseInt(port) === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Sends a beautiful HTML enrollment email to the learner.
 */
export async function sendEnrollmentEmail({ email, name, deliveryType, amount, websiteUrl }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('SMTP configuration missing. Skipping custom HTML enrollment email.');
    return false;
  }

  const fromEmail = process.env.SMTP_FROM_EMAIL || 'manager@voicepune.com';
  const fromName = process.env.SMTP_FROM_NAME || 'Wisdom Eye VOICE';
  const courseUrl = 'https://coursesradheshyamdas.ongraphy.com/courses/Wisdom-Eye-689c419d8fb8275d3690dac1';
  const trackingUrl = `${websiteUrl || 'http://localhost:3000'}/track`;

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: '📚 Enrolled in Wisdom Eye Course - VOICE Pune',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Wisdom Eye Enrollment</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #F4F5F8;
            color: #1A1B4B;
            margin: 0;
            padding: 0;
            line-height: 1.6;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            border: 1px solid #E2E8F0;
          }
          .email-header {
            background: linear-gradient(135deg, #1A1B4B 0%, #3B1C5B 100%);
            color: #ffffff;
            padding: 40px 30px;
            text-align: center;
          }
          .email-logo {
            font-size: 48px;
            margin-bottom: 12px;
          }
          .email-header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .email-body {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #1A1B4B;
          }
          .intro-text {
            font-size: 15px;
            color: #4A5568;
            margin-bottom: 24px;
          }
          .receipt-card {
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 28px;
          }
          .receipt-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 14px;
          }
          .receipt-row:last-child {
            margin-bottom: 0;
            border-top: 1px solid #E2E8F0;
            padding-top: 10px;
            font-weight: 700;
          }
          .btn-container {
            text-align: center;
            margin: 32px 0;
          }
          .btn-primary {
            background-color: #FF9800;
            color: #ffffff !important;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 16px;
            display: inline-block;
            box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
          }
          .next-steps {
            background-color: #FFF9C4;
            border-left: 4px solid #FBC02D;
            padding: 16px;
            border-radius: 4px 12px 12px 4px;
            margin-bottom: 28px;
            font-size: 14px;
          }
          .next-steps h3 {
            margin: 0 0 8px 0;
            color: #F57F17;
            font-size: 16px;
          }
          .email-footer {
            background-color: #F8FAFC;
            border-top: 1px solid #E2E8F0;
            padding: 24px 30px;
            text-align: center;
            font-size: 12px;
            color: #718096;
          }
          .email-footer a {
            color: #FF9800;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <div class="email-logo">📚</div>
            <h1>Wisdom Eye Course</h1>
            <p style="margin: 4px 0 0 0; color: #FFF9C4; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Registration Confirmed</p>
          </div>
          
          <div class="email-body">
            <div class="greeting">Hare Krishna, ${name}!</div>
            <p class="intro-text">
              Thank you for enrolling in the <strong>Wisdom Eye</strong> course. Your payment has been successfully processed, and you have been registered on our learning portal.
            </p>

            <div class="receipt-card">
              <div class="receipt-row">
                <span>Course Name:</span>
                <strong>Wisdom Eye LMS</strong>
              </div>
              <div class="receipt-row">
                <span>Distribution Mode:</span>
                <strong>${deliveryType === 'delivery' ? 'Home Delivery Parcel' : 'Self Pick Up (NVCC Temple)'}</strong>
              </div>
              <div class="receipt-row">
                <span>Amount Paid:</span>
                <strong>₹${amount}</strong>
              </div>
            </div>

            <div class="next-steps">
              <h3>🚀 Access Your Learning Portal</h3>
              <p style="margin: 0;">
                We have registered your account on Graphy. Click the button below to sign in and start watching the video lessons and taking the MCQ tests.
              </p>
            </div>

            <div class="btn-container">
              <a href="${courseUrl}" class="btn-primary" target="_blank">Go to Wisdom Eye Course</a>
            </div>

            ${
              deliveryType === 'delivery' 
              ? `
              <div style="font-size: 14px; color: #4A5568; margin-top: 20px; border-top: 1px dashed #E2E8F0; padding-top: 20px;">
                <strong>🚚 Parcel Dispatch:</strong> We will ship your copy of the Bhagavad Gita and Wisdom Eye book to your shipping address within 2-3 business days.
                <br><br>
                You can track your dispatch parcel and find your tracking ID at any time here:
                <div style="margin-top: 10px;">
                  <a href="${trackingUrl}" style="color: #FF9800; font-weight: 700; text-decoration: underline;">Track Shipment Status</a>
                </div>
              </div>
              `
              : `
              <div style="font-size: 14px; color: #4A5568; margin-top: 20px; border-top: 1px dashed #E2E8F0; padding-top: 20px;">
                <strong>🏠 Self Pick Up:</strong> Please visit the **VOICE Office** at ISKCON Pune (NVCC) to collect your physical book materials. Show this email at the counter to verify your collection.
              </div>
              `
            }
          </div>

          <div class="email-footer">
            <p>Need support? Write to us at <a href="mailto:manager@voicepune.com">manager@voicepune.com</a> or call +91 8605036000.</p>
            <p>&copy; ${new Date().getFullYear()} Wisdom Eye / VOICE Publication, ISKCON Pune. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Enrollment email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending custom enrollment email via nodemailer:', error);
    return false;
  }
}

/**
 * Sends an email notification when shipment details are updated.
 */
export async function sendShipmentEmail({ email, name, trackingId, courierStatus, websiteUrl }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('SMTP configuration missing. Skipping custom HTML shipment update email.');
    return false;
  }

  const fromEmail = process.env.SMTP_FROM_EMAIL || 'manager@voicepune.com';
  const fromName = process.env.SMTP_FROM_NAME || 'Wisdom Eye VOICE';
  const trackingUrl = `${websiteUrl || 'http://localhost:3000'}/track`;

  // Parse Courier details
  let courierName = 'Courier Partner';
  let trackId = trackingId || 'N/A';
  let trackUrl = '';

  if (trackingId) {
    let courier = 'other';
    if (trackingId.includes(':')) {
      const parts = trackingId.split(':');
      courier = parts[0];
      trackId = parts.slice(1).join(':');
    }

    switch (courier.toLowerCase()) {
      case 'speedpost':
        courierName = 'Indian Post (Speed Post)';
        trackUrl = 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx';
        break;
      case 'dtdc':
        courierName = 'DTDC';
        trackUrl = `https://www.dtdc.in/tracking/tracking-results.xhtml?trackId=${trackId}`;
        break;
      case 'delhivery':
        courierName = 'Delhivery';
        trackUrl = `https://www.delhivery.com/track/share?status=track&id=${trackId}`;
        break;
      case 'bluedart':
        courierName = 'Blue Dart';
        trackUrl = `https://www.bluedart.com/tracking?trackId=${trackId}`;
        break;
      case 'amazon':
        courierName = 'Amazon Shipping';
        trackUrl = `https://track.amazon.in/?trackingId=${trackId}`;
        break;
      case 'other':
      default:
        if (trackId.includes('|')) {
          const parts = trackId.split('|');
          courierName = parts[0] || 'Courier';
          trackId = parts[1] || '';
          trackUrl = parts[2] || '';
        } else {
          courierName = 'Courier';
          if (trackId.startsWith('http://') || trackId.startsWith('https://')) {
            trackUrl = trackId;
          }
        }
        break;
    }
  }

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: '🚚 Your Wisdom Eye Book Package Has Been Shipped!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Wisdom Eye Shipping Update</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #F4F5F8;
            color: #1A1B4B;
            margin: 0;
            padding: 0;
            line-height: 1.6;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            border: 1px solid #E2E8F0;
          }
          .email-header {
            background: linear-gradient(135deg, #1A1B4B 0%, #3B1C5B 100%);
            color: #ffffff;
            padding: 40px 30px;
            text-align: center;
          }
          .email-logo {
            font-size: 48px;
            margin-bottom: 12px;
          }
          .email-header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .email-body {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #1A1B4B;
          }
          .intro-text {
            font-size: 15px;
            color: #4A5568;
            margin-bottom: 24px;
          }
          .tracking-card {
            background-color: #E3F2FD;
            border: 1px solid #BBDEFB;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 28px;
            color: #0D47A1;
          }
          .tracking-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .btn-container {
            text-align: center;
            margin: 32px 0;
          }
          .btn-primary {
            background-color: #FF9800;
            color: #ffffff !important;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 16px;
            display: inline-block;
            box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
          }
          .email-footer {
            background-color: #F8FAFC;
            border-top: 1px solid #E2E8F0;
            padding: 24px 30px;
            text-align: center;
            font-size: 12px;
            color: #718096;
          }
          .email-footer a {
            color: #FF9800;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <div class="email-logo">🚚</div>
            <h1>Package Shipped</h1>
            <p style="margin: 4px 0 0 0; color: #FFF9C4; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Transit Update</p>
          </div>
          
          <div class="email-body">
            <div class="greeting">Hare Krishna, ${name}!</div>
            <p class="intro-text">
              Great news! Your printed study materials (Bhagavad Gita and Wisdom Eye book) have been packed and handed over to our delivery courier partner.
            </p>

            <div class="tracking-card">
              <div class="tracking-title">📦 Shipment Tracking Details</div>
              <div style="font-size: 14px; line-height: 1.5;">
                Status: <strong>${courierStatus === 'shipped' ? 'Shipped (In Transit)' : courierStatus}</strong><br>
                Courier Partner: <strong>${courierName}</strong><br>
                Tracking ID: <strong style="font-family: monospace;">${trackId}</strong>
                ${trackUrl ? `<br><br><a href="${trackUrl}" target="_blank" style="color: #0D47A1; font-weight: 700; text-decoration: underline;">Open Courier Tracking Portal &rarr;</a>` : ''}
              </div>
            </div>

            <p style="font-size: 14px; color: #4A5568;">
              You can check real-time transit details and view delivery details on our tracking portal:
            </p>

            <div class="btn-container">
              <a href="${trackingUrl}" class="btn-primary" target="_blank">Track Order Status</a>
            </div>

            <p style="font-size: 13px; color: #718096;">
              Please allow 3-6 business days for the courier to deliver your package to your address.
            </p>
          </div>

          <div class="email-footer">
            <p>Need support? Write to us at <a href="mailto:manager@voicepune.com">manager@voicepune.com</a> or call +91 8605036000.</p>
            <p>&copy; ${new Date().getFullYear()} Wisdom Eye / VOICE Publication, ISKCON Pune. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Shipment email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending custom shipment email via nodemailer:', error);
    return false;
  }
}

/**
 * Sends a notification email when a subjective quiz attempt is graded.
 */
export async function sendGradedNotificationEmail({ email, name, quizTitle, score, totalMarks, passed, feedback }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('SMTP config missing. Skipping custom HTML grading email.');
    return false;
  }

  const fromEmail = process.env.SMTP_FROM_EMAIL || 'manager@voicepune.com';
  const fromName = process.env.SMTP_FROM_NAME || 'Wisdom Eye VOICE';

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: `📝 Quiz Graded: ${quizTitle} - Wisdom Eye`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 10px; padding: 24px; background: #fff;">
        <h2 style="color: #1A1B4B; margin-top: 0;">Your Quiz Has Been Graded</h2>
        <p>Hare Krishna, ${name},</p>
        <p>Your subjective answers for the quiz <strong>${quizTitle}</strong> have been reviewed by an evaluator.</p>
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Score:</strong> ${score} / ${totalMarks} marks</p>
          <p style="margin: 0 0 8px 0;"><strong>Result:</strong> <span style="font-weight: bold; color: ${passed ? '#10B981' : '#EF4444'}">${passed ? 'PASSED' : 'FAILED'}</span></p>
          ${feedback ? `<p style="margin: 0;"><strong>Evaluator Feedback:</strong> "${feedback}"</p>` : ''}
        </div>
        <p style="font-size: 13px; color: #6B7280; margin-top: 24px;">This is an automated notification. Please log in to the student portal to review detailed answers.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending grading notification email:', error);
    return false;
  }
}

/**
 * Sends an email completion card when a course is 100% completed.
 */
export async function sendCompletionNotificationEmail({ email, name, courseTitle }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('SMTP config missing. Skipping course completion notification.');
    return false;
  }

  const fromEmail = process.env.SMTP_FROM_EMAIL || 'manager@voicepune.com';
  const fromName = process.env.SMTP_FROM_NAME || 'Wisdom Eye VOICE';

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: `🎓 Course Completed: ${courseTitle} - Wisdom Eye`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 10px; padding: 24px; background: #fff; text-align: center;">
        <span style="font-size: 48px;">🏆</span>
        <h2 style="color: #1A1B4B; margin-top: 14px;">Congratulations, ${name}!</h2>
        <p style="font-size: 16px; color: #4B5563;">You have successfully completed 100% of the course:</p>
        <h3 style="color: #997300; font-size: 20px; margin: 10px 0 24px;">${courseTitle}</h3>
        <p style="font-size: 14px; color: #4A5568; line-height: 1.6;">
          Your certificate has been issued and is available for download under the "Certificates" tab in your student dashboard.
        </p>
        <p style="font-size: 13px; color: #6B7280; margin-top: 28px;">Thank you for your dedicated efforts and commitment to spiritual growth and values education.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending completion notification email:', error);
    return false;
  }
}
