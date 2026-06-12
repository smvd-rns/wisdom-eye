import Link from 'next/link';

export default function TermsAndConditions() {
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
        <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Terms & Conditions</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Last updated: June 12, 2026</p>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', lineHeight: '1.7' }}>
          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>1. Introduction</h3>
            <p>Welcome to <strong>Wisdom Eye</strong>. These Terms & Conditions govern your use of our website and purchase of our course and materials. By accessing this website and registering for the course, you agree to comply with and be bound by these terms.</p>
          </section>

          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>2. Course Enrollment & Fees</h3>
            <p>By registering for the Wisdom Eye course, you agree to pay the specified registration fee:
              <ul>
                <li>₹200 for the course including materials (Bhagavad Gita and Wisdom Eye book) with Self Pick Up.</li>
                <li>₹250 for the course including materials with Home Delivery via parcel (+₹50 delivery charge).</li>
              </ul>
              All payments are processed securely through Razorpay.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>3. Course Content Access</h3>
            <p>The Wisdom Eye course videos and MCQ quizzes are hosted on the Graphy platform. Upon successful payment verification on our site, you will be enrolled automatically on Graphy. You are responsible for maintaining the confidentiality of your Graphy account credentials. Content sharing or distribution without permission is strictly prohibited.</p>
          </section>

          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>4. Physical Book Distribution</h3>
            <p>If you select <strong>Self Pick Up</strong>, you must collect your book materials from the specified ISKCON center. If you select <strong>Home Delivery</strong>, we will ship the book parcel to the address you provided. We are not responsible for delivery delays caused by incorrect address entries or carrier failures.</p>
          </section>

          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>5. Limitation of Liability</h3>
            <p>Wisdom Eye (VOICE Publication) and its associated entities shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use this website, the course materials, or the learning platform.</p>
          </section>

          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>6. Contact Information</h3>
            <p>For any questions or clarifications regarding these terms, please contact us at:
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
