import Link from 'next/link';

export default function ContactUs() {
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
        <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Contact Us</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Get in touch with the Wisdom Eye course administrators</p>

        <div className="grid-2">
          {/* Card 1: Contact details */}
          <div className="card">
            <h3 style={{ fontSize: '22px', marginBottom: '20px' }}>Our Office</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '15px' }}>
              <div>
                <strong>Entity Name:</strong>
                <p>VOICE Publication (ISKCON Pune NVCC)</p>
              </div>
              <div>
                <strong>Physical Address:</strong>
                <p>ISKCON NVCC, Katraj-Kondhwa Road, Tilekar Nagar, Kondhwa Budruk, Hare Krishna Chowk, Pune, Maharashtra, 411048, India</p>
              </div>
              <div>
                <strong>Email:</strong>
                <p><a href="mailto:manager@voicepune.com" style={{ color: 'var(--accent)' }}>manager@voicepune.com</a></p>
              </div>
              <div>
                <strong>Mobile/Phone:</strong>
                <p><a href="tel:+918605036000" style={{ color: 'var(--accent)' }}>+91 8605036000</a></p>
              </div>
            </div>
          </div>

          {/* Card 2: Hours / Support */}
          <div className="card">
            <h3 style={{ fontSize: '22px', marginBottom: '20px' }}>Support Hours</h3>
            <p style={{ marginBottom: '16px', fontSize: '15px' }}>Our dedicated team is here to assist you with course registration, payment issues, book collections, or delivery tracking:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span>Monday - Friday</span>
                <strong>10:00 AM - 6:00 PM</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span>Saturday</span>
                <strong>10:00 AM - 2:00 PM</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px' }}>
                <span>Sunday</span>
                <strong>Closed</strong>
              </div>
            </div>
            <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Please expect a response to emails within 24-48 business hours.</p>
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
