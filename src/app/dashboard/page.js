'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Play, Award, Clock, ChevronRight, LogOut, User, BarChart2, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Get current user
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) { router.push('/login'); return; }
        const meData = await meRes.json();
        setUser(meData.user);

        // Get enrollments + progress
        const enrRes = await fetch('/api/student/enrollments');
        if (enrRes.ok) {
          const enrData = await enrRes.json();
          setEnrollments(enrData.enrollments || []);
        }
      } catch (e) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#FF9F1C' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const completedCourses = enrollments.filter(e => e.course_progress?.percent_complete === 100).length;
  const inProgress = enrollments.filter(e => (e.course_progress?.percent_complete || 0) < 100).length;

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <Link href="/" style={styles.sidebarLogo}>
          <div style={styles.logoIcon}><BookOpen size={18} color="#FF9F1C" /></div>
          <span style={styles.logoText}>Wisdom Eye</span>
        </Link>

        <nav style={styles.nav}>
          <a href="/dashboard" style={{ ...styles.navItem, ...styles.navItemActive }}>
            <BarChart2 size={18} /> My Courses
          </a>
          <a href="/certificates" style={styles.navItem}>
            <Award size={18} /> Certificates
          </a>
          <a href="/profile" style={styles.navItem}>
            <User size={18} /> Profile
          </a>
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userChip}>
            <div style={styles.userAvatar}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={styles.userName}>{user?.name}</div>
              <div style={styles.userRole}>Student</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.greeting}>
              👋 Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p style={styles.subGreeting}>Continue your learning journey</p>
          </div>
          <Link href="/courses" style={styles.browseCta}>
            Browse Courses <ChevronRight size={16} />
          </Link>
        </div>

        {/* Stats Row */}
        <div style={styles.statsRow}>
          {[
            { label: 'Enrolled', value: enrollments.length, icon: <BookOpen size={20} />, color: '#1A1B4B' },
            { label: 'In Progress', value: inProgress, icon: <Play size={20} />, color: '#FF9F1C' },
            { label: 'Completed', value: completedCourses, icon: <Award size={20} />, color: '#22C55E' },
          ].map((stat) => (
            <div key={stat.label} style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: stat.color + '18', color: stat.color }}>
                {stat.icon}
              </div>
              <div>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Course List */}
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>My Courses</h2>
        </div>

        {enrollments.length === 0 ? (
          <div style={styles.emptyState}>
            <BookOpen size={48} style={{ color: '#D1D5DB', marginBottom: '16px' }} />
            <h3 style={styles.emptyTitle}>No courses yet</h3>
            <p style={styles.emptyText}>Explore our courses and start learning today.</p>
            <Link href="/courses" style={styles.emptyBtn}>Browse Courses</Link>
          </div>
        ) : (
          <div style={styles.courseGrid}>
            {enrollments.map((enr) => {
              const pct = enr.course_progress?.percent_complete || 0;
              const lastLesson = enr.course_progress?.last_lesson_id;
              return (
                <div key={enr.id} style={styles.courseCard}>
                  <div style={styles.courseThumbnail}>
                    {enr.courses?.thumbnail_url ? (
                      <img src={enr.courses.thumbnail_url} alt={enr.courses.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={styles.courseThumbnailPlaceholder}>
                        <BookOpen size={32} color="#6B7280" />
                      </div>
                    )}
                    {pct === 100 && (
                      <div style={styles.completedBadge}>✓ Completed</div>
                    )}
                  </div>
                  <div style={styles.courseCardBody}>
                    <div style={styles.courseCategory}>{enr.courses?.category || 'Course'}</div>
                    <h3 style={styles.courseTitle}>{enr.courses?.title}</h3>

                    {/* Progress bar */}
                    <div style={styles.progressSection}>
                      <div style={styles.progressHeader}>
                        <span style={styles.progressLabel}>Progress</span>
                        <span style={styles.progressPct}>{Math.round(pct)}%</span>
                      </div>
                      <div style={styles.progressBar}>
                        <div style={{ ...styles.progressFill, width: `${pct}%` }} />
                      </div>
                    </div>

                    <Link
                      href={`/courses/${enr.courses?.slug}/learn${lastLesson ? `/${lastLesson}` : ''}`}
                      style={styles.continueBtn}
                    >
                      {pct === 0 ? 'Start Course' : pct === 100 ? 'Review Course' : 'Continue Learning'}
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          .lms-sidebar { display: none !important; }
          .lms-main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  loadingPage: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#F8F9FA',
  },
  page: {
    display: 'flex', minHeight: '100vh', background: '#F0F2F5',
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
  userName: { fontSize: '13px', fontWeight: '600', color: '#fff' },
  userRole: { fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.6)', padding: '9px 14px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '13px', width: '100%', fontFamily: 'inherit',
  },
  main: {
    flex: 1, marginLeft: '260px', padding: '32px',
    minHeight: '100vh', animation: 'fadeIn 0.3s ease',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '28px', flexWrap: 'wrap', gap: '12px',
  },
  greeting: { fontSize: '26px', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif', marginBottom: '4px' },
  subGreeting: { fontSize: '14px', color: '#6B7280' },
  browseCta: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: '#FF9F1C', color: '#1A1B4B', padding: '10px 20px',
    borderRadius: '9999px', fontWeight: '700', fontSize: '14px', textDecoration: 'none',
    fontFamily: 'Outfit, sans-serif',
  },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' },
  statCard: {
    background: '#fff', borderRadius: '16px', padding: '20px 24px',
    display: 'flex', alignItems: 'center', gap: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  },
  statIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue: { fontSize: '28px', fontWeight: '800', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif' },
  statLabel: { fontSize: '13px', color: '#6B7280', fontWeight: '500' },
  sectionHeader: { marginBottom: '20px' },
  sectionTitle: { fontSize: '20px', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif' },
  emptyState: {
    background: '#fff', borderRadius: '20px', padding: '60px 40px',
    textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  },
  emptyTitle: { fontSize: '20px', color: '#1A1B4B', marginBottom: '8px' },
  emptyText: { fontSize: '14px', color: '#6B7280', marginBottom: '24px' },
  emptyBtn: {
    display: 'inline-block', background: '#1A1B4B', color: '#fff',
    padding: '12px 28px', borderRadius: '9999px', fontWeight: '700',
    textDecoration: 'none', fontFamily: 'Outfit, sans-serif',
  },
  courseGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  courseCard: {
    background: '#fff', borderRadius: '16px', overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'transform 0.2s, box-shadow 0.2s',
  },
  courseThumbnail: { height: '160px', background: '#F0F2F5', position: 'relative', overflow: 'hidden' },
  courseThumbnailPlaceholder: {
    width: '100%', height: '100%', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  completedBadge: {
    position: 'absolute', top: '10px', right: '10px',
    background: '#22C55E', color: '#fff', fontSize: '11px',
    fontWeight: '700', padding: '4px 10px', borderRadius: '9999px',
  },
  courseCardBody: { padding: '20px' },
  courseCategory: { fontSize: '11px', fontWeight: '700', color: '#FF9F1C', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' },
  courseTitle: { fontSize: '16px', fontWeight: '700', color: '#1A1B4B', marginBottom: '16px', lineHeight: 1.4 },
  progressSection: { marginBottom: '16px' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' },
  progressLabel: { fontSize: '12px', color: '#6B7280' },
  progressPct: { fontSize: '12px', fontWeight: '700', color: '#1A1B4B' },
  progressBar: { height: '6px', background: '#F0F2F5', borderRadius: '9999px', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #FF9F1C, #E07A5F)', borderRadius: '9999px', transition: 'width 0.5s ease' },
  continueBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    background: '#1A1B4B', color: '#fff', padding: '10px 20px',
    borderRadius: '9999px', fontWeight: '700', fontSize: '13px',
    textDecoration: 'none', fontFamily: 'Outfit, sans-serif',
  },
};
