'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Clock, Award, ChevronDown, ChevronUp, Play, FileText, Lock, CheckCircle, Loader2, Star, Users } from 'lucide-react';

export default function CourseLandingPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [coupon, setCoupon] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch course by slug
        const res = await fetch(`/api/courses/by-slug/${slug}`);
        if (!res.ok) { router.push('/courses'); return; }
        const data = await res.json();
        setCourse(data.course);

        // Check if logged in + enrolled
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData.user);
          // Check enrollment
          const enrRes = await fetch(`/api/courses/${data.course.id}/enrollment-check`);
          if (enrRes.ok) {
            const enrData = await enrRes.json();
            setIsEnrolled(enrData.enrolled);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [slug]);

  const toggleModule = (id) =>
    setExpandedModules(p => ({ ...p, [id]: !p[id] }));

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setApplyingCoupon(true);
    setCouponResult(null);
    try {
      const res = await fetch('/api/admin/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: coupon.trim().toUpperCase(), course_id: course.id }),
      });
      const data = await res.json();
      setCouponResult(data);
    } catch {
      setCouponResult({ error: 'Failed to apply coupon.' });
    } finally {
      setApplyingCoupon(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleEnroll = async () => {
    if (!user) { router.push(`/login?redirect=/courses/${slug}`); return; }
    setEnrolling(true);
    const finalPrice = couponResult?.final_price ?? course?.price ?? 0;

    if (finalPrice === 0) {
      // Free enrollment
      const res = await fetch(`/api/courses/${course.id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupon_code: couponResult ? coupon : null }),
      });
      const data = await res.json();
      if (res.ok) { router.push(`/courses/${slug}/learn`); return; }
      alert(data.error || 'Enrollment failed.');
      setEnrolling(false);
    } else {
      // Load Razorpay Script first
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert('Failed to load Razorpay payment gateway. Please check your internet connection.');
        setEnrolling(false);
        return;
      }

      // Paid — create Razorpay order
      const res = await fetch(`/api/courses/${course.id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupon_code: couponResult ? coupon : null }),
      });
      const orderData = await res.json();
      if (!res.ok) { alert(orderData.error || 'Payment error'); setEnrolling(false); return; }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Radheshyam Das',
        description: course.title,
        order_id: orderData.orderId,
        handler: async (response) => {
          const verifyRes = await fetch('/api/courses/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          if (verifyRes.ok) {
            router.push(`/courses/${slug}/learn`);
          } else {
            alert('Payment verification failed. Please contact support.');
            setEnrolling(false);
          }
        },
        modal: { ondismiss: () => setEnrolling(false) },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#1A1B4B' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    }
  };

  const formatDuration = (secs) => {
    if (!secs) return null;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F2F5' }}>
      <Loader2 size={32} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!course) return null;

  const discountedPrice = couponResult?.final_price ?? null;
  const displayPrice = discountedPrice !== null ? discountedPrice : course.price;
  const totalLessons = course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5' }}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.heroLeft}>
            <Link href="/courses" style={styles.backLink}>← All Courses</Link>
            <span style={styles.category}>{course.category}</span>
            <h1 style={styles.title}>{course.title}</h1>
            {course.short_description && (
              <p style={styles.subtitle}>{course.short_description}</p>
            )}

            <div style={styles.metaRow}>
              {course.level && <span style={styles.metaBadge}>{course.level}</span>}
              {totalLessons > 0 && <span style={styles.metaItem}><BookOpen size={14}/> {totalLessons} lessons</span>}
              {course.total_duration_seconds > 0 && <span style={styles.metaItem}><Clock size={14}/> {formatDuration(course.total_duration_seconds)}</span>}
              {course.has_certificate && <span style={styles.metaItem}><Award size={14}/> Certificate</span>}
            </div>
          </div>

          {/* Enroll card */}
          <div style={styles.enrollCard}>
            {course.thumbnail_url && (
              <img src={course.thumbnail_url} alt={course.title} style={styles.thumbnail} />
            )}
            <div style={styles.enrollBody}>
              <div style={styles.priceRow}>
                <span style={styles.price}>
                  {displayPrice === 0 ? 'Free' : `₹${Number(displayPrice).toLocaleString('en-IN')}`}
                </span>
                {course.original_price && course.original_price > displayPrice && (
                  <span style={styles.origPrice}>₹{Number(course.original_price).toLocaleString('en-IN')}</span>
                )}
                {couponResult?.discount_amount > 0 && (
                  <span style={styles.saveBadge}>You save ₹{couponResult.discount_amount}</span>
                )}
              </div>

              {/* Coupon */}
              {!isEnrolled && (
                <div style={styles.couponRow}>
                  <input
                    type="text" value={coupon}
                    onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponResult(null); }}
                    placeholder="Enter coupon code"
                    style={styles.couponInput}
                  />
                  <button onClick={applyCoupon} disabled={applyingCoupon || !coupon.trim()} style={styles.couponBtn}>
                    {applyingCoupon ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Apply'}
                  </button>
                </div>
              )}
              {couponResult?.error && <p style={{ color: '#DC2626', fontSize: '12px', marginBottom: '8px' }}>{couponResult.error}</p>}
              {couponResult?.success && <p style={{ color: '#16A34A', fontSize: '12px', marginBottom: '8px' }}>✓ Coupon applied! {couponResult.description}</p>}

              {isEnrolled ? (
                <Link href={`/courses/${slug}/learn`} style={styles.enrollBtn}>
                  Continue Learning →
                </Link>
              ) : (
                <button onClick={handleEnroll} disabled={enrolling} style={styles.enrollBtn}>
                  {enrolling ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</> : displayPrice === 0 ? 'Enroll for Free' : 'Enroll Now'}
                </button>
              )}

              <div style={styles.guarantees}>
                {course.has_certificate && <div style={styles.guarantee}><Award size={14} color="#22C55E" /> Certificate on completion</div>}
                <div style={styles.guarantee}><CheckCircle size={14} color="#22C55E" /> Lifetime access</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main body */}
      <div style={styles.bodyContainer}>
        {/* Description */}
        {course.description && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>About this Course</h2>
            <div style={{ color: '#4B5563', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{course.description}</div>
          </div>
        )}

        {/* Curriculum */}
        {course.modules?.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Course Curriculum</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {course.modules.map((mod, mi) => (
                <div key={mod.id} style={styles.moduleCard}>
                  <button onClick={() => toggleModule(mod.id)} style={styles.moduleHeader}>
                    <div style={styles.moduleLeft}>
                      <span style={styles.moduleNum}>Module {mi + 1}</span>
                      <span style={styles.moduleName}>{mod.title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{mod.lessons?.length || 0} lessons</span>
                      {expandedModules[mod.id] ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
                    </div>
                  </button>

                  {expandedModules[mod.id] && mod.lessons?.length > 0 && (
                    <div style={styles.lessonList}>
                      {mod.lessons.map(lesson => (
                        <div key={lesson.id} style={styles.lessonRow}>
                          <div style={styles.lessonLeft}>
                            {lesson.type === 'youtube' ? <Play size={14} color="#6B7280" /> : <FileText size={14} color="#6B7280" />}
                            <span style={styles.lessonTitle}>{lesson.title}</span>
                            {lesson.is_free_preview && <span style={styles.freeBadge}>Preview</span>}
                          </div>
                          {!lesson.is_free_preview && !isEnrolled && <Lock size={12} color="#D1D5DB" />}
                          {lesson.duration_seconds > 0 && (
                            <span style={styles.lessonDuration}>{formatDuration(lesson.duration_seconds)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <script src="https://checkout.razorpay.com/v1/checkout.js" />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  hero: { background: 'linear-gradient(135deg, #1A1B4B 0%, #0F1035 70%, #2D1B69 100%)', padding: '80px 24px 40px' },
  heroInner: { maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px', alignItems: 'start' },
  heroLeft: { color: '#fff' },
  backLink: { display: 'inline-block', color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '16px', textDecoration: 'none' },
  category: { display: 'inline-block', background: 'rgba(255,159,28,0.15)', color: '#FF9F1C', padding: '4px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', marginBottom: '12px' },
  title: { fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '12px', fontFamily: 'Outfit, sans-serif', lineHeight: 1.2 },
  subtitle: { fontSize: '16px', color: 'rgba(255,255,255,0.7)', marginBottom: '20px', lineHeight: 1.6 },
  metaRow: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
  metaBadge: { background: 'rgba(255,255,255,0.12)', color: '#fff', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' },
  enrollCard: { background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' },
  thumbnail: { width: '100%', height: '180px', objectFit: 'cover' },
  enrollBody: { padding: '24px' },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' },
  price: { fontSize: '30px', fontWeight: '800', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif' },
  origPrice: { fontSize: '16px', color: '#9CA3AF', textDecoration: 'line-through' },
  saveBadge: { background: '#DCFCE7', color: '#16A34A', fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '9999px' },
  couponRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
  couponInput: { flex: 1, padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', letterSpacing: '1px', fontFamily: 'monospace' },
  couponBtn: { padding: '9px 16px', background: '#F3F4F6', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', color: '#374151' },
  enrollBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #FF9F1C, #E07A5F)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', width: '100%', marginBottom: '16px', textDecoration: 'none', fontFamily: 'Outfit, sans-serif' },
  guarantees: { display: 'flex', flexDirection: 'column', gap: '6px' },
  guarantee: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6B7280' },
  bodyContainer: { maxWidth: '800px', margin: '0 auto', padding: '40px 24px' },
  section: { background: '#fff', borderRadius: '16px', padding: '28px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  sectionTitle: { fontSize: '20px', fontWeight: '700', color: '#1A1B4B', marginBottom: '20px', fontFamily: 'Outfit, sans-serif' },
  moduleCard: { border: '1.5px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' },
  moduleHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', width: '100%', background: '#F9FAFB', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' },
  moduleLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  moduleNum: { fontSize: '11px', fontWeight: '700', color: '#FF9F1C', textTransform: 'uppercase', letterSpacing: '0.5px' },
  moduleName: { fontSize: '14px', fontWeight: '600', color: '#1A1B4B' },
  lessonList: { borderTop: '1px solid #E5E7EB' },
  lessonRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', borderBottom: '1px solid #F3F4F6' },
  lessonLeft: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px' },
  lessonTitle: { fontSize: '13px', color: '#374151', flex: 1 },
  freeBadge: { background: '#DCFCE7', color: '#16A34A', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '9999px' },
  lessonDuration: { fontSize: '12px', color: '#9CA3AF', marginLeft: 'auto' },
};
