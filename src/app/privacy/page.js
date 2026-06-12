import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
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
      <main className="container" style={{ paddingTop: '120px', paddingBottom: '60px', flex: 1, maxWidth: '800px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Last updated: June 12, 2026</p>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', lineHeight: '1.7' }}>
          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>1. Information We Collect</h3>
            <p>To process your enrollment and deliver physical study materials, we collect the following personal information:
              <ul>
                <li>Full Name</li>
                <li>Email Address</li>
                <li>Mobile Number</li>
                <li>Shipping Address (only if Home Delivery is selected)</li>
              </ul>
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>2. How We Use Your Information</h3>
            <p>The collected information is used to:
              <ul>
                <li>Process payments via Razorpay.</li>
                <li>Automatically enroll you in the course on Graphy (the course hosting platform).</li>
                <li>Ship the Bhagavad Gita and Wisdom Eye book parcel to your address (for Home Delivery users).</li>
                <li>Send important updates, course schedules, and receipt confirmations.</li>
              </ul>
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>3. Data Sharing</h3>
            <p>We do not sell or lease your personal information to third parties. We share data only with trusted service providers necessary for operations:
              <ul>
                <li><strong>Razorpay</strong>: To verify and process payment transactions.</li>
                <li><strong>Graphy</strong>: To establish your student account and grant you course access.</li>
                <li><strong>Courier/Delivery Services</strong>: To ship your book parcel (name, phone, address).</li>
              </ul>
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>4. Data Security</h3>
            <p>We implement industry-standard security measures, including HTTPS encryption and secure database structures via Supabase, to protect your personal details from unauthorized access, loss, or disclosure.</p>
          </section>

          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>5. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at:
              <br /><strong>Email:</strong> manager@voicepune.com
              <br /><strong>Phone:</strong> +91 8605036000
            </p>
          </section>
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
