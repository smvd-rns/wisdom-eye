'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Clock, Award, ChevronDown, ChevronUp, Play, FileText, Lock, CheckCircle, Loader2, Star, Users } from 'lucide-react';
import { formatImageUrl } from '@/lib/utils';
import SpecialCourseLanding from '@/components/SpecialCourseLanding';
import Navbar from '@/components/Navbar';

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
  const [previewLesson, setPreviewLesson] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    deliveryType: 'pickup',
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    if (user) {
      setShippingForm(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    try {
      const cachedCourse = sessionStorage.getItem(`landing_course_${slug}`);
      const cachedUser = sessionStorage.getItem(`landing_user_${slug}`);
      const cachedEnrolled = sessionStorage.getItem(`landing_enrolled_${slug}`);

      if (cachedCourse) setCourse(JSON.parse(cachedCourse));
      if (cachedUser) setUser(JSON.parse(cachedUser));
      if (cachedEnrolled) setIsEnrolled(cachedEnrolled === 'true');

      if (cachedCourse) {
        setLoading(false);
      }
    } catch (e) {
      console.error('Failed to load landing cache', e);
    }
  }, [slug]);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getGDriveEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('/preview')) return url;
    
    // Extract file ID
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
    
    // Extract folder ID
    const folderIdMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderIdMatch && folderIdMatch[1]) {
      return `https://drive.google.com/embeddedfolderview?id=${folderIdMatch[1]}`;
    }
    
    return url;
  };

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch course by slug
        const res = await fetch(`/api/courses/by-slug/${slug}`);
        if (!res.ok) { router.push('/courses'); return; }
        const data = await res.json();
        setCourse(data.course);
        sessionStorage.setItem(`landing_course_${slug}`, JSON.stringify(data.course));

        // Check if logged in + enrolled
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData.user);
          sessionStorage.setItem(`landing_user_${slug}`, JSON.stringify(meData.user));
          
          // Check enrollment
          const enrRes = await fetch(`/api/courses/${data.course.id}/enrollment-check`);
          if (enrRes.ok) {
            const enrData = await enrRes.json();
            setIsEnrolled(enrData.enrolled);
            sessionStorage.setItem(`landing_enrolled_${slug}`, enrData.enrolled ? 'true' : 'false');
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

  const handleEnrollClick = () => {
    if (!user) { router.push(`/login?redirect=/courses/${slug}`); return; }
    if (isEnrolled) { router.push(`/courses/${slug}/learn`); return; }
    
    // For special courses or courses with reference material, if it has a price, open the checkout modal
    if ((course.is_special || course.has_material) && course.price > 0) {
      setShowCheckoutModal(true);
    } else {
      // Free course or standard course: enroll directly
      handleEnroll();
    }
  };

  const handleEnroll = async () => {
    if (!user) { router.push(`/login?redirect=/courses/${slug}`); return; }
    setEnrolling(true);
    const finalPrice = couponResult?.final_price ?? course?.price ?? 0;

    const shippingDetails = {};
    if (course.has_material) {
      if (!shippingForm.name.trim() || !shippingForm.phone.trim()) {
        alert('Please enter your name and phone number for shipping/pickup.');
        setEnrolling(false);
        return;
      }
      shippingDetails.delivery_type = shippingForm.deliveryType;
      shippingDetails.shipping_name = shippingForm.name;
      shippingDetails.shipping_phone = shippingForm.phone;

      if (shippingForm.deliveryType === 'delivery') {
        if (!shippingForm.address.trim() || !shippingForm.city.trim() || !shippingForm.state.trim() || !shippingForm.pincode.trim()) {
          alert('Please fill out the complete shipping address.');
          setEnrolling(false);
          return;
        }
        shippingDetails.shipping_address = shippingForm.address;
        shippingDetails.shipping_city = shippingForm.city;
        shippingDetails.shipping_state = shippingForm.state;
        shippingDetails.shipping_pincode = shippingForm.pincode;
      }
    }

    const payload = {
      coupon_code: couponResult ? coupon : null,
      ...shippingDetails
    };

    // If course is free and we chose pickup (no shipping fee), process free enrollment.
    // Otherwise if it's home delivery, shipping fee makes finalPrice > 0, so go to Razorpay.
    const calculatedShippingFee = (course.has_material && shippingForm.deliveryType === 'delivery') ? (parseFloat(course.shipping_charges) || 0) : 0;
    const isFreeEnrollment = finalPrice === 0 && calculatedShippingFee === 0;

    if (isFreeEnrollment) {
      // Free enrollment
      const res = await fetch(`/api/courses/${course.id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) { 
        setShowCheckoutModal(false);
        router.push(`/courses/${slug}/learn`); 
        return; 
      }
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
        body: JSON.stringify(payload),
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
            setShowCheckoutModal(false);
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

  const renderCheckoutModal = () => {
    if (!showCheckoutModal) return null;

    const finalBasePrice = couponResult?.final_price ?? course.price ?? 0;
    const shippingFee = (course.has_material && shippingForm.deliveryType === 'delivery') ? (parseFloat(course.shipping_charges) || 0) : 0;
    const totalRegistrationPrice = Number(finalBasePrice) + shippingFee;

    return (
      <div style={styles.modalOverlay} onClick={() => setShowCheckoutModal(false)}>
        <div style={styles.checkoutModalBox} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif', margin: 0 }}>Confirm Enrollment</h3>
              <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px', margin: 0 }}>
                {course.has_material ? 'Confirm delivery option and complete checkout.' : 'Review details and apply coupon code below.'}
              </p>
            </div>
            <button onClick={() => setShowCheckoutModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '22px' }}>×</button>
          </div>

          <div style={{ background: '#F8F9FE', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid rgba(26,27,75,0.06)' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Course</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#1A1B4B', marginTop: '2px' }}>{course.title}</div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '16px', borderTop: '1px dashed #E5E7EB', paddingTop: '12px' }}>
              <span style={{ fontSize: '13px', color: '#4B5563', fontWeight: '600' }}>Course Fee:</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif' }}>
                  {finalBasePrice === 0 ? 'Free' : `₹${Number(finalBasePrice).toLocaleString('en-IN')}`}
                </span>
                {course.original_price && course.original_price > finalBasePrice && (
                  <span style={{ fontSize: '13px', color: '#9CA3AF', textDecoration: 'line-through' }}>₹{Number(course.original_price).toLocaleString('en-IN')}</span>
                )}
              </div>
            </div>

            {course.has_material && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4B5563', fontWeight: '600', marginTop: '8px' }}>
                <span>Shipping Charges:</span>
                <span>₹{shippingFee}</span>
              </div>
            )}

            {couponResult?.discount_amount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#16A34A', fontWeight: '700', marginTop: '6px' }}>
                <span>Coupon Discount:</span>
                <span>- ₹{couponResult.discount_amount}</span>
              </div>
            )}
          </div>

          {/* Shipping Form Fields */}
          {course.has_material && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '4px' }}>Your Name *</label>
                  <input
                    type="text"
                    value={shippingForm.name}
                    onChange={e => setShippingForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Full name"
                    style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '4px' }}>Mobile Number *</label>
                  <input
                    type="tel"
                    value={shippingForm.phone}
                    onChange={e => setShippingForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="10-digit mobile"
                    style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '4px' }}>Distribution Option</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div
                    onClick={() => setShippingForm(p => ({ ...p, deliveryType: 'pickup' }))}
                    style={{
                      border: '1.5px solid',
                      borderColor: shippingForm.deliveryType === 'pickup' ? '#FF9F1C' : '#E5E7EB',
                      background: shippingForm.deliveryType === 'pickup' ? '#FFFBEB' : '#FFF',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}
                  >
                    🏢 Self Pick Up
                    <div style={{ fontSize: '9px', fontWeight: '400', color: '#6B7280', marginTop: '2px' }}>Collect from temple</div>
                  </div>
                  <div
                    onClick={() => setShippingForm(p => ({ ...p, deliveryType: 'delivery' }))}
                    style={{
                      border: '1.5px solid',
                      borderColor: shippingForm.deliveryType === 'delivery' ? '#FF9F1C' : '#E5E7EB',
                      background: shippingForm.deliveryType === 'delivery' ? '#FFFBEB' : '#FFF',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}
                  >
                    🚚 Parcel Delivery
                    <div style={{ fontSize: '9px', fontWeight: '400', color: '#6B7280', marginTop: '2px' }}>Charges: ₹{course.shipping_charges}</div>
                  </div>
                </div>

                {shippingForm.deliveryType === 'pickup' && (
                  <div style={{ marginTop: '10px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#4B5563' }}>
                    📍 <strong>Pickup Address:</strong> NVCC temple in Katraj-Kondhwa, Pune (Mon-Sun 10 AM - 7 PM)
                  </div>
                )}
              </div>

              {shippingForm.deliveryType === 'delivery' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #E5E7EB', padding: '10px', borderRadius: '8px', background: '#FAFAFA' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#4B5563', marginBottom: '4px' }}>Full Shipping Address *</label>
                    <textarea
                      value={shippingForm.address}
                      onChange={e => setShippingForm(p => ({ ...p, address: e.target.value }))}
                      placeholder="Flat No, Building, Street, Area"
                      rows={2}
                      style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '12px', resize: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#4B5563', marginBottom: '4px' }}>City *</label>
                      <input
                        type="text"
                        value={shippingForm.city}
                        onChange={e => setShippingForm(p => ({ ...p, city: e.target.value }))}
                        placeholder="City"
                        style={{ width: '100%', padding: '6px 8px', border: '1.5px solid #E5E7EB', borderRadius: '6px', fontSize: '11px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#4B5563', marginBottom: '4px' }}>State *</label>
                      <input
                        type="text"
                        value={shippingForm.state}
                        onChange={e => setShippingForm(p => ({ ...p, state: e.target.value }))}
                        placeholder="State"
                        style={{ width: '100%', padding: '6px 8px', border: '1.5px solid #E5E7EB', borderRadius: '6px', fontSize: '11px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#4B5563', marginBottom: '4px' }}>Pincode *</label>
                      <input
                        type="text"
                        value={shippingForm.pincode}
                        onChange={e => setShippingForm(p => ({ ...p, pincode: e.target.value }))}
                        placeholder="6 digits"
                        style={{ width: '100%', padding: '6px 8px', border: '1.5px solid #E5E7EB', borderRadius: '6px', fontSize: '11px' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Coupon Code Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Have a Coupon Code?</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={coupon}
                onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponResult(null); }}
                placeholder="Enter code"
                style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', letterSpacing: '1px', fontFamily: 'monospace' }}
              />
              <button onClick={applyCoupon} disabled={applyingCoupon || !coupon.trim()} style={{ padding: '10px 18px', background: '#F3F4F6', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', color: '#374151' }}>
                {applyingCoupon ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Apply'}
              </button>
            </div>
            {couponResult?.error && <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '6px', marginBottom: 0 }}>{couponResult.error}</p>}
            {couponResult?.success && <p style={{ color: '#16A34A', fontSize: '12px', marginTop: '6px', marginBottom: 0 }}>✓ Coupon applied! {couponResult.description}</p>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderTop: '1px solid #E5E7EB', paddingTop: '14px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>Total Amount:</span>
              <h4 style={{ fontSize: '24px', fontWeight: '800', color: '#1A1B4B', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                ₹{totalRegistrationPrice}
              </h4>
            </div>
            <button 
              onClick={handleEnroll} 
              disabled={enrolling} 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #FF9F1C, #E07A5F)', color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 20px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', boxShadow: '0 4px 12px rgba(255,159,28,0.25)' }}
            >
              {enrolling ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</> : totalRegistrationPrice === 0 ? 'Enroll for Free' : `Pay ₹${totalRegistrationPrice}`}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F2F5' }}>
      <Loader2 size={32} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!course) return null;

  // ── Special Course: render custom page builder layout ──────────────
  if (course.is_special && course.custom_layout?.blocks?.length > 0) {
    return (
      <>
        <Navbar />
        <SpecialCourseLanding
          course={course}
          user={user}
          isEnrolled={isEnrolled}
          enrolling={enrolling}
          onEnroll={handleEnrollClick}
          coupon={coupon}
          setCoupon={setCoupon}
          couponResult={couponResult}
          setCouponResult={setCouponResult}
          applyingCoupon={applyingCoupon}
          onApplyCoupon={applyCoupon}
          slug={slug}
        />
        {renderCheckoutModal()}
      </>
    );
  }

  const discountedPrice = couponResult?.final_price ?? null;
  const displayPrice = discountedPrice !== null ? discountedPrice : course.price;
  const totalLessons = course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;

  const instructor = course.custom_layout?.metadata?.instructor || {
    name: 'Radheshyam Das',
    title: 'Founding Director, VOICE & Renowned Vedic Educator',
    bio: "Radheshyam Das holds a Master's degree from IIT Bombay and is a celebrated author, speaker, and spiritual mentor. Having dedicated over three decades to studying and teaching Vedic literature, he has inspired tens of thousands of youths and professionals across the globe to lead balanced, value-based, and spiritually enriched lives.",
    initials: 'RD'
  };

  const faqs = course.custom_layout?.metadata?.faq || [
    { q: 'Who is this course for?', a: 'This course is designed for students, professionals, and seekers of all backgrounds who want to deepen their understanding of life, spirituality, and personal leadership based on Vedic principles.' },
    { q: 'Is there any certificate provided?', a: 'Yes! For courses that have certificates enabled, you will receive a verifiable digital certificate once you complete all modules and pass the course quizzes.' },
    { q: 'How long will I have access to the course?', a: 'You will get lifetime access to the course content. You can learn at your own pace and revisit lessons whenever you like.' }
  ];

  const highlights = course.custom_layout?.metadata?.highlights || [
    { title: 'Timeless Vedic Wisdom', text: 'Connect with centuries-old philosophical concepts structured for contemporary life challenges.' },
    { title: 'Practical Mindfulness', text: 'Translate profound philosophical wisdom into actionable daily meditation and lifestyle habits.' },
    { title: 'Interactive Quizzes', text: 'Validate your understanding after key lessons with interactive self-assessment questions.' },
    { title: 'Global Community', text: 'Engage in thought-provoking discussions, share insights, and connect with global seekers.' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5' }}>
      <Navbar />
      {/* Hero */}
      <div style={styles.hero}>
        <div className="hero-inner" style={styles.heroInner}>
          <div style={styles.heroLeft}>
            <Link href="/courses" style={styles.backLink}>← All Courses</Link>
            <span style={styles.category}>{course.category}</span>
            <h1 style={styles.title}>{course.title}</h1>
            <p style={styles.subtitle}>
              {course.short_description || "Embark on a transformative journey of self-discovery and spiritual growth. Gain profound insights from timeless Vedic teachings adapted for the modern world."}
            </p>

            <div style={styles.metaRow}>
              {course.level && <span style={styles.metaBadge}>{course.level}</span>}
              {totalLessons > 0 ? (
                <>
                  <span style={styles.metaItem}><BookOpen size={14} /> {totalLessons} lessons</span>
                  {course.total_duration_seconds > 0 && <span style={styles.metaItem}><Clock size={14} /> {formatDuration(course.total_duration_seconds)}</span>}
                </>
              ) : (
                <>
                  <span style={styles.metaItem}><Clock size={14} /> Self-Paced Learning</span>
                  <span style={styles.metaItem}><Users size={14} /> Global Community Access</span>
                </>
              )}
              {course.has_certificate && <span style={styles.metaItem}><Award size={14} /> Certificate</span>}
            </div>
          </div>

          {/* Enroll card */}
          <div className="enroll-card" style={styles.enrollCard}>
            {course.thumbnail_url && (
              <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden' }}>
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
                  style={{ 
                    position: 'relative',
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    zIndex: 1
                  }} 
                />
              </div>
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
                <button onClick={handleEnrollClick} disabled={enrolling} style={styles.enrollBtn}>
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

        {/* What You Will Learn */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>What You Will Learn</h2>
          <div className="highlights-grid">
            {highlights.map((h, i) => (
              <div key={i} style={styles.highlightCard} className="highlight-card-hover">
                <div style={styles.highlightIconWrapper}>
                  {i === 0 ? <BookOpen size={18} color="#FF9F1C" /> :
                   i === 1 ? <Clock size={18} color="#FF9F1C" /> :
                   i === 2 ? <Award size={18} color="#FF9F1C" /> :
                             <Users size={18} color="#FF9F1C" />}
                </div>
                <div>
                  <h3 style={styles.highlightTitle}>{h.title}</h3>
                  <p style={styles.highlightText}>{h.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reference Study Materials Included */}
        {course.has_material && course.materials && course.materials.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Reference Study Materials Included</h2>
            <p style={{ color: '#4B5563', fontSize: '14px', marginBottom: '20px', marginTop: '-10px' }}>
              These physical study materials/books are fully included with the course fee. During checkout, you can select self pick up or home delivery.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {course.materials.map((mat, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid rgba(26,27,75,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  {mat.image_url ? (
                    <img src={formatImageUrl(mat.image_url)} alt={mat.title} style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0, border: '1px solid #E5E7EB' }} />
                  ) : (
                    <div style={{ width: '80px', height: '100px', borderRadius: '6px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BookOpen size={24} color="#9CA3AF" />
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1A1B4B', margin: '0 0 4px 0', fontFamily: 'Outfit, sans-serif' }}>{mat.title}</h3>
                    {mat.description && <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, lineHeight: '1.4' }}>{mat.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Curriculum */}
        {course.modules?.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Course Curriculum</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Premium Video / Document Preview Modal */}
              {previewLesson && (
                <div style={styles.modalOverlay} onClick={() => setPreviewLesson(null)}>
                  <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                    <div style={styles.modalHeader}>
                      <div style={styles.modalTitleArea}>
                        <span style={styles.modalTag}>
                          {previewLesson.type === 'youtube' 
                            ? 'Free Video Preview' 
                            : previewLesson.type === 'gdrive' 
                              ? 'Document Preview' 
                              : 'Text Preview'}
                        </span>
                        <h3 style={styles.modalTitle}>{previewLesson.title}</h3>
                      </div>
                      <button onClick={() => setPreviewLesson(null)} style={styles.modalCloseBtn}>
                        &times;
                      </button>
                    </div>
                    
                    {previewLesson.type === 'youtube' && (
                      <div style={styles.videoWrapper}>
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${getYouTubeId(previewLesson.content_url)}?autoplay=1&rel=0`}
                          title={previewLesson.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          style={styles.iframe}
                        />
                      </div>
                    )}
                    
                    {previewLesson.type === 'gdrive' && (
                      <div style={styles.videoWrapper}>
                        <iframe
                          src={getGDriveEmbedUrl(previewLesson.content_url)}
                          title={previewLesson.title}
                          frameBorder="0"
                          allow="autoplay"
                          style={styles.iframe}
                        />
                      </div>
                    )}
                    
                    {previewLesson.type === 'text' && (
                      <div style={styles.textContent}>
                        {previewLesson.content_text || 'No text content available for this lesson preview.'}
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                      {mod.lessons.map(lesson => {
                        const isClickable = lesson.is_free_preview;
                        return (
                          <div 
                            key={lesson.id} 
                            style={{
                              ...styles.lessonRow,
                              ...(isClickable ? { cursor: 'pointer' } : {})
                            }}
                            onClick={() => {
                              if (isClickable) {
                                setPreviewLesson(lesson);
                              }
                            }}
                            className={isClickable ? 'free-lesson-row' : ''}
                          >
                            <div style={styles.lessonLeft}>
                              {lesson.type === 'youtube' ? (
                                <Play size={14} color="#6B7280" style={{ marginTop: '3px', flexShrink: 0 }} />
                              ) : (
                                <FileText size={14} color="#6B7280" style={{ marginTop: '3px', flexShrink: 0 }} />
                              )}
                              <span style={styles.lessonTitle}>{lesson.title}</span>
                              {lesson.is_free_preview && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewLesson(lesson);
                                  }} 
                                  style={styles.freeBadgeBtn}
                                  className="preview-badge"
                                >
                                  Preview
                                </button>
                              )}
                            </div>
                            {!lesson.is_free_preview && !isEnrolled && (
                              <Lock size={12} color="#D1D5DB" style={{ marginTop: '4px', flexShrink: 0 }} />
                            )}
                            {lesson.duration_seconds > 0 && (
                              <span style={styles.lessonDuration}>{formatDuration(lesson.duration_seconds)}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meet Your Instructor */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Meet Your Instructor</h2>
          <div className="instructor-card-layout">
            <div style={styles.instructorAvatar}>
              <span style={styles.instructorInitials}>{instructor.initials || 'RD'}</span>
            </div>
            <div style={styles.instructorInfo}>
              <h3 style={styles.instructorName}>{instructor.name}</h3>
              <p style={styles.instructorTitle}>{instructor.title}</p>
              <p style={styles.instructorBio}>{instructor.bio}</p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div style={styles.faqList}>
            {faqs.map((faq, i) => (
              <div key={i} style={styles.faqItem}>
                <h3 style={styles.faqQuestion}>{faq.q}</h3>
                <p style={styles.faqAnswer}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {renderCheckoutModal()}

      <script src="https://checkout.razorpay.com/v1/checkout.js" />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        
        /* Interactive free lesson rows */
        .free-lesson-row {
          transition: all 0.2s ease !important;
        }
        .free-lesson-row:hover {
          background-color: #EEF2FF !important; /* light indigo */
        }
        
        /* Preview Badge hover */
        .preview-badge {
          background-color: #DCFCE7 !important;
          color: #16A34A !important;
          transition: all 0.2s ease !important;
        }
        .preview-badge:hover {
          background-color: #BBF7D0 !important;
          transform: scale(1.05);
        }

        /* Grid and Flex Layout responsiveness */
        .hero-inner {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 40px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .hero-inner {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .enroll-card {
            width: 100% !important;
            max-width: 450px !important;
            margin: 0 auto !important;
          }
        }

        .highlights-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 12px;
        }
        @media (max-width: 640px) {
          .highlights-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .instructor-card-layout {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }
        @media (max-width: 600px) {
          .instructor-card-layout {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
        }
        
        /* Interactive animations for highlight cards */
        .highlight-card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .highlight-card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
          border-color: rgba(255,159,28,0.3) !important;
        }
      `}</style>
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
  lessonRow: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 18px', borderBottom: '1px solid #F3F4F6' },
  lessonLeft: { flex: 1, display: 'flex', alignItems: 'flex-start', gap: '10px' },
  lessonTitle: { fontSize: '13px', color: '#374151', flex: 1, lineHeight: '1.5' },
  lessonDuration: {
    fontSize: '11px',
    color: '#6B7280',
    background: '#F3F4F6',
    padding: '3px 8px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    marginTop: '2px',
    display: 'inline-block',
    fontWeight: '500',
  },
  freeBadgeBtn: {
    background: '#DCFCE7',
    color: '#16A34A',
    fontSize: '10px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '9999px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginLeft: '8px',
  },
  textContent: {
    padding: '28px',
    maxHeight: '450px',
    overflowY: 'auto',
    color: '#374151',
    fontSize: '15px',
    lineHeight: '1.8',
    whiteSpace: 'pre-wrap',
    background: '#F9FAFB',
    fontFamily: 'inherit',
  },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modalContent: { background: '#fff', width: '100%', maxWidth: '700px', borderRadius: '12px', overflow: 'hidden' },
  checkoutModalBox: { background: '#FFF', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 1001, animation: 'slideUp 0.25s ease' },
  modalHeader: { padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E5E7EB' },
  modalTag: { fontSize: '10px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase' },
  modalTitle: { margin: '4px 0 0', fontSize: '18px' },
  modalCloseBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6B7280' },
  videoWrapper: { position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' },
  iframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  highlightCard: {
    display: 'flex',
    gap: '16px',
    padding: '16px',
    background: '#F9FAFB',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    cursor: 'default',
  },
  highlightIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    background: 'rgba(255,159,28,0.1)',
    borderRadius: '8px',
    flexShrink: 0,
  },
  highlightTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1A1B4B',
    marginBottom: '4px',
    fontFamily: 'Outfit, sans-serif',
  },
  highlightText: {
    fontSize: '13px',
    color: '#6B7280',
    lineHeight: '1.5',
    margin: 0,
  },
  instructorAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1A1B4B 0%, #2D1B69 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(26,27,75,0.15)',
    flexShrink: 0,
  },
  instructorInitials: {
    color: '#FFFFFF',
    fontSize: '28px',
    fontWeight: '700',
    fontFamily: 'Outfit, sans-serif',
    letterSpacing: '1px',
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1A1B4B',
    margin: '0 0 4px 0',
    fontFamily: 'Outfit, sans-serif',
  },
  instructorTitle: {
    fontSize: '13px',
    color: '#FF9F1C',
    fontWeight: '600',
    margin: '0 0 12px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  instructorBio: {
    fontSize: '14px',
    color: '#4B5563',
    lineHeight: '1.7',
    margin: 0,
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  faqItem: {
    paddingBottom: '16px',
    borderBottom: '1px solid #F3F4F6',
  },
  faqQuestion: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1A1B4B',
    marginBottom: '6px',
    fontFamily: 'Outfit, sans-serif',
  },
  faqAnswer: {
    fontSize: '13px',
    color: '#4B5563',
    lineHeight: '1.6',
    margin: 0,
  },
};
