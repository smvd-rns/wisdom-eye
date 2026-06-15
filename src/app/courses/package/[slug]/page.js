'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Layers, CheckCircle2, ChevronRight, Clock, Award } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatImageUrl } from '@/lib/utils';

export default function PackageDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await fetch('/api/packages', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const found = (data.packages || []).find(p => p.slug === slug);
          if (found) {
            setPkg(found);
          } else {
            router.push('/courses');
          }
        }
      } catch (err) {
        console.error('Error fetching package details:', err);
      } finally {
        setLoading(false);
      }
    };
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (slug) {
      fetchPackage();
      fetchUser();
    }
  }, [slug]);

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/login?redirect=/courses/package/${slug}`);
      return;
    }
    setEnrolling(true);
    try {
      // Loop and enroll in each course in the package
      for (const course of pkg.courses) {
        await fetch(`/api/courses/${course.id}/enroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
      }
      alert(`Success! You have been successfully enrolled in all ${pkg.courses_count} courses in this package.`);
      router.push('/courses');
    } catch (err) {
      console.error(err);
      alert('Enrollment failed: ' + err.message);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f3eb', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={styles.spinner} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!pkg) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3eb', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '40px 24px', maxWidth: '1100px', margin: '0 auto', width: '100%', fontFamily: 'Inter, sans-serif' }}>
        {/* Back Link */}
        <Link href="/courses" style={styles.backLink}>
          <ArrowLeft size={16} /> Back to All Courses
        </Link>

        {/* Hero Section */}
        <div style={styles.heroCard}>
          <div style={styles.heroThumbWrapper}>
            <img src={formatImageUrl(pkg.thumbnail_url)} alt={pkg.title} referrerPolicy="no-referrer" style={styles.heroThumb} />
          </div>
          <div style={styles.heroBody}>
            <div style={styles.badge}><Layers size={14} /> Course Bundle Package</div>
            <h1 style={styles.title}>{pkg.title}</h1>
            <p style={styles.desc}>{pkg.short_description || 'Get complete access to a curated series of courses with this special package bundle.'}</p>
            
            {/* Price Card Mobile (Inside Hero) */}
            <div style={styles.priceSection}>
              <div style={styles.priceRow}>
                <span style={styles.priceVal}>₹{pkg.price}</span>
                {pkg.original_price && <span style={styles.origPrice}>₹{pkg.original_price}</span>}
              </div>
              <p style={styles.discountText}>
                {pkg.original_price ? `Save ₹${pkg.original_price - pkg.price} on this bundle package deal!` : 'Best value bundle deal'}
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={styles.layout}>
          {/* Left: Courses Included */}
          <div style={styles.leftCol}>
            <h2 style={styles.sectionTitle}>
              <BookOpen size={20} color="#FF9F1C" /> Courses Included in this Package ({pkg.courses_count || 0})
            </h2>
            <div style={styles.courseGrid}>
              {pkg.courses && pkg.courses.map(course => (
                <div key={course.id} style={styles.courseCard}>
                  <div style={styles.courseThumbWrapper}>
                    <img src={formatImageUrl(course.thumbnail_url)} alt={course.title} referrerPolicy="no-referrer" style={styles.courseThumb} />
                  </div>
                  <div style={styles.courseBody}>
                    <span style={styles.courseCat}>{course.category}</span>
                    <h3 style={styles.courseTitle}>{course.title}</h3>
                    
                    <div style={styles.courseMeta}>
                      <span style={styles.metaItem}><Clock size={12} /> {course.level}</span>
                      {course.has_certificate && <span style={styles.metaItem}><Award size={12} /> Certificate</span>}
                    </div>

                    <div style={styles.courseFooter}>
                      <Link href={`/courses/${course.slug}`} style={styles.viewCourseBtn}>
                        View Course Details <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Checkout Sidebar */}
          <div style={styles.rightCol}>
            <div style={styles.checkoutCard}>
              <h3 style={styles.checkoutTitle}>Purchase Package</h3>
              <div style={styles.checkoutStats}>
                <div style={styles.statRow}>
                  <span>Included Courses:</span>
                  <strong>{pkg.courses_count}</strong>
                </div>
                <div style={styles.statRow}>
                  <span>Total Value:</span>
                  <span style={{ textDecoration: 'line-through', color: '#9CA3AF' }}>₹{pkg.original_price || pkg.price * 2}</span>
                </div>
                <div style={styles.statRow}>
                  <span>Bundle Price:</span>
                  <span style={styles.finalPrice}>₹{pkg.price}</span>
                </div>
              </div>

              {/* Buy Button */}
              <button
                onClick={handleEnroll}
                disabled={enrolling || pkg.courses_count === 0}
                style={styles.buyBtn}
              >
                {enrolling ? 'Processing...' : `Buy Package (₹${pkg.price})`}
              </button>

              {/* Package Enroll Instruction */}
              <div style={styles.infoBox}>
                <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '13px', color: '#4B5563', lineHeight: 1.4 }}>
                  Purchasing this package grants you instant enrollment and lifetime access to all <strong>{pkg.courses_count} courses</strong> listed on the left.
                </p>
              </div>

              {/* Dynamic buy link redirection for package items */}
              <p style={styles.helperText}>
                To enroll, please select any course on the left to purchase or access it. Once enrolled in any course, your progress is tracked individually.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const styles = {
  spinner: { width: '40px', height: '40px', border: '4px solid rgba(26,27,75,0.1)', borderLeftColor: '#FF9F1C', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  backLink: { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6B7280', textDecoration: 'none', fontWeight: '600', marginBottom: '24px', transition: 'color 0.2s' },
  
  heroCard: { background: '#fff', borderRadius: '24px', border: '1px solid #E5E7EB', overflow: 'hidden', display: 'flex', gap: '32px', padding: '32px', marginBottom: '40px', flexWrap: 'wrap', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' },
  heroThumbWrapper: { width: '300px', height: '200px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0, border: '1px solid #F3F4F6' },
  heroThumb: { width: '100%', height: '100%', objectFit: 'cover' },
  heroBody: { flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,159,28,0.12)', color: '#FF9F1C', fontSize: '11px', fontWeight: '800', padding: '6px 12px', borderRadius: '9999px', width: 'fit-content', textTransform: 'uppercase', marginBottom: '16px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif', margin: '0 0 12px 0' },
  desc: { fontSize: '15px', color: '#4B5563', lineHeight: 1.6, margin: 0 },
  
  priceSection: { marginTop: '16px', borderTop: '1px solid #F3F4F6', paddingTop: '16px' },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: '8px' },
  priceVal: { fontSize: '26px', fontWeight: '800', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif' },
  origPrice: { fontSize: '16px', color: '#9CA3AF', textDecoration: 'line-through' },
  discountText: { fontSize: '13px', color: '#16A34A', fontWeight: '700', margin: '4px 0 0 0' },

  layout: { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px', alignItems: 'start', flexWrap: 'wrap' },
  
  leftCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sectionTitle: { fontSize: '20px', fontWeight: '800', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 },
  courseGrid: { display: 'flex', flexDirection: 'column', gap: '16px' },
  courseCard: { background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' },
  courseThumbWrapper: { width: '120px', height: '90px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#FAF9F6' },
  courseThumb: { width: '100%', height: '100%', objectFit: 'contain' },
  courseBody: { flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column' },
  courseCat: { fontSize: '10px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' },
  courseTitle: { fontSize: '15px', fontWeight: '700', color: '#1A1B4B', margin: '4px 0 8px 0' },
  courseMeta: { display: 'flex', gap: '12px', marginBottom: '8px' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6B7280' },
  courseFooter: { marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' },
  viewCourseBtn: { display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: '#FF9F1C', textDecoration: 'none' },

  rightCol: { position: 'sticky', top: '100px' },
  checkoutCard: { background: '#fff', borderRadius: '20px', border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' },
  checkoutTitle: { fontSize: '18px', fontWeight: '800', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif', margin: '0 0 20px 0' },
  checkoutStats: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' },
  statRow: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#4B5563' },
  finalPrice: { fontSize: '20px', fontWeight: '800', color: '#1A1B4B' },
  infoBox: { display: 'flex', gap: '8px', background: '#DCFCE7', borderRadius: '12px', padding: '12px', marginBottom: '20px' },
  helperText: { fontSize: '12px', color: '#6B7280', lineHeight: 1.5, margin: 0, textAlign: 'center', background: '#F9FAFB', padding: '12px', borderRadius: '8px', border: '1px dashed #E5E7EB' },
  buyBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FF9F1C, #E07A5F)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', width: '100%', marginBottom: '16px', textDecoration: 'none', fontFamily: 'Outfit, sans-serif' }
};
