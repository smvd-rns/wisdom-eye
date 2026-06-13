'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, BookOpen, Image, Tag, DollarSign, Award, Trash2, AlertTriangle } from 'lucide-react';
import { formatImageUrl } from '@/lib/utils';

const CATEGORIES = ['Spirituality', 'Philosophy', 'Values Education', 'Meditation', 'General', 'Other'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

export default function EditCoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/courses/${id}`);
      const data = await res.json();
      if (!res.ok) { router.push('/lms-admin/courses'); return; }
      const c = data.course;
      setForm({
        title: c.title || '',
        short_description: c.short_description || '',
        description: c.description || '',
        thumbnail_url: c.thumbnail_url || '',
        price: c.price ?? '',
        original_price: c.original_price || '',
        category: c.category || 'General',
        level: c.level || 'beginner',
        status: c.status || 'draft',
        has_certificate: c.has_certificate || false,
        certificate_image_url: c.certificate_image_url || '',
      });
      setLoading(false);
    };
    load();
  }, [id]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price) || 0,
          original_price: form.original_price ? parseFloat(form.original_price) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Save failed.'); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { setError('An error occurred.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm('PERMANENTLY delete this course and all its data? This cannot be undone.')) return;
    if (!confirm('Are you 100% sure? All modules, lessons, enrollments, and progress will be deleted.')) return;
    setDeleting(true);
    await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    router.push('/lms-admin/courses');
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Loader2 size={28} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} /></div>;

  return (
    <div>
      <div style={styles.header}>
        <Link href="/lms-admin/courses" style={styles.back}><ArrowLeft size={14} /> Back to Courses</Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={styles.title}>Edit Course</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href={`/lms-admin/courses/${id}/quizzes`} style={styles.quizzesBtn}>
              📝 Manage Quizzes
            </Link>
            <Link href={`/lms-admin/courses/${id}/builder`} style={styles.builderBtn}>
              📚 Go to Builder
            </Link>
          </div>
        </div>
      </div>

      {error && <div style={styles.errorBox}>⚠️ {error}</div>}
      {saved && <div style={styles.successBox}>✅ Course saved successfully!</div>}

      <form onSubmit={handleSave}>
        <div style={styles.grid}>
          <div style={styles.col}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}><BookOpen size={16} /> Course Information</h2>
              <Field label="Title *">
                <input value={form.title} onChange={e => set('title', e.target.value)} required style={styles.input} />
              </Field>
              <Field label="Short Description">
                <input value={form.short_description} onChange={e => set('short_description', e.target.value)} maxLength={150} style={styles.input} />
                <span style={styles.hint}>{form.short_description.length}/150</span>
              </Field>
              <Field label="Full Description">
                <textarea value={form.description} onChange={e => set('description', e.target.value)} style={{ ...styles.input, minHeight: '160px', resize: 'vertical' }} />
              </Field>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}><Image size={16} /> Thumbnail</h2>
              <Field label="Thumbnail URL">
                <input value={form.thumbnail_url} onChange={e => set('thumbnail_url', e.target.value)} type="url" placeholder="https://…" style={styles.input} />
              </Field>
              {form.thumbnail_url && (
                <img src={formatImageUrl(form.thumbnail_url)} alt="Preview" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '10px', marginTop: '8px' }} onError={e => e.target.style.display = 'none'} />
              )}
            </div>

            {/* Danger zone */}
            <div style={{ ...styles.card, borderColor: '#FECACA', borderWidth: '1.5px', borderStyle: 'solid' }}>
              <h2 style={{ ...styles.cardTitle, color: '#DC2626' }}><AlertTriangle size={16} /> Danger Zone</h2>
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>Deleting a course permanently removes all modules, lessons, enrollments, and progress data.</p>
              <button type="button" onClick={handleDelete} disabled={deleting} style={styles.deleteBtn}>
                {deleting ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={15} />}
                Delete This Course
              </button>
            </div>
          </div>

          <div style={styles.col}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}><Tag size={16} /> Category & Level</h2>
              <Field label="Category">
                <select value={form.category} onChange={e => set('category', e.target.value)} style={styles.select}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Level">
                <select value={form.level} onChange={e => set('level', e.target.value)} style={styles.select}>
                  {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={e => set('status', e.target.value)} style={styles.select}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </Field>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}><DollarSign size={16} /> Pricing</h2>
              <Field label="Price (₹)">
                <input value={form.price} onChange={e => set('price', e.target.value)} type="number" min="0" step="1" style={styles.input} />
                <span style={styles.hint}>0 = Free course</span>
              </Field>
              <Field label="Original Price (₹) (optional)">
                <input value={form.original_price} onChange={e => set('original_price', e.target.value)} type="number" min="0" step="1" style={styles.input} placeholder="Shown crossed out" />
              </Field>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}><Award size={16} /> Certificate</h2>
              <label style={styles.toggleRow}>
                <input type="checkbox" checked={form.has_certificate} onChange={e => set('has_certificate', e.target.checked)} style={{ display: 'none' }} />
                <div style={{ ...styles.toggle, background: form.has_certificate ? '#22C55E' : '#D1D5DB' }}>
                  <div style={{ ...styles.toggleDot, transform: form.has_certificate ? 'translateX(20px)' : 'translateX(2px)' }} />
                </div>
                <span style={styles.toggleLabel}>{form.has_certificate ? 'Award certificate on completion' : 'No certificate'}</span>
              </label>
              {form.has_certificate && (
                <Field label="Certificate Image URL" style={{ marginTop: '12px' }}>
                  <input value={form.certificate_image_url} onChange={e => set('certificate_image_url', e.target.value)} placeholder="https://… (direct image URL of your certificate design)" type="url" style={styles.input} />
                  {form.certificate_image_url && (
                    <img src={formatImageUrl(form.certificate_image_url)} alt="Certificate" style={{ width: '100%', borderRadius: '8px', marginTop: '8px' }} onError={e => e.target.style.display = 'none'} />
                  )}
                </Field>
              )}
            </div>

            <button type="submit" disabled={saving} style={styles.saveBtn}>
              {saving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </div>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  header: { marginBottom: '24px' },
  back: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '12px', marginBottom: '8px', textDecoration: 'none' },
  title: { fontSize: '22px', fontWeight: '800', color: '#111827', fontFamily: 'Outfit, sans-serif' },
  builderBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '8px', background: '#FF9F1C', color: '#1A1B4B', fontWeight: '700', fontSize: '13px', textDecoration: 'none' },
  quizzesBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontWeight: '600', fontSize: '13px', textDecoration: 'none' },
  errorBox: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 16px', color: '#DC2626', fontSize: '14px', marginBottom: '16px' },
  successBox: { background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px 16px', color: '#16A34A', fontSize: '14px', marginBottom: '16px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' },
  col: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
  cardTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #F3F4F6' },
  input: { width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', background: '#FAFAFA', boxSizing: 'border-box', fontFamily: 'inherit' },
  select: { width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', background: '#FAFAFA', boxSizing: 'border-box', fontFamily: 'inherit', cursor: 'pointer' },
  hint: { display: 'block', fontSize: '11px', color: '#9CA3AF', marginTop: '4px' },
  toggleRow: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
  toggle: { width: '44px', height: '24px', borderRadius: '9999px', position: 'relative', transition: 'background 0.2s', flexShrink: 0 },
  toggleDot: { position: 'absolute', top: '2px', width: '20px', height: '20px', background: '#fff', borderRadius: '50%', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },
  toggleLabel: { fontSize: '13px', color: '#374151', fontWeight: '500' },
  saveBtn: { background: 'linear-gradient(135deg, #1A1B4B, #2D1B69)', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', fontFamily: 'Outfit, sans-serif' },
  deleteBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: '#FEF2F2', color: '#DC2626', border: '1.5px solid #FECACA', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
};
