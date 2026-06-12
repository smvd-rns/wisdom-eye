'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard, Search, DollarSign, Loader2, ArrowUpRight, TrendingUp, Tag
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalSales: 0, totalDiscount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch('/api/admin/payments');
        if (res.ok) {
          const data = await res.json();
          setPayments(data.payments || []);
          setStats(data.stats || { totalRevenue: 0, totalSales: 0, totalDiscount: 0 });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(p =>
    p.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.student?.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.courses?.title?.toLowerCase().includes(search.toLowerCase()) ||
    (p.coupon_code && p.coupon_code.toLowerCase().includes(search.toLowerCase())) ||
    (p.razorpay_payment_id && p.razorpay_payment_id.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <Loader2 size={32} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Payments & Sales Ledger</h1>
          <p style={styles.subtitle}>Track course enrollments, coupon codes applied, and revenue transactions</p>
        </div>
      </div>

      {/* Stats row */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLeft}>
            <DollarSign size={20} color="#FF9F1C" />
            <div>
              <div style={styles.statLabel}>Total Income</div>
              <div style={styles.statVal}>₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
            </div>
          </div>
          <div style={styles.trendUp}><TrendingUp size={14} /> Live</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLeft}>
            <CreditCard size={20} color="#3B82F6" />
            <div>
              <div style={styles.statLabel}>Total Sales</div>
              <div style={styles.statVal}>{stats.totalSales} enrollments</div>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLeft}>
            <Tag size={20} color="#10B981" />
            <div>
              <div style={styles.statLabel}>Total Discount Given</div>
              <div style={styles.statVal}>₹{stats.totalDiscount.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={styles.actionBar}>
        <div style={styles.searchWrap}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search student, course, coupon, or payment ID..."
            style={styles.searchInput}
          />
        </div>
        <div style={styles.countText}>{filteredPayments.length} transactions logged</div>
      </div>

      {/* Ledger Table */}
      {filteredPayments.length === 0 ? (
        <div style={styles.emptyState}>
          <CreditCard size={48} style={{ color: '#D1D5DB', marginBottom: '16px' }} />
          <h3>No Transactions Logged</h3>
          <p>Orders will show here once students begin checkouts.</p>
        </div>
      ) : (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Student</th>
                <th style={styles.th}>Course Title</th>
                <th style={styles.th}>Final Amount</th>
                <th style={styles.th}>Breakdown</th>
                <th style={styles.th}>Promo Code</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.studentName}>{p.student?.name}</div>
                    <div style={styles.studentEmail}>{p.student?.email}</div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.courseTitle}>{p.courses?.title}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.amountText}>
                      {p.final_amount === 0 ? 'Free' : `₹${Number(p.final_amount).toLocaleString('en-IN')}`}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.breakdownRow}>
                      <span>Original: ₹{Number(p.original_amount).toLocaleString('en-IN')}</span>
                      {p.discount_amount > 0 && <span style={{ color: '#16A34A' }}>Discount: -₹{Number(p.discount_amount).toLocaleString('en-IN')}</span>}
                    </div>
                  </td>
                  <td style={styles.td}>
                    {p.coupon_code ? (
                      <span style={styles.couponBadge}>{p.coupon_code}</span>
                    ) : (
                      <span style={{ color: '#9CA3AF' }}>—</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.dateText}>{new Date(p.created_at).toLocaleDateString()}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      background: p.status === 'success' ? '#D1FAE5' : p.status === 'pending' ? '#FEF3C7' : '#FEE2E2',
                      color: p.status === 'success' ? '#065F46' : p.status === 'pending' ? '#92400E' : '#991B1B'
                    }}>
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  header: { marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: '800', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif' },
  subtitle: { fontSize: '13px', color: '#6B7280', marginTop: '2px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '24px' },
  statCard: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' },
  statLeft: { display: 'flex', gap: '12px', alignItems: 'center' },
  statLabel: { fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' },
  statVal: { fontSize: '18px', fontWeight: '800', color: '#1A1B4B', marginTop: '4px', fontFamily: 'Outfit, sans-serif' },
  trendUp: { display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: '9999px', fontWeight: '700' },
  actionBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' },
  searchWrap: { position: 'relative', maxWidth: '360px', width: '100%' },
  searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' },
  searchInput: { width: '100%', padding: '9px 12px 9px 36px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' },
  countText: { fontSize: '13px', color: '#6B7280' },
  emptyState: { textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: '12px', border: '1.5px dashed #D1D5DB' },
  tableCard: { background: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thRow: { background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' },
  th: { padding: '12px 18px', fontSize: '12px', fontWeight: '700', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid #F3F4F6' },
  td: { padding: '14px 18px', fontSize: '13px', color: '#374151', verticalAlign: 'middle' },
  studentName: { fontWeight: '700', color: '#111827' },
  studentEmail: { fontSize: '11px', color: '#6B7280', marginTop: '2px' },
  courseTitle: { fontWeight: '600', color: '#1A1B4B' },
  amountText: { fontWeight: '800', color: '#111827' },
  breakdownRow: { display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px', color: '#6B7280' },
  couponBadge: { fontSize: '11px', fontWeight: '700', background: '#FFF9DB', color: '#B57A00', padding: '2px 8px', borderRadius: '5px', border: '1px solid #FFE3A8', fontFamily: 'monospace' },
  dateText: { color: '#4B5563' },
  statusBadge: { fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '9999px', display: 'inline-block' },
};
