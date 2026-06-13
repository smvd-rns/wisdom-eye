'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, BookOpen, Image, Tag, DollarSign, Award } from 'lucide-react';
import { formatImageUrl } from '@/lib/utils';

const CATEGORIES = ['Spirituality', 'Philosophy', 'Values Education', 'Meditation', 'General', 'Other'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

export default function NewCoursePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', short_description: '', description: '',
    thumbnail_url: '', price: '', original_price: '',
    category: 'General', level: 'beginner',
    has_certificate: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price) || 0,
          original_price: form.original_price ? parseFloat(form.original_price) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create course.'); return; }
      // Redirect to builder
      router.push(`/lms-admin/courses/${data.course.id}/builder`);
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <Link href="/lms-admin/courses" style={styles.back}><ArrowLeft size={16} /> Back to Courses</Link>
        <h1 style={styles.title}>Create New Course</h1>
        <p style={styles.subtitle}>Fill in the details below. You can add lessons after saving.</p>
      </div>

      {error && <div style={styles.errorBox}>⚠️ {error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={styles.grid}>
          {/* Left column - main info */}
          <div style={styles.col}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}><BookOpen size={16} /> Course Information</h2>

              <div style={styles.field}>
                <label style={styles.label}>Course Title *</label>
                <input value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Universal Human Values" required style={styles.input} />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Short Description</label>
                <input value={form.short_description} onChange={e => set('short_description', e.target.value)}
                  placeholder="One line summary shown on course cards" style={styles.input} maxLength={150} />
                <span style={styles.hint}>{form.short_description.length}/150</span>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Full Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Detailed description of what students will learn…"
                  style={{ ...styles.input, minHeight: '160px', resize: 'vertical' }} />
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}><Image size={16} /> Thumbnail</h2>
              <div style={styles.field}>
                <label style={styles.label}>Thumbnail Image URL</label>
                <input value={form.thumbnail_url} onChange={e => set('thumbnail_url', e.target.value)}
                  placeholder="https://… (paste a direct image link)" style={styles.input} type="url" />
              </div>
              {form.thumbnail_url && (
                <img src={formatImageUrl(form.thumbnail_url)} alt="Preview"
                  style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '10px', marginTop: '8px' }}
                  onError={e => e.target.style.display = 'none'}
                />
              )}
            </div>
          </div>

          {/* Right column - settings */}
          <div style={styles.col}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}><Tag size={16} /> Category & Level</h2>

              <div style={styles.field}>
                <label style={styles.label}>Category</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} style={styles.select}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Level</label>
                <select value={form.level} onChange={e => set('level', e.target.value)} style={styles.select}>
                  {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}><DollarSign size={16} /> Pricing</h2>

              <div style={styles.field}>
                <label style={styles.label}>Price (₹)</label>
                <input value={form.price} onChange={e => set('price', e.target.value)}
                  placeholder="0 for free" type="number" min="0" step="1" style={styles.input} />
                <span style={styles.hint}>Enter 0 to make this course free</span>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Original Price (₹) <span style={styles.optional}>(optional — shows as crossed out)</span></label>
                <input value={form.original_price} onChange={e => set('original_price', e.target.value)}
                  placeholder="e.g. 999" type="number" min="0" step="1" style={styles.input} />
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}><Award size={16} /> Certificate</h2>
              <label style={styles.toggleRow}>
                <input type="checkbox" checked={form.has_certificate}
                  onChange={e => set('has_certificate', e.target.checked)} style={{ display: 'none' }} />
                <div style={{ ...styles.toggle, background: form.has_certificate ? '#22C55E' : '#D1D5DB' }}>
                  <div style={{ ...styles.toggleDot, transform: form.has_certificate ? 'translateX(20px)' : 'translateX(2px)' }} />
                </div>
                <span style={styles.toggleLabel}>
                  {form.has_certificate ? '✅ Award certificate on completion' : 'No certificate for this course'}
                </span>
              </label>
              {form.has_certificate && (
                <p style={styles.certHint}>You can upload the certificate image after creating the course in the Edit settings.</p>
              )}
            </div>

            <button type="submit" disabled={saving || !form.title} style={styles.submitBtn}>
              {saving
                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Creating…</>
                : 'Create Course & Go to Builder →'}
            </button>
          </div>
        </div>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  header: { marginBottom: '24px' },
  back: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '13px', marginBottom: '12px', textDecoration: 'none' },
  title: { fontSize: '22px', fontWeight: '800', color: '#111827', fontFamily: 'Outfit, sans-serif' },
  subtitle: { fontSize: '13px', color: '#9CA3AF', marginTop: '4px' },
  errorBox: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 16px', color: '#DC2626', fontSize: '14px', marginBottom: '20px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' },
  col: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
  cardTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #F3F4F6' },
  field: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', background: '#FAFAFA', boxSizing: 'border-box', fontFamily: 'inherit' },
  select: { width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', background: '#FAFAFA', boxSizing: 'border-box', fontFamily: 'inherit', cursor: 'pointer' },
  hint: { display: 'block', fontSize: '11px', color: '#9CA3AF', marginTop: '4px' },
  optional: { fontWeight: '400', color: '#9CA3AF' },
  toggleRow: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
  toggle: { width: '44px', height: '24px', borderRadius: '9999px', position: 'relative', transition: 'background 0.2s', flexShrink: 0 },
  toggleDot: { position: 'absolute', top: '2px', width: '20px', height: '20px', background: '#fff', borderRadius: '50%', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },
  toggleLabel: { fontSize: '13px', color: '#374151', fontWeight: '500' },
  certHint: { fontSize: '12px', color: '#6B7280', marginTop: '10px', background: '#F0FDF4', padding: '8px 12px', borderRadius: '8px' },
  submitBtn: { background: 'linear-gradient(135deg, #1A1B4B, #2D1B69)', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px 20px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', fontFamily: 'Outfit, sans-serif' },
};
