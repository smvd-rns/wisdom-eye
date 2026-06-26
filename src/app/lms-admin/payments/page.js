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

  const [editingPayment, setEditingPayment] = useState(null);
  const [shippingStatus, setShippingStatus] = useState('pending_shipment');
  const [trackingId, setTrackingId] = useState('');
  const [updating, setUpdating] = useState(false);

  const openEditShipping = (p) => {
    setEditingPayment(p);
    setShippingStatus(p.shipping_status || 'pending_shipment');
    setTrackingId(p.tracking_id || '');
  };

  const handleUpdateShipping = async () => {
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/payments/tracking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: editingPayment.id,
          shipping_status: shippingStatus,
          tracking_id: trackingId
        })
      });
      if (res.ok) {
        setPayments(prev => prev.map(p => {
          if (p.id === editingPayment.id) {
            return {
              ...p,
              shipping_status: shippingStatus,
              tracking_id: trackingId
            };
          }
          return p;
        }));
        setEditingPayment(null);
      } else {
        alert('Failed to update tracking details');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating tracking details');
    } finally {
      setUpdating(false);
    }
  };

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
                <th style={styles.th}>Delivery / Shipping</th>
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
                    {p.delivery_type === 'pickup' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: '700', color: '#1A1B4B', fontSize: '11px' }}>🏢 Self Pick Up</span>
                        <span style={{ fontSize: '10px', color: '#6B7280' }}>Name: {p.shipping_name || p.student?.name}</span>
                        <span style={{ fontSize: '10px', color: '#6B7280' }}>Phone: {p.shipping_phone}</span>
                      </div>
                    )}
                    {p.delivery_type === 'delivery' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontWeight: '700', color: '#B57A00', fontSize: '11px' }}>🚚 Home Delivery</span>
                        <span style={{ fontSize: '10px', color: '#4B5563', lineHeight: '1.4' }}>
                          {p.shipping_address}, {p.shipping_city}, {p.shipping_state} - {p.shipping_pincode}
                        </span>
                        <span style={{ fontSize: '10px', color: '#6B7280' }}>Name: {p.shipping_name} | Phone: {p.shipping_phone}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <span style={{
                            fontSize: '9px',
                            fontWeight: '800',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: p.shipping_status === 'shipped' ? '#D1FAE5' : '#FEF3C7',
                            color: p.shipping_status === 'shipped' ? '#065F46' : '#92400E'
                          }}>
                            {p.shipping_status === 'shipped' ? 'SHIPPED' : 'PENDING'}
                          </span>
                          {p.tracking_id && <span style={{ fontSize: '9px', color: '#9CA3AF', fontFamily: 'monospace' }}>ID: {p.tracking_id}</span>}
                          {p.status === 'success' && (
                            <button 
                              onClick={() => openEditShipping(p)} 
                              style={{ border: 'none', background: 'none', color: '#3B82F6', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {(p.delivery_type === 'none' || !p.delivery_type) && (
                      <span style={{ color: '#9CA3AF' }}>—</span>
                    )}
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
      {/* Edit Shipping Modal */}
      {editingPayment && (
        <div style={styles.modalOverlay} onClick={() => setEditingPayment(null)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif', margin: '0 0 16px 0' }}>Edit Shipping Details</h3>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Shipping Status</label>
              <select 
                value={shippingStatus} 
                onChange={e => setShippingStatus(e.target.value)} 
                style={styles.select}
              >
                <option value="pending_shipment">Pending Shipment</option>
                <option value="shipped">Shipped / Dispatched</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Tracking Number / Courier details</label>
              <input 
                type="text" 
                value={trackingId} 
                onChange={e => setTrackingId(e.target.value)} 
                placeholder="e.g. DTDC-123456" 
                style={styles.input} 
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={() => setEditingPayment(null)} 
                style={styles.btnSecondary}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleUpdateShipping} 
                disabled={updating}
                style={{
                  padding: '9px 18px',
                  borderRadius: '9999px',
                  background: '#1A1B4B',
                  color: '#FFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  opacity: updating ? 0.7 : 1
                }}
              >
                {updating ? 'Updating...' : 'Save Tracking'}
              </button>
            </div>
          </div>
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
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modalBox: { background: '#FFF', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  input: { width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', background: '#FAFAFA', boxSizing: 'border-box', fontFamily: 'inherit' },
  select: { width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', background: '#FAFAFA', boxSizing: 'border-box', fontFamily: 'inherit', cursor: 'pointer' },
  btnSecondary: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '9999px', border: '1.5px solid #E5E7EB', cursor: 'pointer', fontSize: '13px', fontWeight: '700', background: '#FFF', color: '#374151', fontFamily: 'Outfit, sans-serif' },
};
