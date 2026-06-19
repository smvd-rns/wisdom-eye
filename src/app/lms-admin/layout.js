'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, BookOpen, Users, Tag, CreditCard,
  BarChart2, LogOut, ChevronRight, Menu, X, BookMarked,
  GraduationCap, ClipboardCheck, Settings, Loader2, Home, Globe, Layers, Database, ShieldCheck
} from 'lucide-react';

const NAV = [
  { href: '/lms-admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/lms-admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/lms-admin/packages', label: 'Packages', icon: Layers },
  { href: '/lms-admin/users', label: 'Users', icon: Users },
  { href: '/lms-admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/lms-admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/lms-admin/reports', label: 'Reports', icon: BarChart2 },
  { href: '/lms-admin/grading', label: 'Grading Queue', icon: ClipboardCheck },
];

export default function LmsAdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ courses: 0, students: 0, revenue: 0, enrollments: 0 });
  const [tenantName, setTenantName] = useState(() => {
    if (typeof window !== 'undefined' && window.__TENANT_DATA__) {
      return window.__TENANT_DATA__.name || 'Wisdom Eye';
    }
    return 'Wisdom Eye';
  });

  const [navItems, setNavItems] = useState(NAV);

  useEffect(() => {
    const init = async () => {
      // Fetch tenant details
      const tenantRes = await fetch('/api/tenant/metadata');
      if (tenantRes.ok) {
        const tenantData = await tenantRes.json();
        setTenantName(tenantData.name || '');
      }

      const res = await fetch('/api/auth/me');
      if (!res.ok) { router.push('/login'); return; }
      const data = await res.json();
      const role = data.user?.role;
      const staffRoles = ['superadmin', 'admin', 'course_builder', 'evaluator'];
      if (!staffRoles.includes(role)) { router.push('/dashboard'); return; }
      setUser(data.user);

      if (role === 'superadmin') {
        setNavItems([
          ...NAV,
          { href: '/lms-admin/superadmin', label: 'Superadmin Panel', icon: ShieldCheck }
        ]);
      } else {
        setNavItems(NAV);
      }

      // Fetch stats
      const sRes = await fetch('/api/admin/stats');
      if (sRes.ok) {
        const sData = await sRes.json();
        setStats(sData);
      }
    };
    init();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const isActive = (item) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  // Page builder & site-builder subpath get their own full-screen layout (no sidebar/topbar)
  const isFullScreenBuilder = pathname.includes('/page-builder') || 
    (pathname.startsWith('/lms-admin/site-builder/') && pathname !== '/lms-admin/site-builder');

  if (isFullScreenBuilder) {
    return (
      <>
        {user ? children : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '12px', background: '#F0F2F5' }}>
            <Loader2 size={36} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: '#6B7280', fontSize: '14px', fontWeight: '500' }}>Verifying admin access...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </>
    );
  }

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, transform: sidebarOpen ? 'translateX(0)' : undefined }}>
        <div style={styles.sidebarTop}>
          <Link href="/" style={styles.logo}>
            <div style={styles.logoIcon}><GraduationCap size={20} color="#FF9F1C" /></div>
            <div>
              <div style={styles.logoName}>{tenantName}</div>
              <div style={styles.logoSub}>Admin Panel</div>
            </div>
          </Link>
        </div>

        <nav style={styles.nav}>
          <p style={styles.navSection}>MAIN</p>
          {navItems.map(item => {
            const active = isActive(item);
            return (
              <Link key={item.href} href={item.href}
                style={{ ...styles.navItem, ...(active ? styles.navActive : {}) }}
                onClick={() => setSidebarOpen(false)}>
                <item.icon size={17} />
                <span>{item.label}</span>
                {active && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
              </Link>
            );
          })}

          <p style={{ ...styles.navSection, marginTop: '20px' }}>WEBSITE</p>
          <Link href="/lms-admin/site-builder"
            style={{ ...styles.navItem, ...(pathname.startsWith('/lms-admin/site-builder') ? styles.navActive : {}) }}
            onClick={() => setSidebarOpen(false)}>
            <Globe size={17} /> <span>Site Builder</span>
            {pathname.startsWith('/lms-admin/site-builder') && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
          </Link>
          <Link href="/lms-admin/home-editor"
            style={{ ...styles.navItem, ...(pathname.startsWith('/lms-admin/home-editor') ? styles.navActive : {}) }}
            onClick={() => setSidebarOpen(false)}>
            <Home size={17} /> <span>Home Editor</span>
            {pathname.startsWith('/lms-admin/home-editor') && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
          </Link>
          <Link href="/" style={styles.navItem} target="_blank">
            <BookMarked size={17} /> <span>View Site</span>
          </Link>
        </nav>

        <div style={styles.sidebarFooter}>
          {user && (
            <div style={styles.userBox}>
              <div style={styles.avatar}>{user.name?.[0]?.toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.userName}>{user.name}</div>
                <div style={styles.userRole}>{user.role}</div>
              </div>
              <button onClick={handleLogout} style={styles.logoutBtn} title="Sign out">
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div style={styles.main}>
        {/* Top bar */}
        <header style={styles.topbar}>
          <button onClick={() => setSidebarOpen(p => !p)} style={styles.menuBtn}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={styles.breadcrumb}>
            {pathname.split('/').filter(Boolean).map((seg, i, arr) => (
              <span key={i} style={styles.breadSeg}>
                {i > 0 && <span style={{ color: '#D1D5DB', margin: '0 6px' }}>/</span>}
                <span style={i === arr.length - 1 ? styles.breadActive : styles.breadInactive}>
                  {seg.replace(/-/g, ' ')}
                </span>
              </span>
            ))}
          </div>
          <div style={styles.topbarRight}>
            <Link href="/courses" target="_blank" style={styles.viewSiteBtn}>
              View Site ↗
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main style={styles.content}>
          {user ? children : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', flexDirection: 'column', gap: '12px' }}>
              <Loader2 size={36} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
              <span style={{ color: '#6B7280', fontSize: '14px', fontWeight: '500' }}>Verifying admin access...</span>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .lms-sidebar { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: '#F0F2F5' },
  sidebar: {
    width: '256px', flexShrink: 0, background: '#111827',
    display: 'flex', flexDirection: 'column',
    position: 'fixed', top: 0, left: 0, height: '100vh',
    zIndex: 60, overflowY: 'auto', transition: 'transform 0.3s ease',
  },
  sidebarTop: { padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  logo: { display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' },
  logoIcon: { width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,159,28,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoName: { fontFamily: 'Outfit, sans-serif', fontWeight: '800', fontSize: '16px', color: '#fff' },
  logoSub: { fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
  nav: { flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '2px' },
  navSection: { fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', padding: '4px 10px', marginBottom: '4px' },
  navItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: 'rgba(255,255,255,0.55)', fontSize: '13.5px', fontWeight: '500', textDecoration: 'none', transition: 'background 0.15s, color 0.15s', cursor: 'pointer' },
  navActive: { background: 'rgba(255,159,28,0.12)', color: '#FF9F1C' },
  sidebarFooter: { padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' },
  userBox: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '34px', height: '34px', borderRadius: '50%', background: '#FF9F1C', color: '#1A1B4B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', flexShrink: 0 },
  userName: { fontSize: '13px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole: { fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' },
  logoutBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px', flexShrink: 0 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 59 },
  main: { flex: 1, marginLeft: '256px', display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0, overflow: 'hidden' },
  topbar: { height: '60px', background: '#fff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  menuBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#374151', display: 'none', padding: '4px' },
  breadcrumb: { flex: 1, display: 'flex', alignItems: 'center' },
  breadSeg: { display: 'flex', alignItems: 'center' },
  breadActive: { fontSize: '13px', fontWeight: '600', color: '#1A1B4B', textTransform: 'capitalize' },
  breadInactive: { fontSize: '13px', color: '#9CA3AF', textTransform: 'capitalize' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  viewSiteBtn: { fontSize: '12px', color: '#6B7280', textDecoration: 'none', padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: '6px' },
  content: { flex: 1, padding: '28px' },
};
