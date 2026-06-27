'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Award, BookOpen, Clock, Loader2, ArrowLeft, ExternalLink, User, BarChart2, LogOut } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function CertificatesPage() {
  const router = useRouter();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [tenantName, setTenantName] = useState('Wisdom Eye');

  useEffect(() => {
    // Read from sessionStorage cache first
    try {
      const cachedCerts = sessionStorage.getItem('certificates_list');
      const cachedUser = sessionStorage.getItem('dashboard_user');
      const cachedTenant = sessionStorage.getItem('dashboard_tenant_name');
      
      if (cachedCerts) setCerts(JSON.parse(cachedCerts));
      if (cachedUser) setUser(JSON.parse(cachedUser));
      if (cachedTenant) {
        setTenantName(cachedTenant);
      } else if (typeof window !== 'undefined' && window.__TENANT_DATA__) {
        setTenantName(window.__TENANT_DATA__.name || 'Wisdom Eye');
      }
      
      if (cachedCerts && cachedUser) {
        setLoading(false);
      }
    } catch (e) {}

    const init = async () => {
      try {
        // Get current user
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);
        sessionStorage.setItem('dashboard_user', JSON.stringify(meData.user));

        // Get tenant details
        const tenantRes = await fetch('/api/tenant/metadata');
        if (tenantRes.ok) {
          const tenantData = await tenantRes.json();
          const tName = tenantData.name || '';
          setTenantName(tName);
          sessionStorage.setItem('dashboard_tenant_name', tName);
        }

        // Get certificates
        const res = await fetch('/api/student/enrollments');
        if (res.ok) {
          const data = await res.json();
          const completedCerts = data.enrollments
            ?.filter(e => e.course_progress?.percent_complete >= 100 && e.courses?.has_certificate !== false)
            .map(e => ({
              id: e.courses.id,
              title: e.courses.title,
              slug: e.courses.slug,
              completedAt: e.course_progress.completed_at
            })) || [];
          setCerts(completedCerts);
          sessionStorage.setItem('certificates_list', JSON.stringify(completedCerts));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('dashboard_user');
      sessionStorage.removeItem('dashboard_enrollments');
      sessionStorage.removeItem('dashboard_recommended');
      sessionStorage.removeItem('dashboard_tenant_name');
      sessionStorage.removeItem('certificates_list');
      sessionStorage.removeItem('auth_me');
    } catch (e) {}
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F6F9' }}>
      <Loader2 size={36} style={{ color: '#FF9F1C', animation: 'spin 1.2s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={styles.page}>
      <Navbar onlyBottom={true} />
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <Link href="/" style={styles.sidebarLogo}>
          <div style={styles.logoIcon}><BookOpen size={18} color="var(--secondary)" /></div>
          <span style={styles.logoText}>{tenantName}</span>
        </Link>

        <nav style={styles.nav}>
          <Link href="/dashboard" style={styles.navItem}>
            <BarChart2 size={18} /> My Courses
          </Link>
          <Link href="/certificates" style={{ ...styles.navItem, ...styles.navItemActive }}>
            <Award size={18} /> Certificates
          </Link>
          <Link href="/profile" style={styles.navItem}>
            <User size={18} /> Profile
          </Link>
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userChip}>
            <div style={styles.userAvatar}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={styles.userName}>{user?.name}</div>
              <div style={styles.userRole}>{user?.role || 'Student'}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.container}>
          {/* Back link */}
          <Link href="/dashboard" style={styles.back}>
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
    
          <h1 style={styles.title}>🏆 Your Certificates</h1>
          <p style={styles.subtitle}>Download credentials for courses you have successfully finished.</p>
    
          {certs.length === 0 ? (
            <div style={styles.emptyState}>
              <Award size={48} style={{ color: '#D1D5DB', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1A1B4B' }}>No Certificates Available</h3>
              <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '6px' }}>
                Complete 100% of any certificate-granting course to claim your reward.
              </p>
            </div>
          ) : (
            <div style={styles.grid}>
              {certs.map(c => (
                <div key={c.id} style={styles.card}>
                  <div style={styles.iconWrap}>
                    <Award size={28} color="#FF9F1C" />
                  </div>
                  <div style={styles.body}>
                    <div>
                      <h3 style={styles.cardTitle}>{c.title}</h3>
                      <p style={styles.cardDate}>Completed: {new Date(c.completedAt).toLocaleDateString()}</p>
                    </div>
                    <div style={styles.actions}>
                      <Link href={`/certificates/${c.id}`} target="_blank" style={styles.downloadBtn}>
                        View Certificate <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          aside { display: none !important; }
          main { margin-left: 0 !important; padding: 24px 24px 100px !important; }
        }
        @media (max-width: 600px) {
          main { padding: 16px 16px 100px !important; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex', minHeight: '100vh', background: '#F4F6F9',
  },
  sidebar: {
    width: '260px', flexShrink: 0, background: '#1A1B4B',
    display: 'flex', flexDirection: 'column',
    padding: '0', position: 'fixed', top: 0, left: 0,
    height: '100vh', zIndex: 50, overflowY: 'auto',
  },
  sidebarLogo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '24px 20px', textDecoration: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  logoIcon: {
    width: '34px', height: '34px', borderRadius: '8px',
    background: 'rgba(255,159,28,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontFamily: 'Outfit, sans-serif', fontSize: '17px', fontWeight: '800', color: '#fff' },
  nav: { padding: '20px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '11px 16px', borderRadius: '10px', color: 'rgba(255,255,255,0.6)',
    fontSize: '14px', fontWeight: '500', textDecoration: 'none',
    transition: 'background 0.2s, color 0.2s',
  },
  navItemActive: { background: 'rgba(255,255,255,0.1)', color: '#fff' },
  sidebarFooter: {
    padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  userChip: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  userAvatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: '#FF9F1C', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '15px', fontWeight: '700', color: '#1A1B4B',
    flexShrink: 0,
  },
  userName: { fontSize: '13px', fontWeight: '600', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' },
  userRole: { fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.6)', padding: '9px 14px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '13px', width: '100%', fontFamily: 'inherit',
  },
  main: {
    flex: 1, marginLeft: '260px', padding: '40px',
    minHeight: '100vh',
  },
  container: { maxWidth: '1000px', margin: '0 auto' },
  back: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '13px', textDecoration: 'none', marginBottom: '20px' },
  title: { fontSize: '28px', fontWeight: '850', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif' },
  subtitle: { fontSize: '14px', color: '#6B7280', marginTop: '4px', marginBottom: '32px' },
  emptyState: { textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: '24px', border: '1.5px dashed #D1D5DB', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' },
  grid: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { display: 'flex', gap: '20px', background: '#fff', padding: '20px', borderRadius: '20px', boxShadow: '0 2px 12px rgba(26,27,75,0.03)', alignItems: 'center', border: '1px solid rgba(26,27,75,0.04)' },
  iconWrap: { width: '48px', height: '48px', borderRadius: '12px', background: '#FFF9DB', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: '#1A1B4B' },
  cardDate: { fontSize: '12px', color: '#9CA3AF', marginTop: '2px' },
  actions: {},
  downloadBtn: { display: 'inline-flex', alignItems: 'center', background: '#FF9F1C', color: '#1A1B4B', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }
};
