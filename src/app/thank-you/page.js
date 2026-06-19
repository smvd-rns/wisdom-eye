'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, Mail, BookCheck, ShieldAlert, ArrowRight } from 'lucide-react';

export default function ThankYouPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [amount, setAmount] = useState('200');
  const [courseName, setCourseName] = useState('Wisdom Eye');
  const [courseUrl, setCourseUrl] = useState('https://coursesradheshyamdas.ongraphy.com/courses/Wisdom-Eye-689c419d8fb8275d3690dac1');

  useEffect(() => {
    // Read query parameters in client environment
    const params = new URLSearchParams(window.location.search);
    setName(params.get('name') || 'Learner');
    setEmail(params.get('email') || 'your email');
    setDeliveryType(params.get('type') || 'pickup');
    setAmount(params.get('amount') || '200');
    setCourseName(params.get('courseName') || 'Wisdom Eye');
    setCourseUrl(params.get('courseUrl') || 'https://coursesradheshyamdas.ongraphy.com/courses/Wisdom-Eye-689c419d8fb8275d3690dac1');
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-light)' }}>
      
      {/* Navbar Minimalist */}
      <header className="navbar scrolled">
        <div className="container">
          <Link href="/" className="logo">
            <div className="logo-icon">👁</div>
            <span>Wisdom Eye</span>
          </Link>
          <Link href="/" className="btn btn-secondary" style={{ padding: '8px 20px' }}>
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ paddingTop: '140px', paddingBottom: '80px', flex: 1, maxWidth: '600px' }}>
        <div className="card text-center" style={{ padding: '48px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          
          {/* Animated Success Checkmark Ring */}
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: '#2E7D32', border: '2px solid #C8E6C9' }}>
            <Check size={40} />
          </div>

          <div>
            <span className="section-tag" style={{ color: '#2E7D32', fontWeight: '800' }}>Registration Successful</span>
            <h1 style={{ fontSize: '32px', margin: '8px 0 16px 0', color: 'var(--primary)' }}>Thank You, {name}!</h1>
            <p className="card-desc" style={{ fontSize: '15px' }}>
              We have processed your payment of <strong>₹{amount}</strong>. Your registration for the <strong>{courseName}</strong> course is confirmed.
            </p>
          </div>

          {/* Quick Info Box */}
          <div style={{ width: '100%', backgroundColor: 'var(--bg-light)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', fontSize: '14px' }}>
              <span>Registered Email:</span>
              <strong>{email}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', fontSize: '14px' }}>
              <span>Book Material Mode:</span>
              <strong>{deliveryType === 'delivery' ? 'Home Delivery Parcel' : 'Self Pick Up (Temple)'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span>Amount Paid:</span>
              <strong>₹{amount}</strong>
            </div>
          </div>

          {/* Next Steps Instructions */}
          <div style={{ textAlign: 'left', width: '100%' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookCheck size={20} style={{ color: 'var(--secondary)' }} />
              What are your next steps?
            </h3>
            
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(26,27,75,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: '700', flexShrink: 0, fontSize: '12px' }}>1</div>
                <div>
                  <strong>Check your Inbox:</strong> We have automatically initiated your enrollment on the Graphy platform. Check your email (including spam/promotions) for a message from <em>Graphy</em> containing your credentials and class link.
                </div>
              </li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(26,27,75,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: '700', flexShrink: 0, fontSize: '12px' }}>2</div>
                <div>
                  <strong>Collect / Receive Books:</strong>
                  {deliveryType === 'delivery' ? (
                    <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>We will parcel and ship the Bhagavad Gita and Wisdom Eye book to your address. You will receive courier dispatch updates within 2-3 business days.</p>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Please visit the VOICE office at ISKCON Pune (NVCC) to collect your books. Bring your payment receipt or show your welcome email at the counter.</p>
                  )}
                </div>
              </li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(26,27,75,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: '700', flexShrink: 0, fontSize: '12px' }}>3</div>
                <div>
                  <strong>Log in and Study:</strong> Go to the Graphy portal, watch the video lectures, complete the 6 lesson check-in quizzes, and qualify for your course certification!
                </div>
              </li>
            </ul>
          </div>

          <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <a 
              href={courseUrl} 
              target="_blank" 
              className="btn btn-primary" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              Go directly to {courseName} Course <ArrowRight size={16} />
            </a>

            {deliveryType === 'delivery' && (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                🚚 You can track your courier dispatch status at any time on our <Link href="/track" style={{ color: 'var(--accent)', fontWeight: '700', textDecoration: 'underline' }}>Track Order Page</Link>.
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              <ShieldAlert size={14} /> Need help? Email us at manager@voicepune.com
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="footer" style={{ padding: '24px 0', marginTop: 'auto' }}>
        <div className="container text-center">
          <p>&copy; {new Date().getFullYear()} Wisdom Eye / VOICE Publication. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
