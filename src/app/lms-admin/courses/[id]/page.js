'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, BookOpen, Image, Tag, DollarSign, Award, Trash2, AlertTriangle } from 'lucide-react';
import { formatImageUrl } from '@/lib/utils';

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const DEFAULT_CATEGORIES = ['Spirituality', 'Philosophy', 'Values Education', 'Meditation', 'General', 'Other'];

export default function EditCoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);

   const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryTarget, setLibraryTarget] = useState(null);
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
 
  const handleMaterialUpload = async (e, idx) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIndex(idx);
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
        set('materials', form.materials.map((item, i) => i === idx ? { ...item, image_url: data.url } : item));
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Error uploading image: ' + err.message);
    } finally {
      setUploadingIndex(null);
    }
  };

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
        custom_layout: c.custom_layout || {},
        has_material: c.has_material || false,
        materials: c.materials || [],
        shipping_charges: c.shipping_charges ?? '',
      });
      setLoading(false);
    };
    load();
  }, [id]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories');
        if (res.ok) {
          const data = await res.json();
          if (data.categories && data.categories.length > 0) {
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
          shipping_charges: parseFloat(form.shipping_charges) || 0,
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

  const metadata = form?.custom_layout?.metadata || {};
  const instructor = metadata.instructor || { name: '', title: '', bio: '', initials: '' };
  const faqs = metadata.faq || [];
  const highlights = metadata.highlights || [];

  const updateMetadata = (key, val) => {
    const newMetadata = { ...metadata, [key]: val };
    setForm(p => ({
      ...p,
      custom_layout: {
        ...p.custom_layout,
        metadata: newMetadata
      }
    }));
  };

  const updateInstructor = (key, val) => {
    const newInstructor = { ...instructor, [key]: val };
    updateMetadata('instructor', newInstructor);
  };

  return (
    <div>
      <div style={styles.header}>
        <Link href="/lms-admin/courses" style={styles.back}><ArrowLeft size={14} /> Back to Courses</Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={styles.title}>Edit Course</h1>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link href={`/lms-admin/courses/${id}/quizzes`} style={styles.quizzesBtn}>
              📝 Manage Quizzes
            </Link>
            <Link href={`/lms-admin/courses/${id}/builder`} style={styles.builderBtn}>
              📚 Go to Builder
            </Link>
            <Link href={`/lms-admin/courses/${id}/page-builder`} style={styles.pageBuilderBtn}>
              🎨 Special Page Builder
            </Link>
          </div>
        </div>
      </div>

      {error && <div style={styles.errorBox}>⚠️ {error}</div>}
      {saved && <div style={styles.successBox}>✅ Course saved successfully!</div>}

      <form onSubmit={handleSave}>
        <div style={styles.grid} className="courses-edit-grid">
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
              <Field label="Thumbnail Image URL / Upload">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input value={form.thumbnail_url} onChange={e => set('thumbnail_url', e.target.value)} type="url" placeholder="https://…" style={{ ...styles.input, flex: 1 }} />
                  
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

                  <button type="button" onClick={() => { loadLibraryFiles(); setLibraryTarget('thumbnail'); setShowLibrary(true); }} style={{
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
                    fontFamily: 'Outfit, sans-serif',
                    border: 'none'
                  }}>
                    📁 Library
                  </button>
                </div>
              </Field>
              {form.thumbnail_url && (
                <img src={formatImageUrl(form.thumbnail_url)} alt="Preview" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '10px', marginTop: '8px' }} onError={e => e.target.style.display = 'none'} />
              )}
            </div>

            {/* Instructor & Landing Page Details Card */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>👥 Instructor & Landing Page Details</h2>
              <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>
                These settings configure the instructor card, landing highlights, and FAQs shown on the default landing page.
              </p>

              {/* Instructor Form */}
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#111827', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>Mentor Profile</h3>
              <Field label="Instructor Name">
                <input value={instructor.name} onChange={e => updateInstructor('name', e.target.value)} placeholder="e.g. Radheshyam Das" style={styles.input} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '10px' }}>
                <Field label="Instructor Title">
                  <input value={instructor.title} onChange={e => updateInstructor('title', e.target.value)} placeholder="e.g. Renowned Vedic Educator" style={styles.input} />
                </Field>
                <Field label="Initials">
                  <input value={instructor.initials} onChange={e => updateInstructor('initials', e.target.value)} placeholder="RD" style={styles.input} maxLength={3} />
                </Field>
              </div>
              <Field label="Biography">
                <textarea value={instructor.bio} onChange={e => updateInstructor('bio', e.target.value)} placeholder="Instructor bio details..." style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }} />
              </Field>

              <hr style={{ border: 'none', borderTop: '1px solid #F3F4F6', margin: '20px 0' }} />

              {/* What You Will Learn (Highlights) Form */}
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>What You Will Learn (Highlights)</h3>
              {highlights.map((h, idx) => (
                <div key={idx} style={{ background: '#FAF9F6', padding: '12px', borderRadius: '10px', marginBottom: '10px', border: '1px solid #E5E7EB', position: 'relative' }}>
                  <button type="button" onClick={() => updateMetadata('highlights', highlights.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '12px' }}>✕ Remove</button>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '6px', fontWeight: 'bold' }}>Highlight #{idx + 1}</div>
                  <input value={h.title} onChange={e => updateMetadata('highlights', highlights.map((item, i) => i === idx ? { ...item, title: e.target.value } : item))} placeholder="Title" style={{ ...styles.input, marginBottom: '6px', padding: '6px 10px', fontSize: '13px' }} />
                  <textarea value={h.text} onChange={e => updateMetadata('highlights', highlights.map((item, i) => i === idx ? { ...item, text: e.target.value } : item))} placeholder="Description" style={{ ...styles.input, padding: '6px 10px', fontSize: '13px', minHeight: '40px', resize: 'vertical' }} />
                </div>
              ))}
              <button type="button" onClick={() => updateMetadata('highlights', [...highlights, { title: 'New Highlight', text: 'Detail summary here.' }])} style={{ padding: '8px 16px', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                + Add Highlight Card
              </button>

              <hr style={{ border: 'none', borderTop: '1px solid #F3F4F6', margin: '20px 0' }} />

              {/* FAQ Form */}
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>Frequently Asked Questions</h3>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{ background: '#FAF9F6', padding: '12px', borderRadius: '10px', marginBottom: '10px', border: '1px solid #E5E7EB', position: 'relative' }}>
                  <button type="button" onClick={() => updateMetadata('faq', faqs.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '12px' }}>✕ Remove</button>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '6px', fontWeight: 'bold' }}>FAQ #{idx + 1}</div>
                  <input value={faq.q} onChange={e => updateMetadata('faq', faqs.map((item, i) => i === idx ? { ...item, q: e.target.value } : item))} placeholder="Question" style={{ ...styles.input, marginBottom: '6px', padding: '6px 10px', fontSize: '13px' }} />
                  <textarea value={faq.a} onChange={e => updateMetadata('faq', faqs.map((item, i) => i === idx ? { ...item, a: e.target.value } : item))} placeholder="Answer" style={{ ...styles.input, padding: '6px 10px', fontSize: '13px', minHeight: '40px', resize: 'vertical' }} />
                </div>
              ))}
              <button type="button" onClick={() => updateMetadata('faq', [...faqs, { q: 'New Question?', a: 'Answer here.' }])} style={{ padding: '8px 16px', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                + Add FAQ Item
              </button>
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

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📦 Course Reference Materials</h2>
              <label style={styles.toggleRow}>
                <input type="checkbox" checked={form.has_material} onChange={e => set('has_material', e.target.checked)} style={{ display: 'none' }} />
                <div style={{ ...styles.toggle, background: form.has_material ? '#22C55E' : '#D1D5DB' }}>
                  <div style={{ ...styles.toggleDot, transform: form.has_material ? 'translateX(20px)' : 'translateX(2px)' }} />
                </div>
                <span style={styles.toggleLabel}>{form.has_material ? 'Includes reference materials / books' : 'No materials'}</span>
              </label>

              {form.has_material && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <Field label="Shipping Charges (₹)">
                    <input 
                      type="number" 
                      value={form.shipping_charges} 
                      onChange={e => set('shipping_charges', e.target.value)} 
                      placeholder="e.g. 50" 
                      min="0" 
                      step="1" 
                      style={styles.input} 
                    />
                    <span style={styles.hint}>Charges applied for home delivery</span>
                  </Field>

                  <hr style={{ border: 'none', borderTop: '1px solid #F3F4F6', margin: '8px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#111827', margin: 0 }}>Materials List</h3>
                    <button 
                      type="button" 
                      onClick={() => set('materials', [...(form.materials || []), { title: '', description: '', image_url: '' }])}
                      style={{
                        padding: '6px 12px',
                        background: '#1A1B4B',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      + Add Material
                    </button>
                  </div>

                  {(!form.materials || form.materials.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '16px', color: '#9CA3AF', fontSize: '12px', background: '#FAFAFA', borderRadius: '8px', border: '1px dashed #E5E7EB' }}>
                      No materials added yet. Click "+ Add Material" above.
                    </div>
                  ) : (
                    form.materials.map((mat, idx) => (
                      <div key={idx} style={{ background: '#FAF9F6', padding: '12px', borderRadius: '10px', border: '1px solid #E5E7EB', position: 'relative' }}>
                        <button 
                          type="button" 
                          onClick={() => set('materials', form.materials.filter((_, i) => i !== idx))} 
                          style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '11px', fontWeight: '700' }}
                        >
                          ✕ Remove
                        </button>
                        <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '6px', fontWeight: 'bold' }}>Material #{idx + 1}</div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <input 
                            value={mat.title} 
                            onChange={e => set('materials', form.materials.map((item, i) => i === idx ? { ...item, title: e.target.value } : item))} 
                            placeholder="Material / Book Title" 
                            style={{ ...styles.input, padding: '6px 10px', fontSize: '13px' }} 
                            required 
                          />
                          <textarea 
                            value={mat.description} 
                            onChange={e => set('materials', form.materials.map((item, i) => i === idx ? { ...item, description: e.target.value } : item))} 
                            placeholder="Short description" 
                            style={{ ...styles.input, padding: '6px 10px', fontSize: '13px', minHeight: '40px', resize: 'vertical' }} 
                          />
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input 
                              value={mat.image_url} 
                              onChange={e => set('materials', form.materials.map((item, i) => i === idx ? { ...item, image_url: e.target.value } : item))} 
                              placeholder="Image / Photo URL" 
                              type="url" 
                              style={{ ...styles.input, padding: '6px 10px', fontSize: '13px', flex: 1 }} 
                            />
                            
                            <label style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              padding: '8px 12px',
                              background: '#1A1B4B',
                              color: '#FFF',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              opacity: uploadingIndex === idx ? 0.7 : 1,
                              pointerEvents: uploadingIndex === idx ? 'none' : 'auto',
                              fontFamily: 'Outfit, sans-serif'
                            }}>
                              {uploadingIndex === idx ? (
                                <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</>
                              ) : (
                                '🖼️ Upload'
                              )}
                              <input type="file" accept="image/*" onChange={e => handleMaterialUpload(e, idx)} style={{ display: 'none' }} disabled={uploadingIndex !== null} />
                            </label>

                            <button 
                              type="button" 
                              onClick={() => { loadLibraryFiles(); setLibraryTarget({ type: 'material', index: idx }); setShowLibrary(true); }} 
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                padding: '8px 12px',
                                background: '#E5E7EB',
                                color: '#1F2937',
                                borderRadius: '8px',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                fontFamily: 'Outfit, sans-serif',
                                border: 'none'
                              }}
                            >
                              📁 Library
                            </button>
                          </div>
                          {mat.image_url && (
                            <img src={formatImageUrl(mat.image_url)} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', marginTop: '4px' }} onError={e => e.target.style.display = 'none'} />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <button type="submit" disabled={saving} style={styles.saveBtn}>
              {saving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Save size={16} /> Save Changes</>}
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
                      if (!libraryTarget || libraryTarget === 'thumbnail') {
                        set('thumbnail_url', file.url);
                      } else if (libraryTarget?.type === 'material') {
                        set('materials', form.materials.map((item, i) => i === libraryTarget.index ? { ...item, image_url: file.url } : item));
                      }
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
  pageBuilderBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '8px', background: 'linear-gradient(135deg, #7C3AED, #2D1B69)', color: '#fff', fontWeight: '700', fontSize: '13px', textDecoration: 'none' },
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
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modalBox: { background: '#FFF', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'slideUp 0.25s ease' },
  btnSecondary: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '9999px', border: '1.5px solid #E5E7EB', cursor: 'pointer', fontSize: '13px', fontWeight: '700', background: '#FFF', color: '#374151', fontFamily: 'Outfit, sans-serif' },
};
