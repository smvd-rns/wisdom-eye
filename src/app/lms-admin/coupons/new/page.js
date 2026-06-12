'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Award, Plus, Calendar, Tag, Check, Download, Clipboard } from 'lucide-react';

export default function NewCouponPage() {
  const router = useRouter();

  // Mode: 'single' or 'bulk'
  const [mode, setMode] = useState('single');

  // Load courses for specific course selection
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // General state
  const [saving, setSaving] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]); // Array of course ids

  // Single coupon form
  const [singleForm, setSingleForm] = useState({
    code: '', description: '', type: 'percent', discount_value: '',
    applies_to: 'all', max_uses: '', valid_until: ''
  });

  // Bulk coupon form
  const [bulkForm, setBulkForm] = useState({
    prefix: 'VOICE', quantity: '50', type: 'free', discount_value: '0',
    applies_to: 'all', max_uses: '1', valid_until: ''
  });

  // Result state for bulk generation
  const [bulkResult, setBulkResult] = useState(null); // Array of coupon objects generated

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/admin/courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(data.courses || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseToggle = (courseId) => {
    setSelectedCourses(p =>
      p.includes(courseId) ? p.filter(id => id !== courseId) : [...p, courseId]
    );
  };

  const handleCreateSingle = async (e) => {
    e.preventDefault();
    if (!singleForm.code.trim()) return;
    setSaving(true);

    const payload = {
      ...singleForm,
      discount_value: parseFloat(singleForm.discount_value) || 0,
      max_uses: singleForm.max_uses ? parseInt(singleForm.max_uses) : null,
      course_ids: singleForm.applies_to === 'specific' ? selectedCourses : []
    };

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Coupon created successfully!');
        router.push('/lms-admin/coupons');
      } else {
        alert(data.error || 'Failed to create coupon.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setBulkResult(null);

    const payload = {
      ...bulkForm,
      discount_value: parseFloat(bulkForm.discount_value) || 0,
      quantity: parseInt(bulkForm.quantity) || 10,
      max_uses: bulkForm.max_uses ? parseInt(bulkForm.max_uses) : null,
      course_ids: bulkForm.applies_to === 'specific' ? selectedCourses : []
    };

    try {
      const res = await fetch('/api/admin/coupons/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setBulkResult(data.coupons || []);
      } else {
        alert(data.error || 'Failed to bulk generate coupons.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const downloadCSV = () => {
    if (!bulkResult || bulkResult.length === 0) return;
    
    // Create CSV header & rows
    const headers = ['Code', 'Type', 'Discount Value', 'Max Uses', 'Expires At'];
    const rows = bulkResult.map(c => [
      c.code,
      c.type,
      c.discount_value,
      c.max_uses ?? 'unlimited',
      c.valid_until ? new Date(c.valid_until).toLocaleDateString() : 'never'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    // Launch download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vouchers_${bulkForm.prefix}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!bulkResult) return;
    const codes = bulkResult.map(c => c.code).join('\n');
    navigator.clipboard.writeText(codes);
    alert('Copied all generated codes to clipboard!');
  };

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <Link href="/lms-admin/coupons" style={styles.back}>
            <ArrowLeft size={14} /> Back to Coupons
          </Link>
          <h1 style={styles.title}>Create Promo Vouchers</h1>
        </div>
      </div>

      {/* Mode switcher tabs */}
      {!bulkResult && (
        <div style={styles.tabs}>
          <button
            onClick={() => { setMode('single'); setSelectedCourses([]); }}
            style={{ ...styles.tab, ...(mode === 'single' ? styles.tabActive : {}) }}
          >
            Single Coupon Code
          </button>
          <button
            onClick={() => { setMode('bulk'); setSelectedCourses([]); }}
            style={{ ...styles.tab, ...(mode === 'bulk' ? styles.tabActive : {}) }}
          >
            Bulk Generate Free Vouchers
          </button>
        </div>
      )}

      {/* Main card */}
      <div style={styles.mainCard}>
        {bulkResult ? (
          /* Bulk success and download screen */
          <div style={styles.resultContainer}>
            <div style={styles.resultHeader}>
              <div style={styles.checkIconWrap}><Check size={28} color="#10B981" /></div>
              <h2>Bulk Generation Successful!</h2>
              <p>Successfully generated {bulkResult.length} unique coupon codes.</p>
            </div>

            <div style={styles.resultActions}>
              <button onClick={downloadCSV} style={styles.downloadBtn}>
                <Download size={15} /> Download as CSV (Spreadsheet)
              </button>
              <button onClick={copyToClipboard} style={styles.copyBtn}>
                <Clipboard size={15} /> Copy all codes to Clipboard
              </button>
            </div>

            <div style={styles.codeTextareaWrap}>
              <label style={styles.label}>Generated Coupon Codes Preview:</label>
              <textarea
                readOnly
                value={bulkResult.map(c => c.code).join('\n')}
                style={styles.textareaCodes}
              />
            </div>

            <div style={styles.doneBlock}>
              <Link href="/lms-admin/coupons" style={styles.doneLink}>
                Done & Return to Coupons Dashboard
              </Link>
            </div>
          </div>
        ) : mode === 'single' ? (
          /* Single coupon form */
          <form onSubmit={handleCreateSingle}>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Coupon Code *</label>
                <input
                  required
                  placeholder="e.g. WISDOM50"
                  value={singleForm.code}
                  onChange={e => setSingleForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Discount Type</label>
                <select
                  value={singleForm.type}
                  onChange={e => setSingleForm(p => ({ ...p, type: e.target.value }))}
                  style={styles.select}
                >
                  <option value="percent">Percentage Off (%)</option>
                  <option value="fixed">Fixed Amount Off (₹)</option>
                  <option value="free">100% Free Entry (0 price)</option>
                </select>
              </div>

              {singleForm.type !== 'free' && (
                <div>
                  <label style={styles.label}>Discount Value *</label>
                  <input
                    type="number" min="0" required
                    placeholder={singleForm.type === 'percent' ? 'e.g. 20' : 'e.g. 500'}
                    value={singleForm.discount_value}
                    onChange={e => setSingleForm(p => ({ ...p, discount_value: e.target.value }))}
                    style={styles.input}
                  />
                </div>
              )}

              <div>
                <label style={styles.label}>Campaign Description</label>
                <input
                  placeholder="e.g. Summer special sale promotion"
                  value={singleForm.description}
                  onChange={e => setSingleForm(p => ({ ...p, description: e.target.value }))}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Max Usages Limit (empty for unlimited)</label>
                <input
                  type="number" min="1"
                  placeholder="e.g. 100"
                  value={singleForm.max_uses}
                  onChange={e => setSingleForm(p => ({ ...p, max_uses: e.target.value }))}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Expiration Date (empty for never)</label>
                <input
                  type="date"
                  value={singleForm.valid_until}
                  onChange={e => setSingleForm(p => ({ ...p, valid_until: e.target.value }))}
                  style={styles.input}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={styles.label}>Coupon Scope</label>
                <select
                  value={singleForm.applies_to}
                  onChange={e => setSingleForm(p => ({ ...p, applies_to: e.target.value }))}
                  style={styles.select}
                >
                  <option value="all">Applies to All Courses</option>
                  <option value="specific">Applies Only to Specific Courses</option>
                </select>
              </div>

              {/* Specific Course Checklist */}
              {singleForm.applies_to === 'specific' && (
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={styles.label}>Select Eligible Courses *</label>
                  {loadingCourses ? (
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <div style={styles.courseChecklist}>
                      {courses.map(course => (
                        <label key={course.id} style={styles.courseCheckRow}>
                          <input
                            type="checkbox"
                            checked={selectedCourses.includes(course.id)}
                            onChange={() => handleCourseToggle(course.id)}
                          />
                          <span>{course.title}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={styles.formFooter}>
              <button type="submit" disabled={saving} style={styles.saveBtn}>
                {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />} Create Coupon
              </button>
            </div>
          </form>
        ) : (
          /* Bulk generate form */
          <form onSubmit={handleBulkGenerate}>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Code Prefix *</label>
                <input
                  required
                  placeholder="e.g. VOUCHER"
                  value={bulkForm.prefix}
                  onChange={e => setBulkForm(p => ({ ...p, prefix: e.target.value.toUpperCase() }))}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Quantity to Generate * (1-250)</label>
                <input
                  type="number" min="1" max="250" required
                  placeholder="e.g. 50"
                  value={bulkForm.quantity}
                  onChange={e => setBulkForm(p => ({ ...p, quantity: e.target.value }))}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Discount Type</label>
                <select
                  value={bulkForm.type}
                  onChange={e => setBulkForm(p => ({ ...p, type: e.target.value }))}
                  style={styles.select}
                >
                  <option value="free">100% Free Entry (0 price)</option>
                  <option value="percent">Percentage Off (%)</option>
                  <option value="fixed">Fixed Amount Off (₹)</option>
                </select>
              </div>

              {bulkForm.type !== 'free' && (
                <div>
                  <label style={styles.label}>Discount Value *</label>
                  <input
                    type="number" min="0" required
                    placeholder="e.g. 20"
                    value={bulkForm.discount_value}
                    onChange={e => setBulkForm(p => ({ ...p, discount_value: e.target.value }))}
                    style={styles.input}
                  />
                </div>
              )}

              <div>
                <label style={styles.label}>Max Usages per Voucher (usually 1)</label>
                <input
                  type="number" min="1" required
                  value={bulkForm.max_uses}
                  onChange={e => setBulkForm(p => ({ ...p, max_uses: e.target.value }))}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Expiration Date (empty for never)</label>
                <input
                  type="date"
                  value={bulkForm.valid_until}
                  onChange={e => setBulkForm(p => ({ ...p, valid_until: e.target.value }))}
                  style={styles.input}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={styles.label}>Coupon Scope</label>
                <select
                  value={bulkForm.applies_to}
                  onChange={e => setBulkForm(p => ({ ...p, applies_to: e.target.value }))}
                  style={styles.select}
                >
                  <option value="all">Applies to All Courses</option>
                  <option value="specific">Applies Only to Specific Courses</option>
                </select>
              </div>

              {/* Specific Course Checklist */}
              {bulkForm.applies_to === 'specific' && (
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={styles.label}>Select Eligible Courses *</label>
                  {loadingCourses ? (
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <div style={styles.courseChecklist}>
                      {courses.map(course => (
                        <label key={course.id} style={styles.courseCheckRow}>
                          <input
                            type="checkbox"
                            checked={selectedCourses.includes(course.id)}
                            onChange={() => handleCourseToggle(course.id)}
                          />
                          <span>{course.title}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={styles.formFooter}>
              <button type="submit" disabled={saving} style={styles.saveBtn}>
                {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />} Generate Batch
              </button>
            </div>
          </form>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  header: { marginBottom: '24px' },
  back: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '12px', marginBottom: '6px', textDecoration: 'none' },
  title: { fontSize: '22px', fontWeight: '800', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #E5E7EB', paddingBottom: '1px' },
  tab: { padding: '10px 16px', background: 'none', border: 'none', fontSize: '13px', fontWeight: '600', color: '#6B7280', cursor: 'pointer', borderBottom: '2.5px solid transparent', fontFamily: 'inherit' },
  tabActive: { color: '#1A1B4B', borderBottomColor: '#1A1B4B' },
  mainCard: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
  input: { width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' },
  select: { width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none', background: '#fff' },
  courseChecklist: { border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px', maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' },
  courseCheckRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' },
  formFooter: { marginTop: '20px', borderTop: '1px solid #F3F4F6', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' },
  saveBtn: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1A1B4B', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },

  resultContainer: { textAlign: 'center', padding: '10px 0' },
  resultHeader: { marginBottom: '24px' },
  checkIconWrap: { width: '56px', height: '56px', borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyOrigin: 'center', margin: '0 auto 12px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center' },
  resultActions: { display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' },
  downloadBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  copyBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '12px 24px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  codeTextareaWrap: { textAlign: 'left', maxWidth: '480px', margin: '0 auto 24px' },
  textareaCodes: { width: '100%', height: '180px', fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.5px', padding: '12px', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#F9FAFB', outline: 'none', resize: 'none' },
  doneBlock: { borderTop: '1px solid #F3F4F6', paddingTop: '16px' },
  doneLink: { display: 'inline-block', background: '#1A1B4B', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '700' }
};
