'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Clock, Award, ChevronRight, Loader2, Filter, Layers, CheckCircle } from 'lucide-react';
import { formatImageUrl } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const DEFAULT_CATEGORIES = ['All', 'Spirituality', 'Philosophy', 'Values Education', 'Meditation', 'General'];

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);

  const getTenantSlug = () => {
    if (typeof window !== 'undefined' && window.__TENANT_DATA__) {
      return window.__TENANT_DATA__.slug || 'wisdom-eye';
    }
    return 'wisdom-eye';
  };

  useEffect(() => {
    try {
      const slug = getTenantSlug();
      const cachedCourses = sessionStorage.getItem(`catalog_courses_${slug}`);
      const cachedPackages = sessionStorage.getItem(`catalog_packages_${slug}`);
      if (cachedCourses) setCourses(JSON.parse(cachedCourses));
      if (cachedPackages) setPackages(JSON.parse(cachedPackages));
      if (cachedCourses) {
        setLoading(false);
      } else {
        setCourses([]);
        setPackages([]);
        setLoading(true);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const slug = getTenantSlug();
    try {
      const cached = sessionStorage.getItem(`courses_page_categories_${slug}`);
      if (cached) {
        setCategories(JSON.parse(cached));
      }
    } catch (e) {}

    const loadCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories');
        if (res.ok) {
          const data = await res.json();
          let finalCategories = slug === 'wisdom-eye' ? DEFAULT_CATEGORIES : ['All'];
          if (data.categories && data.categories.length > 0) {
            finalCategories = ['All', ...data.categories];
          }
          setCategories(finalCategories);
          sessionStorage.setItem(`courses_page_categories_${slug}`, JSON.stringify(finalCategories));
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchPackages = async () => {
      const slug = getTenantSlug();
      try {
        const res = await fetch('/api/packages', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const pkgs = data.packages || [];
          setPackages(pkgs);
          sessionStorage.setItem(`catalog_packages_${slug}`, JSON.stringify(pkgs));
        }
      } catch (err) {
        console.error('Fetch packages error:', err);
      }
    };
    fetchPackages();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      const slug = getTenantSlug();
      const hasCached = sessionStorage.getItem(`catalog_courses_${slug}`);
      if (!hasCached) {
        setLoading(true);
      }
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category !== 'All') params.set('category', category);
      const res = await fetch(`/api/courses?${params}`);
      const data = await res.json();
      setCourses(data.courses || []);
      setLoading(false);

      if (category === 'All' && !search) {
        sessionStorage.setItem(`catalog_courses_${slug}`, JSON.stringify(data.courses || []));
      }
    };
    const timer = setTimeout(fetchCourses, 300);
    return () => clearTimeout(timer);
  }, [search, category]);

  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await fetch('/api/student/enrollments');
        if (res.ok) {
          const data = await res.json();
          const enrolledIds = new Set((data.enrollments || []).map(e => e.course_id));
          setEnrolledCourseIds(enrolledIds);
        }
      } catch (err) {
        console.error('Failed to load student enrollments', err);
      }
    };
    fetchEnrollments();
  }, []);

  const formatDuration = (secs) => {
    if (!secs) return '';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  // Group courses dynamically by category
  const groupedCourses = courses.reduce((acc, course) => {
    const cat = course.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(course);
    return acc;
  }, {});

  const renderCourseCard = (course) => {
    const isEnrolled = enrolledCourseIds.has(course.id);
    const cardHref = isEnrolled ? `/courses/${course.slug}/learn` : `/courses/${course.slug}`;

    return (
      <Link key={course.id} href={cardHref} style={styles.card} className="course-card-item">
        {/* Thumbnail */}
        <div style={{ ...styles.thumb, overflow: 'hidden' }}>
          {course.thumbnail_url ? (
            <>
              {/* Ambient background blur */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${formatImageUrl(course.thumbnail_url)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(10px) brightness(0.5)',
                transform: 'scale(1.15)',
                opacity: 0.8,
              }} />
              {/* Crisp contained foreground image */}
              <img
                src={formatImageUrl(course.thumbnail_url)}
                alt={course.title}
                referrerPolicy="no-referrer"
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  zIndex: 1
                }}
              />
            </>
          ) : (
            <div style={styles.thumbPlaceholder}>
              <BookOpen size={36} color="#9CA3AF" />
            </div>
          )}
          <div style={{ ...styles.levelBadge, zIndex: 2 }}>{course.level}</div>
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
            <span style={styles.enrollBtn}>
              {isEnrolled ? 'Continue' : 'Enroll'} <ChevronRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3eb', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero */}
      <div style={styles.hero} className="courses-hero">
        <div style={styles.heroContent}>
          <span style={styles.heroTag}>📚 All Courses & Bundles</span>
          <h1 style={styles.heroTitle}>Expand Your Knowledge</h1>
          <p style={styles.heroSubtitle}>Rooted in timeless Vedic wisdom, values education, and leadership principles</p>

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

      <div style={styles.container} className="courses-container">
        {/* Filter chips (Horizontal Scrolling on Mobile) */}
        <div style={styles.filters} className="filter-chips-container">
          <div style={styles.filterGroup} className="filter-chips-group">
            <Filter size={14} style={{ color: '#6B7280', flexShrink: 0 }} />
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`filter-chip ${category === cat ? 'active' : ''}`}
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
            {/* ─── 1. Featured Packages (Bundles) ─── */}
            {category === 'All' && !search && packages.length > 0 && (
              <div style={{ marginBottom: '48px' }} className="package-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <Layers size={22} color="#FF9F1C" />
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1A1B4B', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                    Wisdom Packages (Multiple Courses in One)
                  </h2>
                </div>

                <div className="packages-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
                  {packages.map(pkg => (
                    <div key={pkg.id} className="package-card" style={styles.packageCard}>
                      <div className="package-thumb-wrapper" style={styles.packageThumbWrapper}>
                        <img src={formatImageUrl(pkg.thumbnail_url)} alt={pkg.title} referrerPolicy="no-referrer" style={styles.packageThumb} />
                        <span style={pkg.original_price ? styles.packageBadge : { ...styles.packageBadge, display: 'none' }}>Bundle Deal</span>
                      </div>
                      <div style={styles.packageBody} className="package-body">
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          <span style={styles.cardCategory}>PACKAGE BUNDLE</span>
                          {pkg.courses_count > 0 && (
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#1A1B4B', background: 'rgba(26,27,75,0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                              {pkg.courses_count} Courses
                            </span>
                          )}
                        </div>

                        <h3 style={{ ...styles.cardTitle, fontSize: '18px', marginBottom: '8px' }}>{pkg.title}</h3>
                        <p style={{ ...styles.cardDesc, flex: 'none', marginBottom: '12px', WebkitLineClamp: 2 }}>{pkg.short_description}</p>

                        {pkg.included_courses && pkg.included_courses.length > 0 && (
                          <div style={{ marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '11px', fontWeight: '700', color: '#1A1B4B', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              Included Courses:
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {pkg.included_courses.slice(0, 3).map((cName, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#4B5563' }}>
                                  <CheckCircle size={13} color="#10B981" style={{ flexShrink: 0 }} />
                                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cName}</span>
                                </div>
                              ))}
                              {pkg.included_courses.length > 3 && (
                                <span style={{ fontSize: '11px', color: '#FF9F1C', fontWeight: '600', paddingLeft: '19px' }}>
                                  + {pkg.included_courses.length - 3} more courses
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="package-card-footer" style={{ ...styles.cardFooter, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px', marginTop: 'auto' }}>
                          <div style={styles.priceBlock}>
                            <span style={{ ...styles.price, fontSize: '20px' }}>
                              {pkg.price === 0 ? 'Free' : `₹${pkg.price.toLocaleString('en-IN')}`}
                            </span>
                            {pkg.original_price && pkg.original_price > pkg.price && (
                              <span style={styles.originalPrice}>₹{pkg.original_price.toLocaleString('en-IN')}</span>
                            )}
                          </div>
                          <Link href={`/courses/package/${pkg.slug}`} style={{ ...styles.navBtnPrimary, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                            Buy Package <ChevronRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── 2. Courses List ─── */}
            {category === 'All' ? (
              // Grouped view
              Object.keys(groupedCourses).map(catName => (
                <div key={catName} style={{ marginBottom: '44px' }} className="category-section">
                  <div style={{ borderBottom: '2.5px solid #FF9F1C', paddingBottom: '8px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1A1B4B', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                      {catName} Courses
                    </h2>
                    <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>
                      {groupedCourses[catName].length} Course{groupedCourses[catName].length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div style={styles.grid} className="category-section-grid">
                    {groupedCourses[catName].map(renderCourseCard)}
                  </div>
                </div>
              ))
            ) : (
              // Single filtered grid
              <>
                <p style={styles.resultCount}>{courses.length} course{courses.length !== 1 ? 's' : ''} found</p>
                <div style={styles.grid} className="category-section-grid">
                  {courses.map(renderCourseCard)}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <Footer />

      <style>{`
        /* Global horizontal scrolling category grids (applied on both mobile & desktop) */
        .category-section-grid {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch !important;
          scrollbar-width: none !important;
          gap: 20px !important;
          padding: 8px 4px 20px 4px !important;
        }
        .category-section-grid::-webkit-scrollbar {
          display: none !important;
        }
        .category-section-grid a.course-card-item {
          width: 300px !important;
          flex-shrink: 0 !important;
          display: flex !important;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Responsive styling */
        @media (max-width: 992px) {
          .courses-hero {
            padding: 48px 16px 36px !important;
          }
          .heroTitle {
            font-size: 32px !important;
          }
          .courses-container {
            padding: 16px 12px !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          
          /* Horizontal scrolling filter chips */
          .filter-chips-container {
            margin-left: -12px;
            margin-right: -12px;
            padding-left: 12px;
            padding-right: 12px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .filter-chips-container::-webkit-scrollbar {
            display: none;
          }
          .filter-chips-group {
            display: flex !important;
            flex-wrap: nowrap !important;
            width: max-content;
            padding-bottom: 4px;
          }
          .filter-chip {
            white-space: nowrap !important;
          }

          /* Packages horizontal scrolling in mobile view */
          .packages-grid {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
            margin-left: -12px !important;
            margin-right: -12px !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
            gap: 16px !important;
          }
          .packages-grid::-webkit-scrollbar {
            display: none !important;
          }

          /* Package Card Responsive Grid layout */
          .package-card {
            flex-direction: column !important;
            margin: 0 !important;
            width: 290px !important;
            flex-shrink: 0 !important;
            border-radius: 18px !important;
          }
          .package-thumb-wrapper {
            width: 100% !important;
            height: 140px !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            position: relative !important;
          }
          .package-thumb-wrapper img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            padding: 0 !important;
          }
          .package-body {
            padding: 16px !important;
            min-width: 0 !important;
            width: 100% !important;
            box-sizing: border-box !important;
            flex: 1 !important;
          }
          .package-card-footer {
            flex-wrap: nowrap !important;
            justify-content: space-between !important;
            align-items: center !important;
            gap: 8px !important;
            padding-top: 8px !important;
          }
        }
      `}</style>
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
  container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', flex: 1 },
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

  // Package Card Styles
  packageCard: {
    display: 'flex',
    background: '#fff',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    border: '1.5px solid #FF9F1C',
    textDecoration: 'none'
  },
  packageThumbWrapper: {
    width: '320px',
    position: 'relative',
    background: '#FAF8F5',
    flexShrink: 0
  },
  packageThumb: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    padding: '24px'
  },
  packageBadge: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    background: '#FF9F1C',
    color: '#1A1B4B',
    fontSize: '11px',
    fontWeight: '800',
    padding: '4px 12px',
    borderRadius: '9999px',
    textTransform: 'uppercase'
  },
  packageBody: {
    padding: '32px 24px 24px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  navBtnPrimary: {
    background: '#FF9F1C',
    color: '#1A1B4B',
    padding: '10px 24px',
    borderRadius: '9999px',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: 'Outfit, sans-serif',
  }
};
