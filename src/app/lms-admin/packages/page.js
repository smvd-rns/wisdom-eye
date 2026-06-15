'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, ArrowLeft, Loader2, Check, X, Layers, AlertCircle, BookOpen, Image } from 'lucide-react';
import { formatImageUrl } from '@/lib/utils';

const resizeAndCompressImage = (file, maxWidth = 1600, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Canvas conversion to Blob failed.'));
          }
        }, 'image/jpeg', quality);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [editingId, setEditingId] = useState(null); // null means creating
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [desc, setDesc] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [status, setStatus] = useState('draft');
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');

    try {
      const compressed = await resizeAndCompressImage(file);
      const formData = new FormData();
      formData.append('file', compressed);

      const res = await fetch('/api/admin/upload-drive', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Upload failed');
        return;
      }
      setThumbnailUrl(data.url);
    } catch (err) {
      console.error(err);
      setError('Error compressing or uploading image: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pkgRes, courseRes] = await Promise.all([
        fetch('/api/admin/packages'),
        fetch('/api/courses') // gets all courses
      ]);

      if (pkgRes.ok) {
        const pkgData = await pkgRes.json();
        setPackages(pkgData.packages || []);
      } else {
        setError(
          <span>
            Failed to load packages. The packages table might not exist. Run the SQL migration in the{' '}
            <Link href="/lms-admin/database-setup" style={{ textDecoration: 'underline', fontWeight: 'bold' }}>
              Database Setup helper
            </Link>.
          </span>
        );
      }

      if (courseRes.ok) {
        const courseData = await courseRes.json();
        setCourses(courseData.courses || []);
      }
    } catch (err) {
      setError('An error occurred while fetching data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setTitle('');
    setShortDesc('');
    setDesc('');
    setThumbnailUrl('');
    setPrice('');
    setOriginalPrice('');
    setStatus('draft');
    setSelectedCourseIds([]);
    setFormOpen(true);
  };

  const openEditForm = async (pkg) => {
    setLoading(true);
    setEditingId(pkg.id);
    try {
      const res = await fetch(`/api/admin/packages/${pkg.id}`);
      if (res.ok) {
        const data = await res.json();
        const fullPkg = data.package;
        setTitle(fullPkg.title || '');
        setShortDesc(fullPkg.short_description || '');
        setDesc(fullPkg.description || '');
        setThumbnailUrl(fullPkg.thumbnail_url || '');
        setPrice(fullPkg.price ? String(fullPkg.price) : '');
        setOriginalPrice(fullPkg.original_price ? String(fullPkg.original_price) : '');
        setStatus(fullPkg.status || 'draft');
        setSelectedCourseIds(data.course_ids || []);
        setFormOpen(true);
      } else {
        setError('Failed to fetch package details.');
      }
    } catch (err) {
      setError('Error opening edit form.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (courseId) => {
    setSelectedCourseIds(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return setError('Title is required');

    setSubmitting(true);
    setError('');
    setSuccess('');

    const payload = {
      title,
      short_description: shortDesc,
      description: desc,
      thumbnail_url: thumbnailUrl,
      price: parseFloat(price) || 0,
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      status,
      course_ids: selectedCourseIds
    };

    try {
      const url = editingId ? `/api/admin/packages/${editingId}` : '/api/admin/packages';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess(editingId ? 'Package updated successfully!' : 'Package created successfully!');
        setFormOpen(false);
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save package.');
      }
    } catch (err) {
      setError('Error submitting form.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (pkgId) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/packages/${pkgId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSuccess('Package deleted successfully.');
        fetchData();
      } else {
        setError('Failed to delete package.');
      }
    } catch (err) {
      setError('Error deleting package.');
    }
  };

  return (
    <div style={styles.adminContainer}>
      {/* Header */}
      <div style={styles.header}>
        <Link href="/lms-admin" style={styles.backLink}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', width: '100%' }}>
          <div>
            <h1 style={styles.title}><Layers size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Course Packages</h1>
            <p style={styles.subtitle}>Group multiple courses manually into bundles with custom pricing.</p>
          </div>
          {!formOpen && (
            <button onClick={openCreateForm} style={styles.createBtn}>
              <Plus size={16} /> New Package
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={styles.alertError}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div style={styles.alertSuccess}>
          <Check size={16} /> {success}
        </div>
      )}

      {loading ? (
        <div style={styles.loadingContainer}>
          <Loader2 size={36} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '12px', color: '#6B7280' }}>Loading data...</p>
        </div>
      ) : formOpen ? (
        /* Create/Edit Form View */
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>{editingId ? 'Edit Package' : 'Create New Package'}</h2>
            <button onClick={() => setFormOpen(false)} style={styles.closeFormBtn}><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Package Title *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Complete Wisdom Eye Series" style={styles.input} />
            </div>

            <div style={styles.formRow}>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>Price (INR) *</label>
                <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} required placeholder="499" style={styles.input} />
              </div>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>Original Price (INR - Optional)</label>
                <input type="number" min="0" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} placeholder="800" style={styles.input} />
              </div>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} style={styles.select}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Thumbnail Image</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  value={thumbnailUrl} 
                  onChange={e => setThumbnailUrl(e.target.value)} 
                  placeholder="Paste Google Drive Link, web image URL, or upload" 
                  style={{ ...styles.input, flex: 1, minWidth: '240px' }} 
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current.click()}
                  style={styles.uploadBtn}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Image size={14} /> Upload Image
                    </>
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
              {thumbnailUrl && (
                <div style={styles.previewWrapper}>
                  <img src={formatImageUrl(thumbnailUrl)} alt="Thumbnail preview" referrerPolicy="no-referrer" style={styles.previewImg} />
                  <button 
                    type="button" 
                    onClick={() => setThumbnailUrl('')} 
                    style={styles.removePreviewBtn}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Short Description (Shown on cards)</label>
              <textarea value={shortDesc} onChange={e => setShortDesc(e.target.value)} rows="2" placeholder="Brief summary of the package..." style={styles.textarea} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Full Description (HTML or raw text)</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows="4" placeholder="Detailed outline, benefits, and course details..." style={styles.textarea} />
            </div>

            {/* Manual Course Selection Checklist */}
            <div style={{ ...styles.formGroup, background: '#FAF9F6', padding: '20px', borderRadius: '12px', border: '1.5px solid #FF9F1C' }}>
              <label style={{ ...styles.label, color: '#1A1B4B', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <BookOpen size={18} /> Select Courses to include in this Package:
              </label>
              {courses.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#6B7280' }}>No courses available. Create a course first!</p>
              ) : (
                <div style={styles.coursesChecklist}>
                  {courses.map(course => (
                    <label key={course.id} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={selectedCourseIds.includes(course.id)}
                        onChange={() => handleCheckboxChange(course.id)}
                        style={styles.checkbox}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={styles.courseTitle}>{course.title}</span>
                        <span style={styles.courseCategory}>{course.category} • {course.price === 0 ? 'Free' : `₹${course.price}`}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.formFooter}>
              <button type="button" onClick={() => setFormOpen(false)} style={styles.cancelBtn}>Cancel</button>
              <button type="submit" disabled={submitting} style={styles.submitBtn}>
                {submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Save Package'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Package List View */
        <div style={styles.tableCard}>
          {packages.length === 0 ? (
            <div style={styles.emptyState}>
              <Layers size={48} style={{ color: '#D1D5DB', marginBottom: '16px' }} />
              <h3 style={{ color: '#1A1B4B', marginBottom: '8px' }}>No Packages Created Yet</h3>
              <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>Create packages to bundle multiple courses for student enrollment.</p>
              <button onClick={openCreateForm} style={styles.createBtn}>
                <Plus size={16} /> Create Your First Package
              </button>
            </div>
          ) : (
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <span>Package Info</span>
                <span>Price</span>
                <span>Status</span>
                <span style={{ textAlign: 'right' }}>Actions</span>
              </div>
              {packages.map(pkg => (
                <div key={pkg.id} style={styles.tableRow}>
                  <div style={styles.pkgInfo}>
                    {pkg.thumbnail_url && (
                      <img src={formatImageUrl(pkg.thumbnail_url)} alt="" referrerPolicy="no-referrer" style={styles.pkgThumb} />
                    )}
                    <div>
                      <div style={styles.pkgTitle}>{pkg.title}</div>
                      <div style={styles.pkgDesc}>{pkg.short_description || 'No description provided'}</div>
                    </div>
                  </div>
                  <div style={styles.pkgPrice}>
                    <strong>₹{pkg.price}</strong>
                    {pkg.original_price && <span style={styles.pkgOriginalPrice}>₹{pkg.original_price}</span>}
                  </div>
                  <div>
                    <span style={{
                      ...styles.statusBadge,
                      background: pkg.status === 'published' ? '#D1FAE5' : pkg.status === 'archived' ? '#F3F4F6' : '#FEF3C7',
                      color: pkg.status === 'published' ? '#065F46' : pkg.status === 'archived' ? '#374151' : '#92400E'
                    }}>
                      {pkg.status}
                    </span>
                  </div>
                  <div style={styles.actions}>
                    <button onClick={() => openEditForm(pkg)} style={styles.actionBtnEdit}>
                      <Edit2 size={14} /> Edit
                    </button>
                    <button onClick={() => handleDelete(pkg.id)} style={styles.actionBtnDelete}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  adminContainer: { maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' },
  header: { borderBottom: '1px solid #E5E7EB', paddingBottom: '20px', marginBottom: '24px' },
  backLink: { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B7280', textDecoration: 'none', fontWeight: '600' },
  title: { fontSize: '28px', fontWeight: '800', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif', margin: '8px 0 4px' },
  subtitle: { fontSize: '14px', color: '#6B7280' },
  createBtn: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FF9F1C', color: '#1A1B4B', border: 'none', borderRadius: '9999px', padding: '10px 24px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' },
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' },
  alertError: { display: 'flex', alignItems: 'center', gap: '8px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', fontWeight: '600', marginBottom: '20px' },
  alertSuccess: { display: 'flex', alignItems: 'center', gap: '8px', background: '#D1FAE5', border: '1px solid #6EE7B7', color: '#065F46', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', fontWeight: '600', marginBottom: '20px' },
  
  // Table styles
  tableCard: { background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' },
  emptyState: { textAlign: 'center', padding: '64px 24px' },
  table: { display: 'flex', flexDirection: 'column' },
  tableHeader: { display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1.2fr', gap: '16px', background: '#FAF9F6', borderBottom: '1px solid #E5E7EB', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tableRow: { display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1.2fr', gap: '16px', borderBottom: '1px solid #F3F4F6', padding: '20px 24px', alignItems: 'center' },
  pkgInfo: { display: 'flex', alignItems: 'center', gap: '16px' },
  pkgThumb: { width: '48px', height: '48px', objectFit: 'contain', background: '#FAF8F5', borderRadius: '6px', border: '1px solid #E5E7EB' },
  pkgTitle: { fontSize: '15px', fontWeight: '700', color: '#1A1B4B', marginBottom: '4px' },
  pkgDesc: { fontSize: '12px', color: '#6B7280', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  pkgPrice: { fontSize: '15px', color: '#1A1B4B' },
  pkgOriginalPrice: { fontSize: '12px', color: '#9CA3AF', textDecoration: 'line-through', marginLeft: '6px' },
  statusBadge: { padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '8px' },
  actionBtnEdit: { display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(26,27,75,0.06)', border: 'none', color: '#1A1B4B', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
  actionBtnDelete: { display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239,68,68,0.1)', border: 'none', color: '#EF4444', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },

  // Form styles
  formCard: { background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  formHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F3F4F6', paddingBottom: '16px', marginBottom: '24px' },
  formTitle: { fontSize: '20px', fontWeight: '800', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif', margin: 0 },
  closeFormBtn: { background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  formRow: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  label: { fontSize: '13px', fontWeight: '700', color: '#4B5563' },
  input: { padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' },
  select: { padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none', background: '#fff' },
  textarea: { padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' },
  formFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #F3F4F6', paddingTop: '20px', marginTop: '12px' },
  cancelBtn: { padding: '10px 24px', background: '#F3F4F6', color: '#4B5563', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' },
  submitBtn: { padding: '10px 28px', background: '#1A1B4B', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },

  // Checklist styles
  coursesChecklist: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginTop: '8px' },
  checkboxLabel: { display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', cursor: 'pointer', transition: 'border-color 0.15s' },
  checkbox: { marginTop: '4px', accentColor: '#FF9F1C' },
  courseTitle: { fontSize: '13px', fontWeight: '700', color: '#1A1B4B', lineHeight: 1.3 },
  courseCategory: { fontSize: '11px', color: '#6B7280', marginTop: '4px', textTransform: 'uppercase', fontWeight: '600' },

  // Upload component styles
  uploadBtn: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: '8px', padding: '12px 18px', fontSize: '13px', fontWeight: '700', color: '#1E40AF', cursor: 'pointer', transition: 'all 0.15s' },
  previewWrapper: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', background: '#FAF9F6', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', width: 'fit-content' },
  previewImg: { height: '60px', width: '80px', objectFit: 'contain', background: '#fff', borderRadius: '4px', border: '1px solid #D1D5DB' },
  removePreviewBtn: { background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
};
