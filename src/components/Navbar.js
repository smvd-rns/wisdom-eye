'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, BookOpen, Book, Play, MoreHorizontal, GraduationCap } from 'lucide-react';

export default function Navbar({ onlyBottom = false }) {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navLinks, setNavLinks] = useState([]);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const pathname = usePathname();

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
    const loadNav = async () => {
      try {
        const res = await fetch('/api/site-pages/navigation');
        if (res.ok) {
          const data = await res.json();
          // Filter to only visible links
          const visible = (data.links || []).filter(l => l.is_visible !== false);
          setNavLinks(visible);
        }
      } catch (err) {
        console.error('Failed to load navigation links', err);
      }
    };
    loadNav();
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

  const [tenant, setTenant] = useState({ name: '', slogan: '' });

  const [tenantDetails, setTenantDetails] = useState({ name: '', slogan: '' });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.__TENANT_DATA__) {
      setTenant(window.__TENANT_DATA__);
      setTenantDetails(window.__TENANT_DATA__);
      return;
    }

    const fetchActiveTenantDetails = async () => {
      try {
        const res = await fetch('/api/tenant/metadata');
        if (res.ok) {
          const data = await res.json();
          setTenant(data);
          setTenantDetails(data);
        }
      } catch(e){}
    };
    fetchActiveTenantDetails();
  }, []);

  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.nav-dropdown-trigger')) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const visibleLinks = navLinks.slice(0, 5);
  const dropdownLinks = navLinks.slice(5);

  return (
    <>
      <style>{`
        @media (max-width: 900px) {
          .desktop-links { display: none !important; }
          .mobile-menu-trigger { display: none !important; } /* Hidden because we have bottom nav */
          .mobile-bottom-nav { display: flex !important; }
        }
        .nav-dropdown-trigger {
          position: relative;
          cursor: pointer;
        }
        .nav-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: #111827;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          min-width: 180px;
          padding: 8px 0;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          display: flex;
          flex-direction: column;
          z-index: 1000;
        }
        .dropdown-item {
          color: rgba(255,255,255,0.8);
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 16px;
          transition: all 0.2s;
        }
        .dropdown-item:hover {
          background: rgba(255,159,28,0.15);
          color: #FF9F1C;
        }
        
        /* Floating Bottom Nav Styling */
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 16px;
          left: 16px;
          right: 16px;
          height: 64px;
          background: rgba(26, 27, 75, 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          z-index: 999;
          align-items: center;
          justify-content: space-around;
          padding: 0 8px;
          padding-bottom: env(safe-area-inset-bottom, 0px); /* Space for modern mobile safe areas */
        }
        .mobile-tab-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.6);
          font-size: 10px;
          font-weight: 600;
          text-decoration: none;
          gap: 4px;
          flex: 1;
          height: 100%;
          transition: all 0.2s ease;
        }
        .mobile-tab-item.active {
          color: #FF9F1C;
        }
        .mobile-tab-item:active {
          transform: scale(0.95);
        }

        /* Bottom Sheet for More Options */
        .bottom-sheet-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          display: flex;
          align-items: flex-end;
          animation: fadeInOverlay 0.3s ease;
        }
        .bottom-sheet-container {
          width: 100%;
          background: #1A1B4B;
          border-top-left-radius: 24px;
          border-top-right-radius: 24px;
          padding: 24px 24px 40px; /* Generous bottom spacing for nice look */
          box-shadow: 0 -8px 32px rgba(0,0,0,0.2);
          animation: slideUpSheet 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpSheet {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
      {!onlyBottom && (
        <header style={{
          ...styles.header,
          background: scrolled ? '#1A1B4B' : 'rgba(26, 27, 75, 0.95)',
          boxShadow: scrolled ? '0px 4px 20px rgba(0,0,0,0.15)' : 'none',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={styles.navContainer}>
            <Link href="/" style={styles.logo}>
              <div style={styles.logoTextContainer}>
                <span style={styles.logoText}>{tenantDetails.name}</span>
                <span style={styles.logoSubtext}>{tenantDetails.slogan}</span>
              </div>
            </Link>
            
            <nav className="desktop-links" style={styles.navLinks}>
              {visibleLinks.map((link, idx) => (
                <Link key={idx} href={link.url} style={styles.navLink}>{link.label}</Link>
              ))}

              {dropdownLinks.length > 0 && (
                <div 
                  className="nav-dropdown-trigger" 
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  style={{ ...styles.navLink, display: 'inline-flex', alignItems: 'center', gap: '4px', height: '40px', userSelect: 'none' }}
                >
                  More <span style={{ fontSize: '10px', transform: moreDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                  {moreDropdownOpen && (
                    <div className="nav-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                      {dropdownLinks.map((link, idx) => (
                        <Link 
                          key={idx} 
                          href={link.url} 
                          onClick={() => setMoreDropdownOpen(false)} 
                          className="dropdown-item"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Link 
                    href="/profile" 
                    style={styles.navLink}
                  >
                    Profile
                  </Link>
                  <Link 
                    href={user.role === 'student' ? '/dashboard' : '/lms-admin'} 
                    style={styles.navBtnPrimary}
                  >
                    Dashboard
                  </Link>
                </div>
              ) : (
                <div style={styles.authGroup}>
                  <Link href="/register-org" style={{ ...styles.navLink, color: '#FF9F1C' }}>
                    Register Org
                  </Link>
                  <Link href="/login" style={styles.navLink}>
                    Sign In
                  </Link>
                  <Link href="/signup" style={styles.navBtnSecondary}>
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>


          </div>
        </header>
      )}

      {/* Floating Bottom Navigation for APK/App feel */}
      <div className="mobile-bottom-nav">
        {/* Render first 2 links from dynamic config */}
        {navLinks.slice(0, 2).map((link, idx) => {
          let IconComponent = BookOpen;
          if (link.label.toLowerCase() === 'home') IconComponent = Home;
          else if (link.label.toLowerCase() === 'books') IconComponent = Book;
          else if (link.label.toLowerCase() === 'media') IconComponent = Play;

          return (
            <Link key={idx} href={link.url} className={`mobile-tab-item ${pathname === link.url || (link.url !== '/' && pathname.startsWith(link.url)) ? 'active' : ''}`}>
              <IconComponent size={18} />
              <span>{link.label}</span>
            </Link>
          );
        })}

        <Link 
          href={user ? (user.role === 'student' ? '/dashboard' : '/lms-admin') : '/login'} 
          className={`mobile-tab-item ${pathname.startsWith('/dashboard') || pathname.startsWith('/lms-admin') ? 'active' : ''}`}
          style={{
            position: 'relative',
            top: '-8px',
            background: 'linear-gradient(135deg, #FF9F1C 0%, #F37A1F 100%)',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            color: '#1A1B4B',
            boxShadow: '0 8px 20px rgba(255, 159, 28, 0.4)',
            border: '3px solid #1A1B4B',
            flex: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            transition: 'transform 0.2s',
            zIndex: 1000,
          }}
        >
          <GraduationCap size={20} />
          <span style={{ fontSize: '9px', fontWeight: '800' }}>Study</span>
        </Link>

        {/* Render next 2 links if available, fallback to default or More */}
        {navLinks.slice(2, 4).map((link, idx) => {
          let IconComponent = Book;
          if (link.label.toLowerCase() === 'home') IconComponent = Home;
          else if (link.label.toLowerCase() === 'courses') IconComponent = BookOpen;
          else if (link.label.toLowerCase() === 'media') IconComponent = Play;

          return (
            <Link key={idx} href={link.url} className={`mobile-tab-item ${pathname === link.url || pathname.startsWith(link.url) ? 'active' : ''}`}>
              <IconComponent size={18} />
              <span>{link.label}</span>
            </Link>
          );
        })}

        {/* If fewer than 4 links, render placeholder/empty spacer or More button depending on list size */}
        {(navLinks.length > 4 || navLinks.length <= 2) && (
          <div 
            onClick={() => setMoreSheetOpen(true)} 
            className={`mobile-tab-item ${moreSheetOpen ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            <MoreHorizontal size={18} />
            <span>More</span>
          </div>
        )}
      </div>

      {/* Bottom Sheet Menu Drawer */}
      {moreSheetOpen && (
        <div className="bottom-sheet-overlay" onClick={() => setMoreSheetOpen(false)}>
          <div className="bottom-sheet-container" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#FFF', fontFamily: 'Outfit, sans-serif' }}>Menu</span>
              <button onClick={() => setMoreSheetOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FFF', fontSize: '24px', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Render dynamic links that overflow from the bottom tab bar (index 4+) */}
              {navLinks.slice(4).map((link, idx) => (
                <Link key={idx} href={link.url} onClick={() => setMoreSheetOpen(false)} style={{ fontSize: '15px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', padding: '8px 0' }}>
                  {link.label}
                </Link>
              ))}

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />

              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Link 
                    href="/profile" 
                    onClick={() => setMoreSheetOpen(false)}
                    style={{ fontSize: '15px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', padding: '8px 0' }}
                  >
                    Profile Settings
                  </Link>
                  <Link 
                    href={user.role === 'student' ? '/dashboard' : '/lms-admin'} 
                    onClick={() => setMoreSheetOpen(false)}
                    style={{
                      background: '#FF9F1C',
                      color: '#1A1B4B',
                      padding: '12px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      fontWeight: '700',
                      textDecoration: 'none',
                      fontSize: '15px',
                    }}
                  >
                    Dashboard
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link href="/register-org" onClick={() => setMoreSheetOpen(false)} style={{ fontSize: '15px', fontWeight: '600', color: '#FF9F1C', textDecoration: 'none', padding: '8px 0' }}>
                    Register Org
                  </Link>
                  <Link href="/login" onClick={() => setMoreSheetOpen(false)} style={{ fontSize: '15px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', padding: '8px 0' }}>
                    Sign In
                  </Link>
                  <Link 
                    href="/signup" 
                    onClick={() => setMoreSheetOpen(false)}
                    style={{
                      background: '#FF9F1C',
                      color: '#1A1B4B',
                      padding: '12px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      fontWeight: '700',
                      textDecoration: 'none',
                      fontSize: '15px',
                    }}
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}
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
