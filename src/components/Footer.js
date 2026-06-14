'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Youtube, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer" style={styles.footer}>
      <div className="container" style={styles.container}>
        <div className="footer-grid">
          <div>
            <h3 style={styles.footerLogo}>Radheshyam Das</h3>
            <p style={styles.footerDesc}>
              Vedic Character & Leadership Mentoring under VOICE and VOICE Publication, ISKCON Pune.
            </p>
            <div style={styles.socialRow}>
              <a href="https://facebook.com" style={styles.socialLinkIcon}><Facebook size={16} /></a>
              <a href="https://youtube.com" style={styles.socialLinkIcon}><Youtube size={16} /></a>
              <a href="https://instagram.com" style={styles.socialLinkIcon}><Instagram size={16} /></a>
              <a href="https://linkedin.com" style={styles.socialLinkIcon}><Linkedin size={16} /></a>
            </div>
          </div>
          
          <div>
            <h4 style={styles.footerSectionTitle}>Core Links</h4>
            <ul style={styles.footerLinks}>
              <li><Link href="/about" style={styles.footerLink}>About Radheshyam Das</Link></li>
              <li><Link href="/books" style={styles.footerLink}>Books Store</Link></li>
              <li><Link href="/courses" style={styles.footerLink}>Scripture Academy</Link></li>
              <li><Link href="/media" style={styles.footerLink}>Media Library</Link></li>
              <li><Link href="/daily-reading" style={styles.footerLink}>Daily Reading</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={styles.footerSectionTitle}>Policies</h4>
            <ul style={styles.footerLinks}>
              <li><Link href="/terms" style={styles.footerLink}>Terms & Conditions</Link></li>
              <li><Link href="/privacy" style={styles.footerLink}>Privacy Policy</Link></li>
              <li><Link href="/refund-policy" style={styles.footerLink}>Refund Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={styles.footerSectionTitle}>Contact Info</h4>
            <ul style={styles.footerLinks}>
              <li style={styles.footerInfo}><MapPin size={12} /> Govardhan Ecovillage, Wada, Maharashtra</li>
              <li style={styles.footerInfo}><Mail size={12} /> manager@voicepune.com</li>
              <li style={styles.footerInfo}><Phone size={12} /> +91 8605036000</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Radheshyam Das / VOICE Publications. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: '#1A1B4B',
    color: 'rgba(255,255,255,0.7)',
    padding: '64px 24px 24px',
    marginTop: 'auto',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: '1.5fr repeat(3, 1fr)',
    gap: '40px',
    marginBottom: '48px',
  },
  footerLogo: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '22px',
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: '16px',
  },
  footerDesc: {
    fontSize: '13px',
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '20px',
  },
  socialRow: {
    display: 'flex',
    gap: '12px',
  },
  socialLinkIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFF',
    transition: 'background 0.2s',
  },
  footerSectionTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#FF9F1C',
    marginBottom: '20px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  footerLinks: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  footerLink: {
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    fontSize: '13px',
    transition: 'color 0.2s',
  },
  footerInfo: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  footerBottom: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
  },
  staffPortalLink: {
    color: 'rgba(255,255,255,0.4)',
    textDecoration: 'none',
  },
};
