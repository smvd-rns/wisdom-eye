'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, BookOpen, Loader2, MoreVertical, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatImageUrl } from '@/lib/utils';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/courses');
    const data = await res.json();
    setCourses(data.courses || []);
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = async (course) => {
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    await fetch(`/api/courses/${course.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setCourses(prev => prev.map(c => c.id === course.id ? { ...c, status: newStatus } : c));
  };

  const deleteCourse = async (id) => {
    if (!confirm('Delete this course? This cannot be undone. All modules, lessons, and enrollments will be removed.')) return;
    setDeleting(id);
    await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    setCourses(prev => prev.filter(c => c.id !== id));
    setDeleting(null);
  };

  const statusColors = {
    published: { bg: '#DCFCE7', color: '#16A34A' },
    draft: { bg: '#F3F4F6', color: '#6B7280' },
    archived: { bg: '#FEF3C7', color: '#D97706' },
  };

  return (
    <div>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Courses</h1>
          <p style={styles.pageSubtitle}>{courses.length} total course{courses.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/lms-admin/courses/new" style={styles.newBtn}>
          <Plus size={16} /> New Course
        </Link>
      </div>

      {/* Search */}
      <div style={styles.searchRow}>
        <div style={styles.searchWrap}>
          <Search size={15} style={styles.searchIcon} />
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search courses…"
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={styles.loading}><Loader2 size={28} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} /></div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <BookOpen size={48} style={{ color: '#E5E7EB', marginBottom: '12px' }} />
          <p style={{ color: '#9CA3AF' }}>No courses found. <Link href="/lms-admin/courses/new" style={{ color: '#FF9F1C', fontWeight: '600' }}>Create your first course →</Link></p>
        </div>
      ) : (
        <div className="responsive-table-wrapper">
          <div style={styles.table} className="responsive-table">
            <div style={styles.tableHead}>
              <span>Course</span>
              <span>Category</span>
              <span>Price</span>
              <span>Lessons</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
          {filtered.map(course => {
            const sc = statusColors[course.status] || statusColors.draft;
            return (
              <div key={course.id} style={styles.tableRow}>
                {/* Thumbnail + title */}
                <div style={styles.courseCell}>
                  <div style={styles.thumbSmall}>
                    {course.thumbnail_url
                      ? <img src={formatImageUrl(course.thumbnail_url, 150)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <BookOpen size={18} color="#9CA3AF" />}
                  </div>
                  <div>
                    <div style={styles.courseTitle}>{course.title}</div>
                    <div style={styles.courseSlug}>{course.slug}</div>
                  </div>
                </div>

                <span style={styles.cell}>{course.category}</span>
                <span style={styles.cell}>
                  {course.price === 0 ? <span style={{ color: '#16A34A', fontWeight: '600' }}>Free</span>
                    : `₹${Number(course.price).toLocaleString('en-IN')}`}
                </span>
                <span style={styles.cell}>{course.total_lessons || 0}</span>

                {/* Status toggle */}
                <span style={styles.cell}>
                  <button
                    onClick={() => toggleStatus(course)}
                    style={{ ...styles.statusBadge, background: sc.bg, color: sc.color }}
                    title={`Click to ${course.status === 'published' ? 'unpublish' : 'publish'}`}
                  >
                    {course.status === 'published'
                      ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {course.status}
                  </button>
                </span>

                {/* Actions */}
                <div style={styles.actions}>
                  <Link href={`/lms-admin/courses/${course.id}/builder`} style={styles.actionBtn} title="Build lessons">
                    <BookOpen size={15} />
                  </Link>
                  <Link href={`/lms-admin/courses/${course.id}`} style={styles.actionBtn} title="Edit course">
                    <Edit size={15} />
                  </Link>
                  <Link href={`/courses/${course.slug}`} target="_blank" style={styles.actionBtn} title="Preview">
                    <Eye size={15} />
                  </Link>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    disabled={deleting === course.id}
                    style={{ ...styles.actionBtn, color: '#EF4444' }} title="Delete"
                  >
                    {deleting === course.id ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  pageTitle: { fontSize: '22px', fontWeight: '800', color: '#111827', fontFamily: 'Outfit, sans-serif' },
  pageSubtitle: { fontSize: '13px', color: '#9CA3AF', marginTop: '2px' },
  newBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#FF9F1C', color: '#1A1B4B', padding: '10px 20px', borderRadius: '9999px', fontWeight: '700', fontSize: '14px', textDecoration: 'none', fontFamily: 'Outfit, sans-serif' },
  searchRow: { marginBottom: '16px' },
  searchWrap: { position: 'relative', maxWidth: '320px' },
  searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' },
  searchInput: { width: '100%', padding: '9px 12px 9px 36px', border: '1.5px solid #E5E7EB', borderRadius: '9px', fontSize: '14px', background: '#fff', boxSizing: 'border-box' },
  loading: { display: 'flex', justifyContent: 'center', padding: '60px 0' },
  empty: { background: '#fff', borderRadius: '16px', padding: '60px', textAlign: 'center', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
  table: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
  tableHead: { display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr 1fr', gap: '8px', padding: '12px 20px', background: '#F9FAFB', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #F3F4F6' },
  tableRow: { display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr 1fr', gap: '8px', padding: '14px 20px', borderBottom: '1px solid #F3F4F6', alignItems: 'center' },
  courseCell: { display: 'flex', alignItems: 'center', gap: '12px' },
  thumbSmall: { width: '44px', height: '44px', borderRadius: '8px', background: '#F3F4F6', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  courseTitle: { fontSize: '14px', fontWeight: '600', color: '#111827' },
  courseSlug: { fontSize: '11px', color: '#9CA3AF', marginTop: '2px' },
  cell: { fontSize: '13px', color: '#374151' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', textTransform: 'capitalize', border: 'none', cursor: 'pointer', fontFamily: 'inherit' },
  actions: { display: 'flex', gap: '4px', alignItems: 'center' },
  actionBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '7px', background: '#F3F4F6', color: '#6B7280', border: 'none', cursor: 'pointer', textDecoration: 'none', transition: 'background 0.15s' },
};
