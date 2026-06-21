'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, BookOpen, Image, Tag, DollarSign, Award } from 'lucide-react';
import { formatImageUrl } from '@/lib/utils';

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const DEFAULT_CATEGORIES = ['Spirituality', 'Philosophy', 'Values Education', 'Meditation', 'General', 'Other'];

export default function NewCoursePage() {
  const router = useRouter();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [form, setForm] = useState({
    title: '', short_description: '', description: '',
    thumbnail_url: '', price: '', original_price: '',
    category: 'General', level: 'beginner',
    has_certificate: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Load custom categories on mount
  useState(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories');
        if (res.ok) {
          const data = await res.json();
          if (data.categories && data.categories.length > 0) {
            // Merge defaults and tenant-specific categories
            const merged = Array.from(new Set([...DEFAULT_CATEGORIES, ...data.categories]));
            setCategories(merged);
          }
        }
      } catch (err) {
        console.error('Failed to load custom categories', err);
      }
    };
    loadCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setAddingCat(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(prev => {
          const next = [...prev];
          if (!next.includes(data.category)) {
            next.push(data.category);
          }
          return next;
        });
        set('category', data.category);
        setNewCatName('');
      } else {
        setError(data.error || 'Failed to add custom category');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingCat(false);
    }
  };

  const handleDeleteCategory = async (catName) => {
    if (!confirm(`Are you sure you want to delete the category "${catName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories?name=${encodeURIComponent(catName)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c !== catName));
        if (form.category === catName) {
          set('category', 'General');
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete category');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload-drive', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm(p => ({ ...p, thumbnail_url: data.url }));
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Error uploading image: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

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

  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryFiles, setLibraryFiles] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  const loadLibraryFiles = async () => {
    setLoadingLibrary(true);
    try {
      const res = await fetch('/api/admin/upload-drive');
      if (res.ok) {
        const data = await res.json();
        setLibraryFiles(data.files || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLibrary(false);
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
                <label style={styles.label}>Thumbnail Image URL / Upload</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input value={form.thumbnail_url} onChange={e => set('thumbnail_url', e.target.value)}
                    placeholder="https://… (paste direct image URL or click Upload)" style={{ ...styles.input, flex: 1 }} type="url" />
                  <label style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '10px 16px',
                    background: '#1A1B4B',
                    color: '#FFF',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    opacity: uploading ? 0.7 : 1,
                    pointerEvents: uploading ? 'none' : 'auto',
                    fontFamily: 'Outfit, sans-serif'
                  }}>
                    {uploading ? (
                      <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</>
                    ) : (
                      '🖼️ Upload'
                    )}
                    <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
                  </label>

                  <button type="button" onClick={() => { loadLibraryFiles(); setShowLibrary(true); }} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '10px 16px',
                    background: '#E5E7EB',
                    color: '#1F2937',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    border: 'none',
                    fontFamily: 'Outfit, sans-serif'
                  }}>
                    🗂️ Library
                  </button>
                </div>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select value={form.category} onChange={e => set('category', e.target.value)} style={styles.select}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  
                  {/* Custom Category Input Option */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <input 
                      value={newCatName} 
                      onChange={e => setNewCatName(e.target.value)} 
                      placeholder="Add custom category..." 
                      style={{ ...styles.input, padding: '6px 10px', fontSize: '12.5px', flex: 1 }}
                    />
                    <button 
                      type="button" 
                      onClick={handleAddCategory} 
                      disabled={addingCat || !newCatName.trim()}
                      style={{
                        padding: '6px 14px',
                        background: '#1A1B4B',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        opacity: (addingCat || !newCatName.trim()) ? 0.6 : 1
                      }}
                    >
                      {addingCat ? 'Adding...' : 'Add'}
                    </button>
                  </div>

                  {/* Render custom categories with delete option */}
                  {categories.filter(c => !DEFAULT_CATEGORIES.includes(c)).length > 0 && (
                    <div style={{ marginTop: '6px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '4px' }}>Custom Categories:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {categories.filter(c => !DEFAULT_CATEGORIES.includes(c)).map(cat => (
                          <span 
                            key={cat} 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '6px', 
                              background: '#F3F4F6', 
                              border: '1px solid #E5E7EB', 
                              borderRadius: '6px', 
                              padding: '2px 8px', 
                              fontSize: '11.5px', 
                              color: '#374151' 
                            }}
                          >
                            {cat}
                            <button 
                              type="button" 
                              onClick={() => handleDeleteCategory(cat)}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: '#EF4444', 
                                cursor: 'pointer', 
                                padding: 0, 
                                fontSize: '10px',
                                fontWeight: 'bold' 
                              }}
                              title="Delete category"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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

      {/* Media Library Selector Modal */}
      {showLibrary && (
        <div style={styles.modalOverlay} onClick={() => setShowLibrary(false)}>
          <div style={{ ...styles.modalBox, maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', fontFamily: 'Outfit, sans-serif' }}>Media Library</h3>
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>Choose a previously uploaded image for your course thumbnail.</p>
              </div>
              <button onClick={() => setShowLibrary(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '20px' }}>×</button>
            </div>

            {loadingLibrary ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#9CA3AF', gap: '8px' }}>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: '#FF9F1C' }} />
                Loading media library...
              </div>
            ) : libraryFiles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF', fontSize: '14px' }}>
                No uploaded files found in your library yet. Upload your first image above!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', maxHeight: '320px', overflowY: 'auto', padding: '4px' }}>
                {libraryFiles.map(file => (
                  <div 
                    key={file.id} 
                    onClick={() => {
                      set('thumbnail_url', file.url);
                      setShowLibrary(false);
                    }}
                    style={{
                      border: '1.5px solid #E5E7EB',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: '#FAFAFA'
                    }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#FF9F1C'}
                    onMouseOut={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                  >
                    <img src={formatImageUrl(file.url)} alt={file.file_name} style={{ width: '100%', height: '90px', objectFit: 'cover' }} />
                    <div style={{ padding: '8px', fontSize: '11px', color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.file_name}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="button" onClick={() => setShowLibrary(false)} style={styles.btnSecondary}>Close</button>
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
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modalBox: { background: '#FFF', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'slideUp 0.25s ease' },
  btnSecondary: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '9999px', border: '1.5px solid #E5E7EB', cursor: 'pointer', fontSize: '13px', fontWeight: '700', background: '#FFF', color: '#374151', fontFamily: 'Outfit, sans-serif' },
};
