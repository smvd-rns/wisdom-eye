'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus, Search, Trash2, Tag, Loader2, Calendar, AlertCircle, CheckCircle, Ticket
} from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch('/api/admin/coupons');
        if (res.ok) {
          const data = await res.json();
          setCoupons(data.coupons || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon code?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCoupons(p => p.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatus = (c) => {
    if (!c.is_active) return { label: 'Inactive', style: styles.statusInactive };
    const now = new Date();
    if (c.valid_until && new Date(c.valid_until) < now) return { label: 'Expired', style: styles.statusInactive };
    if (c.max_uses !== null && c.uses_count >= c.max_uses) return { label: 'Limit Reached', style: styles.statusLimit };
    return { label: 'Active', style: styles.statusActive };
  };

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <Loader2 size={32} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={styles.header} className="coupons-header">
        <div>
          <h1 style={styles.title}>Coupons & Offers</h1>
          <p style={styles.subtitle}>Manage promo codes, direct discounts, and bulk free entry vouchers</p>
        </div>
        <Link href="/lms-admin/coupons/new" style={styles.addBtn}>
          <Plus size={15} /> Create Coupon / Bulk Generate
        </Link>
      </div>

      {/* Search & Stats */}
      <div style={styles.actionsBar}>
        <div style={styles.searchWrap}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search coupon code or description..."
            style={styles.searchInput}
          />
        </div>
        <div style={styles.statCount}>
          {filteredCoupons.length} coupon{filteredCoupons.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Coupons grid */}
      {filteredCoupons.length === 0 ? (
        <div style={styles.emptyState}>
          <Ticket size={48} style={{ color: '#D1D5DB', marginBottom: '16px' }} />
          <h3>No Coupons Found</h3>
          <p>Click "Create Coupon" to add discount campaigns.</p>
        </div>
      ) : (
        <div style={styles.tableCard} className="responsive-table-wrapper">
          <table style={styles.table} className="responsive-table">
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Code / Campaign</th>
                <th style={styles.th}>Discount</th>
                <th style={styles.th}>Scope</th>
                <th style={styles.th}>Usage</th>
                <th style={styles.th}>Validity</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((c) => {
                const status = getStatus(c);
                return (
                  <tr key={c.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.codeWrap}>
                        <span style={styles.codeText}>{c.code}</span>
                      </div>
                      {c.description && <p style={styles.codeDesc}>{c.description}</p>}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.discountText}>
                        {c.type === 'free' ? '100% Free' : c.type === 'percent' ? `${c.discount_value}% Off` : `₹${c.discount_value} Off`}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {c.applies_to === 'all' ? (
                        <span style={styles.allScopeBadge}>All Courses</span>
                      ) : (
                        <div style={styles.specificCoursesList}>
                          <span style={styles.specScopeBadge}>Specific</span>
                          <span style={styles.courseCount}>({c.courses?.length || 0} courses)</span>
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.usageCell}>
                        <span style={styles.usageCount}>{c.uses_count}</span>
                        {c.max_uses !== null && <span style={styles.maxUses}>/ {c.max_uses} max</span>}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.validityCell}>
                        <Calendar size={12} style={{ color: '#9CA3AF' }} />
                        <span>
                          {c.valid_until ? new Date(c.valid_until).toLocaleDateString() : 'Always Valid'}
                        </span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, ...status.style }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        style={styles.deleteBtn}
                      >
                        {deletingId === c.id ? (
                          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        
        @media (max-width: 768px) {
          .coupons-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            margin-bottom: 16px !important;
          }
          .coupons-header a {
            width: 100% !important;
            justify-content: center !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '22px', fontWeight: '800', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif' },
  subtitle: { fontSize: '13px', color: '#6B7280', marginTop: '2px' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '8px', background: '#1A1B4B', color: '#fff', fontSize: '13px', fontWeight: '700', textDecoration: 'none' },
  actionsBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' },
  searchWrap: { position: 'relative', maxWidth: '360px', width: '100%' },
  searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' },
  searchInput: { width: '100%', padding: '9px 12px 9px 36px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' },
  statCount: { fontSize: '13px', color: '#6B7280' },
  emptyState: { textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: '12px', border: '1.5px dashed #D1D5DB' },
  tableCard: { background: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thRow: { background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' },
  th: { padding: '12px 18px', fontSize: '12px', fontWeight: '700', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid #F3F4F6', transition: 'background 0.15s' },
  td: { padding: '14px 18px', fontSize: '13px', color: '#374151', verticalAlign: 'middle' },
  codeWrap: { display: 'inline-flex', background: '#FFE8CC', color: '#FF9F1C', padding: '3px 8px', borderRadius: '5px', fontWeight: '700', fontFamily: 'monospace', letterSpacing: '0.5px' },
  codeDesc: { fontSize: '11px', color: '#6B7280', marginTop: '4px' },
  discountText: { fontWeight: '700', color: '#1A1B4B' },
  allScopeBadge: { fontSize: '11px', fontWeight: '700', color: '#4F46E5', background: '#EEF2FF', padding: '2px 8px', borderRadius: '9999px' },
  specScopeBadge: { fontSize: '11px', fontWeight: '700', color: '#6B7280', background: '#F3F4F6', padding: '2px 8px', borderRadius: '9999px' },
  specificCoursesList: { display: 'flex', alignItems: 'center', gap: '4px' },
  courseCount: { fontSize: '11px', color: '#9CA3AF' },
  usageCell: { display: 'flex', alignItems: 'baseline', gap: '3px' },
  usageCount: { fontWeight: '700', color: '#111827' },
  maxUses: { fontSize: '11px', color: '#9CA3AF' },
  validityCell: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#4B5563' },
  statusBadge: { fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '9999px', display: 'inline-block' },
  statusActive: { background: '#D1FAE5', color: '#065F46' },
  statusInactive: { background: '#F3F4F6', color: '#6B7280' },
  statusLimit: { background: '#FEF3C7', color: '#92400E' },
  deleteBtn: { border: 'none', background: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '6px', borderRadius: '5px', transition: 'background 0.2s, color 0.2s', ':hover': { background: '#FEE2E2', color: '#EF4444' } },
};
