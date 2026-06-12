import Link from 'next/link';

export default function ShippingPolicy() {
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
        <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Shipping & Delivery Policy</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Last updated: June 12, 2026</p>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', lineHeight: '1.7' }}>
          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>1. Delivery Options</h3>
            <p>During the checkout process for the Wisdom Eye course, you can select one of the following options:
              <ul>
                <li><strong>Self Pick Up (₹0 Shipping Fee)</strong>: You will pick up your course materials (Bhagavad Gita and Wisdom Eye book) directly from the VOICE Publication / ISKCON center. Detailed collection times will be provided in your confirmation email.</li>
                <li><strong>Home Delivery (₹50 Shipping Fee)</strong>: We will ship the books directly to the delivery address you provide.</li>
              </ul>
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>2. Dispatch Timeline</h3>
            <p>For Home Delivery orders, books are dispatched within 2-3 business days after payment verification. You will receive an SMS/email with a shipping tracking ID once your parcel is handed over to the courier partner.</p>
          </section>

          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>3. Delivery Timeline</h3>
            <p>
              Depending on your location, expected delivery times are:
              <ul>
                <li><strong>Within Maharashtra / Pune</strong>: 2-4 business days.</li>
                <li><strong>Other parts of India</strong>: 5-8 business days.</li>
              </ul>
              Please note that shipping speeds are managed by our third-party delivery partners and may vary during national holidays or regional restrictions.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>4. Shipping Areas</h3>
            <p>We ship nationwide across India. Currently, we do not support international shipping directly through this landing page. If you are registering from outside India, please contact us at manager@voicepune.com for manual arrangements.</p>
          </section>

          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>5. Contact</h3>
            <p>For shipping status inquiries, you can use our <Link href="/track" style={{ color: 'var(--accent)', fontWeight: '700', textDecoration: 'underline' }}>Track Order Page</Link> or contact us at:
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
