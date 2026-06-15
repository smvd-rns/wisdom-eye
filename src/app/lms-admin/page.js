'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Users, CreditCard, TrendingUp, Plus, ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function LmsAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [sRes, eRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/recent-enrollments'),
        ]);
        if (sRes.ok) setStats(await sRes.json());
        if (eRes.ok) {
          const eData = await eRes.json();
          setRecentEnrollments(eData.enrollments || []);
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const statCards = stats ? [
    { label: 'Total Courses', value: stats.courses, icon: <BookOpen size={22} />, color: '#1A1B4B', bg: '#EEF2FF', link: '/lms-admin/courses' },
    { label: 'Total Students', value: stats.students, icon: <Users size={22} />, color: '#0891B2', bg: '#E0F7FA', link: '/lms-admin/users' },
    { label: 'Enrollments', value: stats.enrollments, icon: <TrendingUp size={22} />, color: '#16A34A', bg: '#DCFCE7', link: '/lms-admin/reports' },
    { label: 'Revenue', value: `₹${Number(stats.revenue || 0).toLocaleString('en-IN')}`, icon: <CreditCard size={22} />, color: '#D97706', bg: '#FEF3C7', link: '/lms-admin/payments' },
  ] : [];

  return (
    <div>
      {/* Page header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Admin Dashboard</h1>
          <p style={styles.pageSubtitle}>Welcome back! Here's an overview of your LMS.</p>
        </div>
        <Link href="/lms-admin/courses/new" style={styles.newCourseBtn}>
          <Plus size={16} /> New Course
        </Link>
      </div>

      {/* Stats */}
      {loading ? (
        <div style={styles.statsGrid}>
          {[1,2,3,4].map(i => <div key={i} style={styles.skeletonCard} />)}
        </div>
      ) : (
        <div style={styles.statsGrid}>
          {statCards.map(card => (
            <Link key={card.label} href={card.link} style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: card.bg, color: card.color }}>
                {card.icon}
              </div>
              <div>
                <div style={styles.statValue}>{card.value}</div>
                <div style={styles.statLabel}>{card.label}</div>
              </div>
              <ArrowRight size={16} style={{ marginLeft: 'auto', color: '#D1D5DB' }} />
            </Link>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div style={styles.quickActions}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          {[
            { label: 'Create Course', desc: 'Add new course with modules & lessons', href: '/lms-admin/courses/new', icon: '📚', color: '#1A1B4B' },
            { label: 'Manage Packages', desc: 'Create course bundles and link courses manually', href: '/lms-admin/packages', icon: '📦', color: '#10B981' },
            { label: 'Database Setup', desc: 'Verify connection & copy SQL migration scripts', href: '/lms-admin/database-setup', icon: '🗄️', color: '#EF4444' },
            { label: 'Manage Coupons', desc: 'Create discount or free coupon codes', href: '/lms-admin/coupons', icon: '🏷️', color: '#D97706' },
            { label: 'Grading Queue', desc: 'Review and grade subjective answers', href: '/lms-admin/grading', icon: '✍️', color: '#7C3AED' },
            { label: 'View Reports', desc: 'Student progress and revenue data', href: '/lms-admin/reports', icon: '📊', color: '#0891B2' },
          ].map(action => (
            <Link key={action.label} href={action.href} style={styles.actionCard}>
              <div style={styles.actionEmoji}>{action.icon}</div>
              <div>
                <div style={{ ...styles.actionLabel, color: action.color }}>{action.label}</div>
                <div style={styles.actionDesc}>{action.desc}</div>
              </div>
              <ArrowRight size={16} style={{ marginLeft: 'auto', color: '#D1D5DB', flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Enrollments */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Enrollments</h2>
          <Link href="/lms-admin/reports" style={styles.viewAll}>View all →</Link>
        </div>
        {recentEnrollments.length === 0 ? (
          <div style={styles.emptyRow}>No enrollments yet.</div>
        ) : (
          <div style={styles.table}>
            <div style={styles.tableHead}>
              <span>Student</span><span>Course</span><span>Amount</span><span>Date</span><span>Status</span>
            </div>
            {recentEnrollments.map(e => (
              <div key={e.id} style={styles.tableRow}>
                <span style={styles.studentName}>{e.user_profiles?.name || '—'}</span>
                <span style={styles.courseName}>{e.courses?.title || '—'}</span>
                <span style={styles.amount}>{e.amount_paid === 0 ? 'Free' : `₹${e.amount_paid}`}</span>
                <span style={styles.date}>{new Date(e.enrolled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                <span style={{ ...styles.statusBadge, ...(e.status === 'active' ? styles.statusActive : styles.statusInactive) }}>
                  {e.status === 'active' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                  {e.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' },
  pageTitle: { fontSize: '24px', fontWeight: '800', color: '#111827', fontFamily: 'Outfit, sans-serif' },
  pageSubtitle: { fontSize: '14px', color: '#6B7280', marginTop: '4px' },
  newCourseBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#FF9F1C', color: '#1A1B4B', padding: '10px 20px', borderRadius: '9999px', fontWeight: '700', fontSize: '14px', textDecoration: 'none', fontFamily: 'Outfit, sans-serif' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' },
  statCard: { background: '#fff', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', textDecoration: 'none', transition: 'transform 0.15s' },
  statIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue: { fontSize: '26px', fontWeight: '800', color: '#111827', fontFamily: 'Outfit, sans-serif' },
  statLabel: { fontSize: '12px', color: '#6B7280', fontWeight: '500' },
  skeletonCard: { background: '#E5E7EB', borderRadius: '16px', height: '88px', animation: 'pulse 1.5s infinite' },
  quickActions: { marginBottom: '28px' },
  sectionTitle: { fontSize: '17px', fontWeight: '700', color: '#111827', marginBottom: '14px', fontFamily: 'Outfit, sans-serif' },
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' },
  actionCard: { background: '#fff', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', transition: 'transform 0.15s' },
  actionEmoji: { fontSize: '24px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', borderRadius: '10px', flexShrink: 0 },
  actionLabel: { fontSize: '14px', fontWeight: '700', marginBottom: '3px' },
  actionDesc: { fontSize: '12px', color: '#9CA3AF' },
  section: { background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  viewAll: { fontSize: '13px', color: '#FF9F1C', fontWeight: '600', textDecoration: 'none' },
  emptyRow: { color: '#9CA3AF', fontSize: '14px', textAlign: 'center', padding: '24px 0' },
  table: { display: 'flex', flexDirection: 'column', gap: '0' },
  tableHead: { display: 'grid', gridTemplateColumns: '2fr 3fr 1fr 1fr 1fr', gap: '8px', padding: '8px 12px', background: '#F9FAFB', borderRadius: '8px', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 3fr 1fr 1fr 1fr', gap: '8px', padding: '12px', borderBottom: '1px solid #F3F4F6', alignItems: 'center' },
  studentName: { fontSize: '13px', fontWeight: '600', color: '#111827' },
  courseName: { fontSize: '13px', color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  amount: { fontSize: '13px', fontWeight: '600', color: '#16A34A' },
  date: { fontSize: '12px', color: '#6B7280' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize' },
  statusActive: { background: '#DCFCE7', color: '#16A34A' },
  statusInactive: { background: '#FEF3C7', color: '#D97706' },
};
