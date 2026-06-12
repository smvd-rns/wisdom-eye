import Link from 'next/link';

export default function RefundPolicy() {
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
        <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Refund & Cancellation Policy</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Last updated: June 12, 2026</p>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', lineHeight: '1.7' }}>
          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>1. Refund Overview</h3>
            <p>Our goal is to ensure a meaningful learning experience. Due to the digital nature of the course content and the immediate dispatch or collection of physical books, we follow a strict refund and cancellation policy.</p>
          </section>

          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>2. Refund Eligibility</h3>
            <p>
              <ul>
                <li><strong>Course access</strong>: Once you are enrolled in the course on Graphy and have accessed the platform, the registration fee is non-refundable.</li>
                <li><strong>Physical materials</strong>: Physical books (Bhagavad Gita and Wisdom Eye book) once collected or shipped are non-returnable.</li>
                <li><strong>Exceptions</strong>: In rare cases where double payment has occurred due to transaction glitches, we will initiate a refund for the duplicate transaction upon receiving verification details. Please mail us at manager@voicepune.com with transaction receipts.</li>
              </ul>
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>3. Damaged Goods</h3>
            <p>If you opted for Home Delivery and received damaged physical books, please notify us within 48 hours of delivery. We will ship a replacement copy of the book free of charge after receiving photographic proof of the damage.</p>
          </section>

          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>4. Process Time</h3>
            <p>For approved refund requests (e.g. duplicate payments), the refund will be processed and credited back to the original payment source (via Razorpay) within 5-7 working days.</p>
          </section>

          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>5. Contact for Returns</h3>
            <p>To report issues, please contact:
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
