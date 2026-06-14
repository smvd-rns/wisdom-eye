'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error('Navbar user fetch failed:', err);
      }
    };
    checkUser();
  }, []);

  return (
    <>
      <header style={{
        ...styles.header,
        background: scrolled ? '#1A1B4B' : 'rgba(26, 27, 75, 0.95)',
        boxShadow: scrolled ? '0px 4px 20px rgba(0,0,0,0.15)' : 'none',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={styles.navContainer}>
          <Link href="/" style={styles.logo}>
            <div style={styles.logoTextContainer}>
              <span style={styles.logoText}>Radheshyam Das</span>
              <span style={styles.logoSubtext}>IIT Bombay Topper • Author • Monk</span>
            </div>
          </Link>
          
          <nav style={styles.navLinks}>
            <Link href="/" style={styles.navLink}>Home</Link>
            <Link href="/courses" style={styles.navLink}>Courses</Link>
            <Link href="/books" style={styles.navLink}>Books</Link>
            <Link href="/media" style={styles.navLink}>Media</Link>
            <Link href="/daily-reading" style={styles.navLink}>Daily Reading</Link>
            <Link href="/about" style={styles.navLink}>About</Link>
            
            {user ? (
              <Link 
                href={user.role === 'student' ? '/dashboard' : '/lms-admin'} 
                style={styles.navBtnPrimary}
              >
                Dashboard
              </Link>
            ) : (
              <div style={styles.authGroup}>
                <Link href="/login" style={styles.navLink}>
                  Sign In
                </Link>
                <Link href="/signup" style={styles.navBtnSecondary}>
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          <button onClick={() => setMobileMenuOpen(true)} style={styles.menuBtn}>
            <Menu size={24} color="#FFF" />
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div style={styles.mobileNavOverlay} onClick={() => setMobileMenuOpen(false)}>
          <div style={styles.mobileNavContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.mobileNavHeader}>
              <span style={styles.mobileNavTitle}>Navigation</span>
              <button onClick={() => setMobileMenuOpen(false)} style={styles.closeBtn}>
                <X size={24} color="#1A1B4B" />
              </button>
            </div>
            <div style={styles.mobileNavBody}>
              <Link href="/" onClick={() => setMobileMenuOpen(false)} style={styles.mobileNavLink}>Home</Link>
              <Link href="/courses" onClick={() => setMobileMenuOpen(false)} style={styles.mobileNavLink}>Courses</Link>
              <Link href="/books" onClick={() => setMobileMenuOpen(false)} style={styles.mobileNavLink}>Books</Link>
              <Link href="/media" onClick={() => setMobileMenuOpen(false)} style={styles.mobileNavLink}>Media</Link>
              <Link href="/daily-reading" onClick={() => setMobileMenuOpen(false)} style={styles.mobileNavLink}>Daily Reading</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} style={styles.mobileNavLink}>About</Link>
              
              <div style={styles.mobileAuthBlock}>
                {user ? (
                  <Link 
                    href={user.role === 'student' ? '/dashboard' : '/lms-admin'} 
                    style={styles.mobileBtnPrimary}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/login" style={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                    <Link href="/signup" style={styles.mobileBtnPrimary} onClick={() => setMobileMenuOpen(false)}>Sign Up Free</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: '12px 24px',
    transition: 'all 0.3s ease',
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    background: '#FF9F1C',
    color: '#1A1B4B',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  logoTextContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  logoText: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '18px',
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: '1.1',
  },
  logoSubtext: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.7)',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  navLink: {
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    color: '#FFFFFF',
    transition: 'color 0.2s',
  },
  authGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },
  navBtnPrimary: {
    background: '#FF9F1C',
    color: '#1A1B4B',
    textDecoration: 'none',
    padding: '8px 20px',
    borderRadius: '9999px',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: 'Outfit, sans-serif',
  },
  navBtnSecondary: {
    background: 'transparent',
    color: '#FFFFFF',
    border: '1.5px solid #FF9F1C',
    textDecoration: 'none',
    padding: '8px 20px',
    borderRadius: '9999px',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: 'Outfit, sans-serif',
  },
  menuBtn: {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  mobileNavOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.5)',
    zIndex: 200,
  },
  mobileNavContainer: {
    width: '300px',
    height: '100%',
    background: '#FFF',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
  },
  mobileNavHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: '12px',
  },
  mobileNavTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#1A1B4B',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  mobileNavBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  mobileNavLink: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#4B5563',
    textDecoration: 'none',
  },
  mobileAuthBlock: {
    marginTop: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  mobileBtnPrimary: {
    background: '#1A1B4B',
    color: '#FFFFFF',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: '700',
    textDecoration: 'none',
  },
};
