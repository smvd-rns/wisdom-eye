'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Clock, Award, ChevronRight, Loader2, Filter } from 'lucide-react';

const CATEGORIES = ['All', 'Spirituality', 'Philosophy', 'Values Education', 'Meditation', 'General'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category !== 'All') params.set('category', category);
      const res = await fetch(`/api/courses?${params}`);
      const data = await res.json();
      setCourses(data.courses || []);
      setLoading(false);
    };
    const timer = setTimeout(fetchCourses, 300);
    return () => clearTimeout(timer);
  }, [search, category]);

  const formatDuration = (secs) => {
    if (!secs) return '';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5' }}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <span style={styles.heroTag}>📚 All Courses</span>
          <h1 style={styles.heroTitle}>Expand Your Knowledge</h1>
          <p style={styles.heroSubtitle}>Courses rooted in wisdom, values, and spiritual growth</p>

          {/* Search bar */}
          <div style={styles.searchWrap}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search courses…"
              style={styles.searchInput}
            />
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Filter chips */}
        <div style={styles.filters}>
          <div style={styles.filterGroup}>
            <Filter size={14} style={{ color: '#6B7280' }} />
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                style={{ ...styles.chip, ...(category === cat ? styles.chipActive : {}) }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={32} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : courses.length === 0 ? (
          <div style={styles.emptyState}>
            <BookOpen size={48} style={{ color: '#D1D5DB', marginBottom: '16px' }} />
            <h3 style={{ color: '#1A1B4B', marginBottom: '8px' }}>No courses found</h3>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>Try a different search or category</p>
          </div>
        ) : (
          <>
            <p style={styles.resultCount}>{courses.length} course{courses.length !== 1 ? 's' : ''} found</p>
            <div style={styles.grid}>
              {courses.map(course => (
                <Link key={course.id} href={`/courses/${course.slug}`} style={styles.card}>
                  {/* Thumbnail */}
                  <div style={styles.thumb}>
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={styles.thumbPlaceholder}>
                        <BookOpen size={36} color="#9CA3AF" />
                      </div>
                    )}
                    <div style={styles.levelBadge}>{course.level}</div>
                  </div>

                  {/* Body */}
                  <div style={styles.cardBody}>
                    <span style={styles.cardCategory}>{course.category}</span>
                    <h3 style={styles.cardTitle}>{course.title}</h3>
                    {course.short_description && (
                      <p style={styles.cardDesc}>{course.short_description}</p>
                    )}

                    <div style={styles.cardMeta}>
                      {course.total_lessons > 0 && (
                        <span style={styles.metaItem}><BookOpen size={13} /> {course.total_lessons} lessons</span>
                      )}
                      {course.total_duration_seconds > 0 && (
                        <span style={styles.metaItem}><Clock size={13} /> {formatDuration(course.total_duration_seconds)}</span>
                      )}
                      {course.has_certificate && (
                        <span style={styles.metaItem}><Award size={13} /> Certificate</span>
                      )}
                    </div>

                    <div style={styles.cardFooter}>
                      <div style={styles.priceBlock}>
                        <span style={styles.price}>
                          {course.price === 0 ? 'Free' : `₹${course.price.toLocaleString('en-IN')}`}
                        </span>
                        {course.original_price && course.original_price > course.price && (
                          <span style={styles.originalPrice}>₹{course.original_price.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                      <span style={styles.enrollBtn}>Enroll <ChevronRight size={14} /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  hero: {
    background: 'linear-gradient(135deg, #1A1B4B 0%, #0F1035 60%, #2D1B69 100%)',
    padding: '80px 24px 60px',
    textAlign: 'center',
  },
  heroContent: { maxWidth: '600px', margin: '0 auto' },
  heroTag: { display: 'inline-block', background: 'rgba(255,159,28,0.15)', color: '#FF9F1C', padding: '6px 16px', borderRadius: '9999px', fontSize: '13px', fontWeight: '700', marginBottom: '16px' },
  heroTitle: { fontSize: '40px', fontWeight: '800', color: '#fff', marginBottom: '12px', fontFamily: 'Outfit, sans-serif' },
  heroSubtitle: { fontSize: '16px', color: 'rgba(255,255,255,0.65)', marginBottom: '32px' },
  searchWrap: { position: 'relative', maxWidth: '440px', margin: '0 auto' },
  searchIcon: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' },
  searchInput: { width: '100%', padding: '14px 20px 14px 46px', borderRadius: '12px', border: 'none', fontSize: '15px', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', boxSizing: 'border-box' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  filters: { marginBottom: '24px' },
  filterGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
  chip: { padding: '7px 16px', borderRadius: '9999px', border: '1.5px solid #E5E7EB', background: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', color: '#6B7280', fontFamily: 'inherit' },
  chipActive: { background: '#1A1B4B', color: '#fff', borderColor: '#1A1B4B' },
  loadingState: { display: 'flex', justifyContent: 'center', padding: '80px 0' },
  emptyState: { textAlign: 'center', padding: '80px 0' },
  resultCount: { fontSize: '13px', color: '#6B7280', marginBottom: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' },
  card: { background: '#fff', borderRadius: '18px', overflow: 'hidden', textDecoration: 'none', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' },
  thumb: { height: '180px', background: '#F0F2F5', position: 'relative', overflow: 'hidden' },
  thumbPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  levelBadge: { position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '9999px', textTransform: 'capitalize' },
  cardBody: { padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' },
  cardCategory: { fontSize: '11px', fontWeight: '700', color: '#FF9F1C', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' },
  cardTitle: { fontSize: '17px', fontWeight: '700', color: '#1A1B4B', marginBottom: '8px', lineHeight: 1.35 },
  cardDesc: { fontSize: '13px', color: '#6B7280', lineHeight: 1.5, marginBottom: '12px', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  cardMeta: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6B7280' },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F3F4F6', paddingTop: '12px', marginTop: 'auto' },
  priceBlock: { display: 'flex', alignItems: 'baseline', gap: '8px' },
  price: { fontSize: '20px', fontWeight: '800', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif' },
  originalPrice: { fontSize: '13px', color: '#9CA3AF', textDecoration: 'line-through' },
  enrollBtn: { display: 'flex', alignItems: 'center', gap: '2px', fontSize: '13px', fontWeight: '700', color: '#FF9F1C' },
};
