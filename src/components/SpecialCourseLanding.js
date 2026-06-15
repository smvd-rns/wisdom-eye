'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ChevronDown, ChevronUp, Play, FileText, Lock, CheckCircle, 
  Loader2, Star, Users, BookOpen, Clock, Award, Quote,
  ChevronLeft, ChevronRight, ExternalLink, BookOpenCheck
} from 'lucide-react';
import { formatImageUrl } from '@/lib/utils';

// Google Drive uploaded poster images
const POSTER_IMAGES = [
  'https://lh3.googleusercontent.com/d/1Bpk-lc_U4E2Gxo8_9b-43X-fHbrYWwrU',
  'https://lh3.googleusercontent.com/d/1MN4z91XjyCUFfuOPKDCeBse8TwAfJRVg',
  'https://lh3.googleusercontent.com/d/1O3fWg2DJQe9OjftyazsN51GsieQlFHTI',
  'https://lh3.googleusercontent.com/d/11w6VyjYDU2nnpu2dCZxmEI1J6CIknPd2',
  'https://lh3.googleusercontent.com/d/1TyVI1qZG_H-_sV4AMjx4s0KMK9uL9OZ9',
  'https://lh3.googleusercontent.com/d/1vLIoTs884mJS5e_X0TElAwSFqtCFPzxt',
  'https://lh3.googleusercontent.com/d/1Rf589EQudojyzXvW-VoslX9-85tlcZYY',
  'https://lh3.googleusercontent.com/d/1xiif-If20kRnW9Y_uLyu97L9dNLAOi1d',
  'https://lh3.googleusercontent.com/d/1bMzO5xj3RjhY-yzWvblG1TIHSklYEjsw',
  'https://lh3.googleusercontent.com/d/1bj0d9uI_GxIiOxnWDZ8NGRkqxd8J-Jrt',
  'https://lh3.googleusercontent.com/d/10mK9cOKdMWbFdY6-54eMf8k8NttVQvqT',
  'https://lh3.googleusercontent.com/d/1V2dkDXRKYxUnhr6svJku7bFeqsvDEgzE',
  'https://lh3.googleusercontent.com/d/1EiBnGGZEEbhHbEAtKrkWaxVj2rjssowf',
  'https://lh3.googleusercontent.com/d/1gh3Xk7FzDUldPCd99ZtrE9PH6H93guN_',
  'https://lh3.googleusercontent.com/d/1CXURMsM6guqQh9zT_RxeNOJGZbGBrI-3'
];

const FEATURED_BOOKS = [
  {
    id: 1,
    title: 'The Happiness Paradox (SS Series - Book 1)',
    price: '₹170.00',
    url: 'https://voicepublication.in/products/the-happiness-paradox',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/TheHappinessParadox-cover.jpg?v=1780304890'
  },
  {
    id: 3,
    title: 'Decoding the Self (CC Series - Book 1)',
    price: '₹200.00',
    url: 'https://voicepublication.in/products/decoding-the-self',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/TCCDecodingtheself-cover.jpg?v=1780305591'
  },
  {
    id: 5,
    title: 'Your Best Friend',
    price: '₹280.00',
    url: 'https://voicepublication.in/products/your-best-friend',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/YourBestFriend-front.jpg?v=1764746523'
  },
  {
    id: 6,
    title: 'Wisdom Eye (Course 1) - Laying the Foundation for Success',
    price: '₹150.00',
    originalPrice: '₹200.00',
    url: 'https://voicepublication.in/products/wisdom-eye',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/WisdomEye-cover.jpg?v=1780304483'
  },
  {
    id: 12,
    title: 'GAME Positive Thinker (Course 1, 2, 4 & 6)',
    price: '₹120.00 - ₹280.00',
    url: 'https://voicepublication.in/products/game-positive-thinker-course-1-2-6',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/GAME-PT-12.png?v=1764741397'
  },
  {
    id: 14,
    title: 'Discover Yourself',
    price: '₹160.00',
    url: 'https://voicepublication.in/products/discover-yourself',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/DYS-front.jpg?v=1764332893'
  },
  {
    id: 16,
    title: 'Art of Smart Work',
    price: '₹70.00',
    url: 'https://voicepublication.in/products/art-of-smart-work',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/ArtofSmartWork-Front.jpg?v=1756533599'
  },
  {
    id: 4,
    title: 'Your Secret Journey',
    price: '₹200.00',
    url: 'https://voicepublication.in/products/your-secret-journey',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/YSJ-front.jpg?v=1764746566'
  }
];

const COMPANIES = [
  { name: 'Amazon', logo: 'https://lh3.googleusercontent.com/d/1DF9uSwnpkjGQ9OXDNGDR8B-dCiuJaPX4' },
  { name: 'Infosys', logo: 'https://lh3.googleusercontent.com/d/1oFHK0JU99lHxpGuqwiXqox-Nm6BhFxqx' },
  { name: 'Microsoft', logo: 'https://lh3.googleusercontent.com/d/1Sr0qsDkIeZMEw3u2oTZh_RM8qbsFMhFs' },
  { name: 'Copart', logo: 'https://lh3.googleusercontent.com/d/1iL1K0SP21l_qL6Kk6ffnLIadsd-jZuwY' },
  { name: 'Cognizant', logo: 'https://lh3.googleusercontent.com/d/1vUpMGwycvntOjh3tAgaeO7lMLqB6SdJ_' },
  { name: 'Tata Technologies', logo: 'https://lh3.googleusercontent.com/d/1-3jI0h1ee7fKUs_P2LB_xAqrqSKm5ZNE' },
  { name: 'Bank of America', logo: 'https://lh3.googleusercontent.com/d/1OEC-o5xewzCsEU-MzH2Hs07_I6EHpfTI' },
  { name: 'Deutsche Bank', logo: 'https://lh3.googleusercontent.com/d/13i_fpLr15wL6Y3LeTwzMjDftxMR-Y1WX' },
  { name: 'Persistent', logo: 'https://lh3.googleusercontent.com/d/1-9Qxn6bc__GW5b3v3GEQdU4EukG9THUK' }
];

/* ─────────────────────────────────────────────────────────────────
   SpecialCourseLanding
   Renders a course landing page from a custom_layout JSON blob.
   Each block in layout.blocks[] is passed to renderBlock().
   ───────────────────────────────────────────────────────────────── */
export default function SpecialCourseLanding({
  course,
  user,
  isEnrolled,
  enrolling,
  onEnroll,
  coupon,
  setCoupon,
  couponResult,
  setCouponResult,
  applyingCoupon,
  onApplyCoupon,
  slug,
}) {
  const layout = course.custom_layout;
  const blocks = layout?.blocks || course.blocks || [];

  // Accordion state for curriculum + FAQ blocks
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedFaqs, setExpandedFaqs] = useState({});
  const [previewLesson, setPreviewLesson] = useState(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [timeLeft, setTimeLeft] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  // System blocks homepage states
  const [homeConfig, setHomeConfig] = useState(null);
  const [heroActiveSlide, setHeroActiveSlide] = useState(0);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [ytLoading, setYtLoading] = useState(true);

  const credsScrollRef = useRef(null);

  useEffect(() => {
    const el = credsScrollRef.current;
    if (!el) return;

    let animationFrameId;
    let isMoving = true;
    let lastTime = 0;
    const speed = 0.6; // slow moving speed in pixels per frame

    const scroll = (timestamp) => {
      if (window.innerWidth > 576) {
        lastTime = timestamp;
        animationFrameId = requestAnimationFrame(scroll);
        return;
      }

      if (!lastTime) lastTime = timestamp;
      
      if (isMoving) {
        el.scrollLeft -= speed;
        // Loop seamlessly using half scroll width (since creds are duplicated)
        if (el.scrollLeft <= 0) {
          el.scrollLeft += el.scrollWidth / 2;
        }
      }
      
      lastTime = timestamp;
      animationFrameId = requestAnimationFrame(scroll);
    };

    const handleTouchStart = () => { isMoving = false; };
    const handleTouchEnd = () => { isMoving = true; lastTime = 0; };
    const handleMouseDown = () => { isMoving = false; };
    const handleMouseUp = () => { isMoving = true; lastTime = 0; };
    const handleMouseEnter = () => { isMoving = false; };
    const handleMouseLeave = () => { isMoving = true; lastTime = 0; };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('mousedown', handleMouseDown, { passive: true });
    el.addEventListener('mouseup', handleMouseUp, { passive: true });
    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('mousedown', handleMouseDown);
      el.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [homeConfig]);

  const booksScrollRef = useRef(null);

  useEffect(() => {
    const el = booksScrollRef.current;
    if (!el) return;

    let animationFrameId;
    let isMoving = true;
    let lastTime = 0;
    const speed = 0.5; // slow moving speed in pixels per frame

    const scroll = (timestamp) => {
      if (window.innerWidth > 576) {
        lastTime = timestamp;
        animationFrameId = requestAnimationFrame(scroll);
        return;
      }

      if (!lastTime) lastTime = timestamp;
      
      if (isMoving) {
        el.scrollLeft -= speed;
        if (el.scrollLeft <= 0) {
          el.scrollLeft += el.scrollWidth / 2;
        }
      }
      
      lastTime = timestamp;
      animationFrameId = requestAnimationFrame(scroll);
    };

    const handleTouchStart = () => { isMoving = false; };
    const handleTouchEnd = () => { isMoving = true; lastTime = 0; };
    const handleMouseDown = () => { isMoving = false; };
    const handleMouseUp = () => { isMoving = true; lastTime = 0; };
    const handleMouseEnter = () => { isMoving = false; };
    const handleMouseLeave = () => { isMoving = true; lastTime = 0; };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('mousedown', handleMouseDown, { passive: true });
    el.addEventListener('mouseup', handleMouseUp, { passive: true });
    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('mousedown', handleMouseDown);
      el.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [homeConfig]);

  useEffect(() => {
    const hasSystem = blocks.some(b => b.type && b.type.startsWith('system_')) || 
      (blocks.some(b => b.type === '__row__' && b.columns.some(c => c.block.type && c.block.type.startsWith('system_'))));
    if (!hasSystem) return;

    fetch('/api/home-config')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setHomeConfig(data);
      })
      .catch(err => console.error(err));

    async function fetchVideos() {
      try {
        const res = await fetch('/api/youtube');
        if (res.ok) {
          const data = await res.json();
          setYoutubeVideos(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setYtLoading(false);
      }
    }
    fetchVideos();
  }, [blocks]);

  // Sync active video when youtube videos and config are loaded
  useEffect(() => {
    if (youtubeVideos.length > 0) {
      const pinned = homeConfig?.pinnedVideos || [];
      const pinnedList = pinned.map(id => youtubeVideos.find(v => v.id === id)).filter(Boolean);
      const rest = youtubeVideos.filter(v => !pinned.includes(v.id));
      const ordered = [...pinnedList, ...rest];
      if (ordered.length > 0) {
        setActiveVideo(ordered[0]);
      }
    }
  }, [youtubeVideos, homeConfig]);

  // Hero auto-slider
  useEffect(() => {
    const heroSliderBlock = blocks.find(b => b.type === 'system_hero_slides');
    if (!heroSliderBlock) return;

    const slidesCount = heroSliderBlock.props?.heroSlides?.length > 0 ? heroSliderBlock.props.heroSlides.length : (homeConfig?.heroSlides?.length || POSTER_IMAGES.length);
    const speed = heroSliderBlock.props?.autoplayInterval !== undefined ? Number(heroSliderBlock.props.autoplayInterval) : 5000;
    if (speed <= 0) return;

    const timer = setInterval(() => {
      setHeroActiveSlide(prev => (prev + 1) % slidesCount);
    }, speed);
    return () => clearInterval(timer);
  }, [homeConfig, blocks]);

  // Countdown timer engine
  useEffect(() => {
    const countdownBlocks = blocks.filter(b => b.type === 'countdown');
    if (!countdownBlocks.length) return;

    const tick = () => {
      const now = Date.now();
      const updates = {};
      countdownBlocks.forEach(b => {
        const target = new Date(b.props.targetDate).getTime();
        const diff = Math.max(0, target - now);
        updates[b.id] = {
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          mins: Math.floor((diff % 3600000) / 60000),
          secs: Math.floor((diff % 60000) / 1000),
          done: diff === 0,
        };
      });
      setTimeLeft(prev => ({ ...prev, ...updates }));
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  // Testimonial auto-slider
  useEffect(() => {
    const testimonialBlock = blocks.find(b => b.type === 'testimonials');
    const speed = testimonialBlock?.props?.autoplayInterval !== undefined ? Number(testimonialBlock.props.autoplayInterval) : 5000;
    if (speed <= 0) return;

    const interval = setInterval(() => {
      setActiveTestimonial(prev => prev + 1);
    }, speed);
    return () => clearInterval(interval);
  }, [blocks]);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return (m && m[2].length === 11) ? m[2] : null;
  };

  const discountedPrice = couponResult?.final_price ?? null;
  const displayPrice = discountedPrice !== null ? discountedPrice : course.price;

  const formatDuration = (secs) => {
    if (!secs) return null;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  };

  // ─── Block Renderers ─────────────────────────────────────────────

  function renderHero(block) {
    const p = block.props;
    const bgStyle = p.backgroundImage
      ? { backgroundImage: `url(${p.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { background: p.background || '#1A1B4B' };

    const isSplit = p.layoutMode === 'split';

    const renderTextContent = () => (
      <>
        {p.badge && (
          <span style={{ display: 'inline-block', background: 'rgba(255,159,28,0.2)', color: '#FF9F1C', padding: '5px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {p.badge}
          </span>
        )}
        <h1 style={{ fontSize: `${p.titleSize || 48}px`, fontWeight: '900', color: p.textColor || '#fff', marginBottom: '16px', fontFamily: 'Outfit, sans-serif', lineHeight: 1.1 }}>
          {p.title || 'Course Title'}
        </h1>
        {p.subtitle && (
          <p style={{ fontSize: `${p.subtitleSize || 18}px`, color: p.subtitleColor || 'rgba(255,255,255,0.8)', marginBottom: '32px', maxWidth: '650px', margin: p.align === 'center' ? '0 auto 32px' : '0 0 32px', lineHeight: 1.6 }}>
            {p.subtitle}
          </p>
        )}
        {p.showStats && (
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: p.align === 'center' ? 'center' : 'flex-start', marginBottom: '32px' }}>
            {[
              { icon: <Users size={14}/>, label: `${p.studentsCount || '5,000'}+ Students` },
              { icon: <Star size={14} fill="#FF9F1C" color="#FF9F1C"/>, label: `${p.rating || '4.9'} Rating` },
              { icon: <Clock size={14}/>, label: p.duration || 'Self-paced' },
            ].map((s, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: '500' }}>
                {s.icon} {s.label}
              </span>
            ))}
          </div>
        )}
        {p.ctaText && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: p.align === 'center' ? 'center' : 'flex-start' }}>
            <button
              onClick={onEnroll}
              disabled={enrolling}
              style={{ background: p.ctaColor || 'linear-gradient(135deg, #FF9F1C, #E07A5F)', color: p.ctaTextColor || '#fff', border: 'none', borderRadius: '12px', padding: '16px 36px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', boxShadow: '0 8px 24px rgba(255,159,28,0.4)' }}
            >
              {isEnrolled ? 'Continue Learning →' : (p.ctaText || 'Enroll Now')}
            </button>
            {p.secondaryCta && (
              <button style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '12px', padding: '14px 28px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', backdropFilter: 'blur(8px)' }}>
                {p.secondaryCta}
              </button>
            )}
          </div>
        )}
      </>
    );

    return (
      <div key={block.id} style={{ ...bgStyle, padding: `${p.paddingY || 80}px 24px`, position: 'relative', overflow: 'hidden' }}>
        {p.backgroundImage && (
          <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${p.overlayOpacity ?? 0.5})` }} />
        )}
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
          {isSplit ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', alignItems: 'center' }} className="special-two-col">
              <div>
                {renderTextContent()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                {p.rightAssetType === 'image' && p.rightImage && (() => {
                  const errorKey = `${block.id}-hero-right`;
                  if (imageErrors[errorKey]) {
                    return (
                      <div style={{ padding: '24px', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '16px', textAlign: 'center', width: '100%', maxWidth: '440px' }}>
                        <span style={{ fontSize: '24px' }}>⚠️</span>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#fff', margin: '8px 0 4px' }}>Image failed to load</p>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Please check Google Drive link sharing permissions.</p>
                      </div>
                    );
                  }
                  return (
                    <img
                      src={formatImageUrl(p.rightImage)}
                      alt={p.title}
                      onError={() => setImageErrors(prev => ({ ...prev, [errorKey]: true }))}
                      style={{
                        width: '100%',
                        maxWidth: '440px',
                        height: p.rightImageHeight ? `${p.rightImageHeight}px` : '400px',
                        objectFit: p.rightImageFit || 'cover',
                        borderRadius: '16px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    />
                  );
                })()}
                {p.rightAssetType === 'video' && p.rightVideoUrl && (
                  <div style={{ width: '100%', maxWidth: '440px', position: 'relative', paddingTop: '56.25%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${getYouTubeId(p.rightVideoUrl)}?rel=0`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    />
                  </div>
                )}
                {/* Fallback to course thumbnail if no custom image is specified */}
                {p.rightAssetType === 'image' && !p.rightImage && course.thumbnail_url && (
                  <img
                    src={formatImageUrl(course.thumbnail_url)}
                    alt={p.title}
                    style={{
                      width: '100%',
                      maxWidth: '440px',
                      height: p.rightImageHeight ? `${p.rightImageHeight}px` : '400px',
                      objectFit: p.rightImageFit || 'cover',
                      borderRadius: '16px',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: p.align || 'left' }}>
              {renderTextContent()}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderText(block, isNested = false) {
    const p = block.props;
    const padding = isNested ? '24px' : `${p.paddingY || 48}px 24px`;
    const borderRadius = isNested ? '12px' : '0px';
    const border = isNested ? '1px solid rgba(26,27,75,0.06)' : 'none';
    const boxShadow = isNested ? '0 4px 12px rgba(0,0,0,0.03)' : 'none';
    return (
      <div key={block.id} style={{ background: p.background || '#fff', padding, borderRadius, border, boxShadow, height: isNested ? '100%' : undefined, boxSizing: 'border-box', display: isNested ? 'flex' : undefined, flexDirection: isNested ? 'column' : undefined, justifyContent: isNested ? 'center' : undefined }}>
        <div style={{ maxWidth: p.maxWidth || '800px', margin: '0 auto', textAlign: p.align || 'left', width: '100%' }}>
          {p.eyebrow && (
            <p style={{ fontSize: '12px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
              {p.eyebrow}
            </p>
          )}
          {p.heading && (
            <h2 style={{ fontSize: `${p.headingSize || (isNested ? 22 : 32)}px`, fontWeight: '800', color: p.headingColor || '#1A1B4B', marginBottom: '16px', fontFamily: 'Outfit, sans-serif', lineHeight: 1.2 }}>
              {p.heading}
            </h2>
          )}
          {p.content && (
            <div style={{ fontSize: `${p.fontSize || 16}px`, color: p.textColor || '#4B5563', lineHeight: p.lineHeight || 1.8, whiteSpace: 'pre-wrap' }}>
              {p.content}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderVideo(block, isNested = false) {
    const p = block.props;
    const ytId = getYouTubeId(p.url);
    if (!ytId) return null;
    const padding = isNested ? '24px' : `${p.paddingY || 48}px 24px`;
    const borderRadius = isNested ? '12px' : '0px';
    const border = isNested ? '1px solid rgba(26,27,75,0.06)' : 'none';
    const boxShadow = isNested ? '0 4px 12px rgba(0,0,0,0.03)' : 'none';
    return (
      <div key={block.id} style={{ background: p.background || '#0F0F0F', padding, borderRadius, border, boxShadow, height: isNested ? '100%' : undefined, boxSizing: 'border-box', display: isNested ? 'flex' : undefined, flexDirection: isNested ? 'column' : undefined, justifyContent: isNested ? 'center' : undefined }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', width: '100%' }}>
          {p.title && (
            <h2 style={{ fontSize: isNested ? '20px' : '28px', fontWeight: '800', color: '#fff', marginBottom: '24px', textAlign: 'center', fontFamily: 'Outfit, sans-serif' }}>
              {p.title}
            </h2>
          )}
          <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0`}
              title={p.title || 'Course Video'}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </div>
    );
  }

  function renderImage(block) {
    const p = block.props;
    if (!p.src) return null;

    const errorKey = `${block.id}-img`;
    if (imageErrors[errorKey]) {
      return (
        <div key={block.id} style={{ background: p.background || '#fff', padding: `${p.paddingY || 32}px 24px` }}>
          <div style={{ maxWidth: p.maxWidth || '900px', margin: '0 auto', padding: '32px', background: '#F9FAFB', border: '1px dashed #D1D5DB', borderRadius: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '8px 0 4px' }}>Image failed to load</p>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Please make sure your Google Drive link is set to <strong>"Anyone with the link can view"</strong>.</p>
          </div>
        </div>
      );
    }

    return (
      <div key={block.id} style={{ background: p.background || '#fff', padding: `${p.paddingY || 32}px 24px` }}>
        <div style={{ maxWidth: p.maxWidth || '900px', margin: '0 auto', textAlign: 'center' }}>
          <img
            src={formatImageUrl(p.src)}
            alt={p.alt || ''}
            onError={() => setImageErrors(prev => ({ ...prev, [errorKey]: true }))}
            style={{ width: '100%', maxHeight: `${p.maxHeight || 500}px`, objectFit: p.fit || 'contain', borderRadius: `${p.borderRadius || 16}px`, boxShadow: p.shadow ? '0 16px 48px rgba(0,0,0,0.15)' : 'none' }}
          />
          {p.caption && (
            <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '10px', fontStyle: 'italic' }}>{p.caption}</p>
          )}
        </div>
      </div>
    );
  }

  function renderFeatures(block) {
    const p = block.props;
    const features = p.items || [];
    const cols = p.columns || 3;

    return (
      <div key={block.id} style={{ background: p.background || '#F8F9FE', padding: `${p.paddingY || 60}px 24px` }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {p.heading && (
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              {p.eyebrow && <p style={{ fontSize: '12px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>{p.eyebrow}</p>}
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: p.headingColor || '#1A1B4B', fontFamily: 'Outfit, sans-serif' }}>{p.heading}</h2>
              {p.subheading && <p style={{ fontSize: '16px', color: '#6B7280', marginTop: '10px', maxWidth: '560px', margin: '10px auto 0' }}>{p.subheading}</p>}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '20px' }}>
            {features.map((feat, i) => (
              <div key={i} style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: p.iconPosition === 'top' ? 'column' : 'row',
                gap: '16px',
                alignItems: p.iconPosition === 'top' ? 'flex-start' : 'flex-start',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              className="feature-card-hover">
                {feat.icon && (
                  <div style={{ fontSize: '28px', flexShrink: 0, width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${p.accentColor || '#FF9F1C'}18`, borderRadius: '12px' }}>
                    {feat.icon}
                  </div>
                )}
                <div>
                  {feat.title && <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A1B4B', marginBottom: '6px', fontFamily: 'Outfit, sans-serif' }}>{feat.title}</h3>}
                  {feat.text && <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>{feat.text}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderStats(block) {
    const p = block.props;
    const items = p.items || [];
    return (
      <div key={block.id} style={{ background: p.background || '#1A1B4B', padding: `${p.paddingY || 48}px 24px` }}>
        <div className="special-stats" style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: `repeat(${items.length || 4}, 1fr)`, gap: '24px', textAlign: 'center' }}>
          {items.map((item, i) => (
            <div key={i}>
              <div style={{ fontSize: '42px', fontWeight: '900', color: p.accentColor || '#FF9F1C', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>
                {item.value}
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginTop: '8px', fontWeight: '500' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderTestimonials(block) {
    const p = block.props;
    const items = p.items || [];
    if (!items.length) return null;
    const current = items[activeTestimonial % items.length];

    return (
      <div key={block.id} style={{ background: p.background || '#F0F2F5', padding: `${p.paddingY || 64}px 24px` }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          {p.heading && (
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1A1B4B', marginBottom: '40px', fontFamily: 'Outfit, sans-serif' }}>{p.heading}</h2>
          )}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '40px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', position: 'relative' }}>
            <Quote size={40} style={{ color: '#FF9F1C', opacity: 0.15, position: 'absolute', top: '24px', left: '24px' }} />
            {current.avatar ? (
              <img src={formatImageUrl(current.avatar)} alt={current.name} style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px', display: 'block', border: '3px solid #FF9F1C' }} />
            ) : (
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #1A1B4B, #2D1B69)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px', fontWeight: '700', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
                {(current.name || 'A')[0]}
              </div>
            )}
            <p style={{ fontSize: '17px', color: '#374151', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '20px', position: 'relative' }}>
              "{current.text}"
            </p>
            <div style={{ fontWeight: '700', color: '#1A1B4B', fontSize: '15px', fontFamily: 'Outfit, sans-serif' }}>{current.name}</div>
            {current.role && <div style={{ fontSize: '13px', color: '#FF9F1C', fontWeight: '500', marginTop: '2px' }}>{current.role}</div>}
            {current.rating && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', marginTop: '10px' }}>
                {Array.from({ length: current.rating }).map((_, i) => (
                  <Star key={i} size={14} fill="#FF9F1C" color="#FF9F1C" />
                ))}
              </div>
            )}
          </div>
          {items.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  style={{ width: i === activeTestimonial % items.length ? '28px' : '10px', height: '10px', borderRadius: '9999px', background: i === activeTestimonial % items.length ? '#FF9F1C' : '#D1D5DB', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderFaq(block) {
    const p = block.props;
    const items = p.items || [];
    return (
      <div key={block.id} style={{ background: p.background || '#fff', padding: `${p.paddingY || 60}px 24px` }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          {p.heading && (
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1A1B4B', marginBottom: '32px', textAlign: 'center', fontFamily: 'Outfit, sans-serif' }}>{p.heading}</h2>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map((item, i) => (
              <div key={i} style={{ border: '1.5px solid', borderColor: expandedFaqs[`${block.id}-${i}`] ? '#FF9F1C' : '#E5E7EB', borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                <button
                  onClick={() => setExpandedFaqs(prev => ({ ...prev, [`${block.id}-${i}`]: !prev[`${block.id}-${i}`] }))}
                  style={{ width: '100%', textAlign: 'left', padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', fontFamily: 'inherit' }}
                >
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#1A1B4B' }}>{item.q}</span>
                  {expandedFaqs[`${block.id}-${i}`] ? <ChevronUp size={18} color="#FF9F1C" /> : <ChevronDown size={18} color="#9CA3AF" />}
                </button>
                {expandedFaqs[`${block.id}-${i}`] && (
                  <div style={{ padding: '0 20px 18px', fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderInstructor(block) {
    const p = block.props;
    return (
      <div key={block.id} style={{ background: p.background || '#fff', padding: `${p.paddingY || 60}px 24px` }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {p.heading && (
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1A1B4B', marginBottom: '32px', textAlign: 'center', fontFamily: 'Outfit, sans-serif' }}>{p.heading}</h2>
          )}
          <div className="special-instructor-card" style={{ background: p.cardBackground || '#F8F9FE', borderRadius: '20px', padding: '36px', display: 'flex', gap: '32px', alignItems: 'flex-start', border: '1px solid rgba(26,27,75,0.06)' }}>
            {p.avatar ? (
              <img src={formatImageUrl(p.avatar)} alt={p.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '4px solid #FF9F1C', boxShadow: '0 8px 20px rgba(255,159,28,0.25)' }} />
            ) : (
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #1A1B4B, #2D1B69)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '4px solid #FF9F1C', fontSize: '36px', fontWeight: '700', color: '#fff', fontFamily: 'Outfit, sans-serif', boxShadow: '0 8px 20px rgba(26,27,75,0.2)' }}>
                {(p.name || 'R')[0]}
              </div>
            )}
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#1A1B4B', marginBottom: '4px', fontFamily: 'Outfit, sans-serif' }}>{p.name || 'Instructor Name'}</h3>
              {p.title && <p style={{ fontSize: '13px', color: '#FF9F1C', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>{p.title}</p>}
              {p.bio && <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: 1.7 }}>{p.bio}</p>}
              {p.credentials?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                  {p.credentials.map((c, i) => (
                    <span key={i} style={{ background: 'rgba(26,27,75,0.06)', color: '#1A1B4B', padding: '4px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600' }}>{c}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderCurriculum(block) {
    const p = block.props;
    const modules = course.modules || [];
    if (!modules.length) return null;

    return (
      <div key={block.id} style={{ background: p.background || '#F8F9FE', padding: `${p.paddingY || 60}px 24px` }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {p.heading && (
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1A1B4B', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>{p.heading}</h2>
          )}
          {p.subheading && <p style={{ color: '#6B7280', marginBottom: '28px', fontSize: '15px' }}>{p.subheading}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {modules.map((mod, mi) => (
              <div key={mod.id} style={{ border: '1.5px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
                <button
                  onClick={() => setExpandedModules(prev => ({ ...prev, [mod.id]: !prev[mod.id] }))}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', width: '100%', background: '#F9FAFB', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Module {mi + 1}</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#1A1B4B' }}>{mod.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{mod.lessons?.length || 0} lessons</span>
                    {expandedModules[mod.id] ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
                  </div>
                </button>
                {expandedModules[mod.id] && mod.lessons?.length > 0 && (
                  <div style={{ borderTop: '1px solid #E5E7EB' }}>
                    {mod.lessons.map(lesson => (
                      <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', borderBottom: '1px solid #F3F4F6' }}>
                        {lesson.type === 'youtube' ? <Play size={13} color="#6B7280" /> : <FileText size={13} color="#6B7280" />}
                        <span style={{ flex: 1, fontSize: '13px', color: '#374151' }}>{lesson.title}</span>
                        {lesson.is_free_preview && (
                          <button
                            onClick={() => setPreviewLesson(lesson)}
                            style={{ fontSize: '10px', fontWeight: '700', padding: '2px 10px', borderRadius: '9999px', background: '#DCFCE7', color: '#16A34A', border: 'none', cursor: 'pointer' }}
                          >
                            Preview
                          </button>
                        )}
                        {!lesson.is_free_preview && !isEnrolled && <Lock size={12} color="#D1D5DB" />}
                        {lesson.duration_seconds > 0 && (
                          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{formatDuration(lesson.duration_seconds)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderEnrollCard(block) {
    const p = block.props;
    return (
      <div key={block.id} style={{ background: p.background || '#F0F2F5', padding: `${p.paddingY || 60}px 24px` }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.04)' }}>
          {p.headerBg && (
            <div style={{ background: p.headerBg || '#1A1B4B', padding: '28px 32px', textAlign: 'center' }}>
              {p.headerTitle && <h3 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', fontFamily: 'Outfit, sans-serif', margin: 0 }}>{p.headerTitle}</h3>}
              {p.headerSubtitle && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: '6px 0 0' }}>{p.headerSubtitle}</p>}
            </div>
          )}
          <div style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '38px', fontWeight: '900', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif' }}>
                {displayPrice === 0 ? 'Free' : `₹${Number(displayPrice).toLocaleString('en-IN')}`}
              </span>
              {course.original_price && course.original_price > displayPrice && (
                <span style={{ fontSize: '18px', color: '#9CA3AF', textDecoration: 'line-through' }}>₹{Number(course.original_price).toLocaleString('en-IN')}</span>
              )}
              {couponResult?.discount_amount > 0 && (
                <span style={{ background: '#DCFCE7', color: '#16A34A', fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '9999px' }}>
                  Save ₹{couponResult.discount_amount}
                </span>
              )}
            </div>

            {/* Coupon */}
            {!isEnrolled && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  value={coupon}
                  onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponResult(null); }}
                  placeholder="Coupon code"
                  style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', letterSpacing: '1px', fontFamily: 'monospace' }}
                />
                <button onClick={onApplyCoupon} disabled={applyingCoupon || !coupon.trim()} style={{ padding: '10px 18px', background: '#F3F4F6', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {applyingCoupon ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Apply'}
                </button>
              </div>
            )}
            {couponResult?.error && <p style={{ color: '#DC2626', fontSize: '12px', marginBottom: '8px' }}>{couponResult.error}</p>}
            {couponResult?.success && <p style={{ color: '#16A34A', fontSize: '12px', marginBottom: '8px' }}>✓ Coupon applied! {couponResult.description}</p>}

            {isEnrolled ? (
              <Link href={`/courses/${slug}/learn`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #FF9F1C, #E07A5F)', color: '#fff', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', width: '100%', marginBottom: '16px', textDecoration: 'none', fontFamily: 'Outfit, sans-serif' }}>
                Continue Learning →
              </Link>
            ) : (
              <button onClick={onEnroll} disabled={enrolling} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: p.btnColor || 'linear-gradient(135deg, #FF9F1C, #E07A5F)', color: '#fff', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', width: '100%', marginBottom: '16px', fontFamily: 'Outfit, sans-serif', boxShadow: '0 6px 20px rgba(255,159,28,0.35)' }}>
                {enrolling ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</> : (displayPrice === 0 ? '🎓 Enroll for Free' : (p.btnText || 'Enroll Now'))}
              </button>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(p.guarantees || ['Lifetime access', 'Instant access', ...(course.has_certificate ? ['Certificate on completion'] : [])]).map((g, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6B7280' }}>
                  <CheckCircle size={14} color="#22C55E" /> {g}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderCountdown(block) {
    const p = block.props;
    const t = timeLeft[block.id] || { days: 0, hours: 0, mins: 0, secs: 0, done: false };
    const units = [
      { label: 'Days', value: t.days },
      { label: 'Hours', value: t.hours },
      { label: 'Mins', value: t.mins },
      { label: 'Secs', value: t.secs },
    ];
    return (
      <div key={block.id} style={{ background: p.background || '#1A1B4B', padding: `${p.paddingY || 48}px 24px`, textAlign: 'center' }}>
        {p.heading && <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>{p.heading}</h2>}
        {p.subheading && <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '28px', fontSize: '15px' }}>{p.subheading}</p>}
        {t.done ? (
          <p style={{ color: '#FF9F1C', fontSize: '18px', fontWeight: '700' }}>{p.expiredText || 'Offer has ended!'}</p>
        ) : (
          <div className="special-countdown" style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {units.map(u => (
              <div key={u.label} className="special-countdown-unit" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px 28px', minWidth: '80px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ fontSize: '40px', fontWeight: '900', color: p.accentColor || '#FF9F1C', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>
                  {String(u.value).padStart(2, '0')}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
                  {u.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderTwoColumn(block) {
    const p = block.props;
    const lType = p.leftType || (p.leftImage ? 'image' : 'text');
    const rType = p.rightType || (p.rightImage ? 'image' : 'text');

    const renderColumnContent = (type, col) => {
      if (type === 'image') {
        const imgSrc = col === 'left' ? p.leftImage : p.rightImage;
        if (!imgSrc) return <div style={{ height: '100px', background: '#F3F4F6', borderRadius: '16px' }} />;
        
        const errorKey = `${block.id}-${col}`;
        if (imageErrors[errorKey]) {
          return (
            <div style={{ padding: '24px', background: '#F9FAFB', border: '1px dashed #D1D5DB', borderRadius: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '8px 0 4px' }}>Image failed to load</p>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Please make sure your Google Drive link is set to <strong>"Anyone with the link can view"</strong>.</p>
            </div>
          );
        }

        return (
          <img
            src={formatImageUrl(imgSrc)}
            alt=""
            onError={() => setImageErrors(prev => ({ ...prev, [errorKey]: true }))}
            style={{
              width: '100%',
              height: p.imageHeight ? `${p.imageHeight}px` : '380px',
              objectFit: p.imageFit || 'cover',
              borderRadius: '16px',
              boxShadow: p.imageShadow ? '0 16px 48px rgba(0,0,0,0.12)' : 'none'
            }}
          />
        );
      }
      if (type === 'video') {
        const vidUrl = col === 'left' ? p.leftVideoUrl : p.rightVideoUrl;
        const ytId = getYouTubeId(vidUrl);
        if (!ytId) return <div style={{ height: '100px', background: '#F3F4F6', borderRadius: '16px' }} />;
        return (
          <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.15)' }}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            />
          </div>
        );
      }
      
      // text type
      const heading = col === 'left' ? p.leftHeading : p.rightHeading;
      const content = col === 'left' ? p.leftContent : p.rightContent;
      const eyebrow = col === 'left' ? null : p.rightEyebrow; // right eyebrow for backward compatibility
      const ctaText = col === 'left' ? p.leftCtaText : (p.rightCtaText || p.ctaText); // fallback to old ctaText
      const ctaColor = col === 'left' ? p.leftCtaColor : (p.rightCtaColor || p.ctaColor);
      const ctaTextColor = col === 'left' ? p.leftCtaTextColor : (p.rightCtaTextColor || p.ctaTextColor);

      return (
        <div>
          {eyebrow && <p style={{ fontSize: '12px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>{eyebrow}</p>}
          {heading && <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1A1B4B', marginBottom: '16px', fontFamily: 'Outfit, sans-serif', lineHeight: 1.2 }}>{heading}</h2>}
          {content && <div style={{ fontSize: '15px', color: '#4B5563', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{content}</div>}
          {ctaText && (
            <button onClick={onEnroll} style={{ marginTop: '24px', background: ctaColor || '#FF9F1C', color: ctaTextColor || '#1A1B4B', border: 'none', borderRadius: '10px', padding: '14px 28px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
              {ctaText}
            </button>
          )}
        </div>
      );
    };

    const gridCols = p.leftWidth && p.leftWidth.includes(' ') ? p.leftWidth : `${p.leftWidth || '1fr'} ${p.rightWidth || '1fr'}`;

    return (
      <div key={block.id} style={{ background: p.background || '#fff', padding: `${p.paddingY || 60}px 24px` }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: gridCols, gap: `${p.gap || 40}px`, alignItems: 'center' }} className="special-two-col">
          <div>
            {renderColumnContent(lType, 'left')}
          </div>
          <div>
            {renderColumnContent(rType, 'right')}
          </div>
        </div>
      </div>
    );
  }

  function renderDivider(block) {
    const p = block.props;
    return (
      <div key={block.id} style={{ height: `${p.height || 48}px`, background: p.background || 'transparent', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        {p.showLine && <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', height: '1px', background: p.lineColor || '#E5E7EB' }} />}
      </div>
    );
  }

  function renderCta(block) {
    const p = block.props;
    return (
      <div key={block.id} style={{ background: p.background || 'linear-gradient(135deg, #1A1B4B, #2D1B69)', padding: `${p.paddingY || 64}px 24px`, textAlign: 'center' }}>
        {p.heading && <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', marginBottom: '12px', fontFamily: 'Outfit, sans-serif' }}>{p.heading}</h2>}
        {p.subheading && <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.75)', marginBottom: '32px', maxWidth: '560px', margin: '0 auto 32px' }}>{p.subheading}</p>}
        <button onClick={onEnroll} disabled={enrolling} style={{ background: p.btnColor || '#FF9F1C', color: p.btnTextColor || '#1A1B4B', border: 'none', borderRadius: '14px', padding: '18px 48px', fontSize: '18px', fontWeight: '900', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', boxShadow: '0 8px 24px rgba(255,159,28,0.4)', transition: 'transform 0.15s' }}>
          {isEnrolled ? 'Continue Learning →' : (p.btnText || 'Enroll Now')}
        </button>
        {p.note && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '16px' }}>{p.note}</p>}
      </div>
    );
  }

  // ─── Preview Modal ─────────────────────────────────────────────────
  const getYtId = getYouTubeId;

  const previewModal = previewLesson && (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setPreviewLesson(null)}>
      <div style={{ background: '#fff', width: '100%', maxWidth: '720px', borderRadius: '16px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1A1B4B' }}>{previewLesson.title}</h3>
          <button onClick={() => setPreviewLesson(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#6B7280' }}>×</button>
        </div>
        {previewLesson.type === 'youtube' ? (
          <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
            <iframe src={`https://www.youtube-nocookie.com/embed/${getYtId(previewLesson.content_url)}?autoplay=1&rel=0`} title={previewLesson.title} frameBorder="0" allow="autoplay; fullscreen" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          </div>
        ) : (
          <div style={{ padding: '24px', maxHeight: '400px', overflowY: 'auto', fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>
            {previewLesson.content_text ? (
              <div style={{ whiteSpace: 'pre-wrap' }}>{previewLesson.content_text}</div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#9CA3AF' }}>
                <p style={{ margin: 0 }}>This is a document or text lesson preview.</p>
                {previewLesson.content_url && (
                  <a href={previewLesson.content_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '16px', background: '#FF9F1C', color: '#1A1B4B', padding: '10px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '13px' }}>
                    View Attachment / Resource
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  function renderRichText(block, isNested = false) {
    const p = block.props;
    const padding = isNested ? '24px' : `${p.paddingY || 48}px 24px`;
    const borderRadius = isNested ? '12px' : '0px';
    const border = isNested ? '1px solid rgba(26,27,75,0.06)' : 'none';
    const boxShadow = isNested ? '0 4px 12px rgba(0,0,0,0.03)' : 'none';
    return (
      <div key={block.id} style={{ background: p.background || '#fff', padding, borderRadius, border, boxShadow, height: isNested ? '100%' : undefined, boxSizing: 'border-box', display: isNested ? 'flex' : undefined, flexDirection: isNested ? 'column' : undefined, justifyContent: isNested ? 'center' : undefined }}>
        <div 
          style={{ maxWidth: p.maxWidth || '900px', margin: '0 auto', textAlign: p.align || 'left', color: p.textColor || '#1f2937', width: '100%' }}
          dangerouslySetInnerHTML={{ __html: p.content || '' }}
        />
      </div>
    );
  }

  function renderThreeColumn(block) {
    const p = block.props;
    return (
      <div key={block.id} style={{ background: p.background || '#fff', padding: `${p.paddingY || 60}px 24px` }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: `${p.gap || 24}px` }} className="special-two-col">
          {[1, 2, 3].map(n => {
            const heading = p[`col${n}Heading`];
            const content = p[`col${n}Content`];
            const img = p[`col${n}Image`];
            return (
              <div key={n} style={{ color: p.textColor || '#4b5563' }}>
                {img && (
                  <img 
                    src={formatImageUrl(img)} 
                    alt={heading || ''} 
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px' }} 
                  />
                )}
                {heading && <h3 style={{ fontSize: '18px', fontWeight: '800', color: p.headingColor || '#1a1b4b', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>{heading}</h3>}
                {content && <p style={{ fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{content}</p>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderFourColumn(block) {
    const p = block.props;
    return (
      <div key={block.id} style={{ background: p.background || '#fafafa', padding: `${p.paddingY || 50}px 24px` }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: `${p.gap || 16}px` }} className="special-stats">
          {[1, 2, 3, 4].map(n => {
            const title = p[`col${n}Title`];
            const text = p[`col${n}Text`];
            return (
              <div key={n} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
                {title && <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1a1b4b', marginBottom: '6px', fontFamily: 'Outfit, sans-serif' }}>{title}</h3>}
                {text && <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5, margin: 0 }}>{text}</p>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderGallery(block) {
    const p = block.props;
    return (
      <div key={block.id} style={{ background: p.background || '#fff', padding: `${p.paddingY || 48}px 24px` }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {p.title && <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1A1B4B', marginBottom: '24px', textAlign: 'center', fontFamily: 'Outfit, sans-serif' }}>{p.title}</h2>}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${p.columns || 3}, 1fr)`, gap: '16px' }} className="special-two-col">
            {(p.images || []).map((img, i) => (
              <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <img 
                  src={formatImageUrl(img.src)} 
                  alt={img.caption || ''} 
                  style={{ width: '100%', height: p.imageHeight ? `${p.imageHeight}px` : '250px', objectFit: 'cover' }} 
                />
                {img.caption && (
                  <div style={{ background: '#fff', padding: '10px 14px', fontSize: '12px', color: '#4B5563', borderTop: '1px solid #F3F4F6' }}>
                    {img.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderTeamCards(block) {
    const p = block.props;
    return (
      <div key={block.id} style={{ background: p.background || '#fff', padding: `${p.paddingY || 60}px 24px` }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {p.heading && <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1A1B4B', marginBottom: '32px', textAlign: 'center', fontFamily: 'Outfit, sans-serif' }}>{p.heading}</h2>}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${(p.items || []).length || 3}, 1fr)`, gap: '24px' }} className="special-instructor-card">
            {(p.items || []).map((item, i) => (
              <div key={i} style={{ background: '#F8F9FE', border: '1px solid rgba(26,27,75,0.06)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                {item.avatar ? (
                  <img src={formatImageUrl(item.avatar)} alt={item.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', border: '3px solid #FF9F1C' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #1A1B4B, #2D1B69)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '28px', color: '#fff', fontWeight: '700' }}>
                    {(item.name || 'T')[0]}
                  </div>
                )}
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1A1B4B', margin: '0 0 4px', fontFamily: 'Outfit, sans-serif' }}>{item.name}</h3>
                {item.title && <p style={{ fontSize: '12px', color: '#FF9F1C', fontWeight: '600', textTransform: 'uppercase', margin: '0 0 8px' }}>{item.title}</p>}
                {item.bio && <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>{item.bio}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderTimeline(block) {
    const p = block.props;
    return (
      <div key={block.id} style={{ background: p.background || '#fafafa', padding: `${p.paddingY || 60}px 24px` }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {p.heading && <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1A1B4B', marginBottom: '32px', textAlign: 'center', fontFamily: 'Outfit, sans-serif' }}>{p.heading}</h2>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
            {(p.items || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ background: '#FF9F1C', color: '#1A1B4B', fontWeight: '800', padding: '6px 14px', borderRadius: '8px', fontSize: '14px', minWidth: '70px', textAlign: 'center', fontFamily: 'Outfit, sans-serif' }}>
                  {item.date}
                </div>
                <div style={{ flex: 1, background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                  {item.title && <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A1B4B', marginBottom: '6px', fontFamily: 'Outfit, sans-serif' }}>{item.title}</h3>}
                  {item.text && <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>{item.text}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderAccordion(block, isNested = false) {
    const p = block.props;
    const items = p.items || [];
    const padding = isNested ? '24px' : `${p.paddingY || 60}px 24px`;
    const borderRadius = isNested ? '12px' : '0px';
    const border = isNested ? '1px solid rgba(26,27,75,0.06)' : 'none';
    const boxShadow = isNested ? '0 4px 12px rgba(0,0,0,0.03)' : 'none';
    return (
      <div key={block.id} style={{ background: p.background || '#fff', padding, borderRadius, border, boxShadow, height: isNested ? '100%' : undefined, boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', width: '100%' }}>
          {p.heading && (
            <h2 style={{ fontSize: isNested ? '22px' : '28px', fontWeight: '800', color: '#1A1B4B', marginBottom: '24px', textAlign: 'center', fontFamily: 'Outfit, sans-serif' }}>{p.heading}</h2>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map((item, i) => (
              <div key={i} style={{ border: '1.5px solid', borderColor: expandedFaqs[`${block.id}-${i}`] ? '#FF9F1C' : '#E5E7EB', borderRadius: '12px', overflow: 'hidden', background: '#fff', transition: 'border-color 0.2s' }}>
                <button
                  onClick={() => setExpandedFaqs(prev => ({ ...prev, [`${block.id}-${i}`]: !prev[`${block.id}-${i}`] }))}
                  style={{ width: '100%', textAlign: 'left', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', fontFamily: 'inherit' }}
                >
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#1A1B4B' }}>{item.q}</span>
                  {expandedFaqs[`${block.id}-${i}`] ? <ChevronUp size={16} color="#FF9F1C" /> : <ChevronDown size={16} color="#9CA3AF" />}
                </button>
                {expandedFaqs[`${block.id}-${i}`] && (
                  <div style={{ padding: '0 16px 14px', fontSize: '13px', color: '#4B5563', lineHeight: 1.6, borderTop: '1px solid #F3F4F6', paddingTop: '10px' }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderBanner(block) {
    const p = block.props;
    const isLink = p.linkUrl && p.linkText;
    const content = (
      <>
        <span>{p.text}</span>
        {isLink && (
          <span style={{ textDecoration: 'underline', marginLeft: '8px', fontWeight: '800' }}>
            {p.linkText}
          </span>
        )}
      </>
    );

    return (
      <div 
        key={block.id} 
        style={{ 
          background: p.background || '#FF9F1C', 
          color: p.textColor || '#1A1B4B', 
          padding: `${p.paddingY || 12}px 24px`, 
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '600',
        }}
      >
        {isLink ? (
          <Link href={p.linkUrl} style={{ color: 'inherit', textDecoration: 'none' }}>
            {content}
          </Link>
        ) : content}
      </div>
    );
  }

  function renderHtmlEmbed(block) {
    const p = block.props;
    return (
      <div 
        key={block.id} 
        style={{ background: p.background || '#ffffff', padding: `${p.paddingY || 24}px 24px` }}
        dangerouslySetInnerHTML={{ __html: p.html || '' }}
      />
    );
  }

  // ─── Homepage System Blocks Renderers ─────────────────────────────
  function renderSystemHeroSlides(block) {
    const posterImages = block.props?.heroSlides?.length > 0 ? block.props.heroSlides : (homeConfig?.heroSlides?.length > 0 ? homeConfig.heroSlides : POSTER_IMAGES);
    
    const nextSlide = () => setHeroActiveSlide((prev) => (prev + 1) % posterImages.length);
    const prevSlide = () => setHeroActiveSlide((prev) => (prev - 1 + posterImages.length) % posterImages.length);

    const activeIndex = heroActiveSlide % posterImages.length;

    return (
      <section key={block.id} style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #1A1B4B 0%, #0F1035 60%, #2D1B69 100%)',
        padding: '0 0 40px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}>
        <div style={{ width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={prevSlide} style={{
            position: 'absolute', left: '24px', background: 'rgba(26, 27, 75, 0.85)', border: 'none', borderRadius: '50%',
            width: '48px', height: '48px', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <ChevronLeft size={24} />
          </button>
          <div style={{ width: '100%', height: '500px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', background: '#1A1B4B', position: 'relative' }}>
            <img src={formatImageUrl(posterImages[activeIndex])} alt="" style={{
              width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(15px) brightness(0.6)', transform: 'scale(1.1)', position: 'absolute', top: 0, left: 0, zIndex: 1
            }} />
            <img src={formatImageUrl(posterImages[activeIndex])} alt="" style={{
              width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 2
            }} />
          </div>
          <button onClick={nextSlide} style={{
            position: 'absolute', right: '24px', background: 'rgba(26, 27, 75, 0.85)', border: 'none', borderRadius: '50%',
            width: '48px', height: '48px', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <ChevronRight size={24} />
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' }}>
          {posterImages.map((_, idx) => (
            <span key={idx} onClick={() => setHeroActiveSlide(idx)}
              style={{ height: '8px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.3s ease', background: activeIndex === idx ? '#FF9F1C' : 'rgba(255,255,255,0.4)', width: activeIndex === idx ? '16px' : '8px' }}
            />
          ))}
        </div>
      </section>
    );
  }

  function renderSystemCredentials(block) {
    const creds = homeConfig?.credentials?.length > 0 ? homeConfig.credentials : [
      { src: "https://lh3.googleusercontent.com/d/19yYbEATwSgrOVfuKk339h6j6qVNY48Nw", alt: "IIT Mumbai Topper" },
      { src: "https://lh3.googleusercontent.com/d/1zHSviGsVWpcjqEEcDClEht0qNihIQ8qp", alt: "Temple President ISKCON Pune" },
      { src: "https://lh3.googleusercontent.com/d/1etXzaXu2p4rmW81PrMW6T-bHRfKIZzSQ", alt: "Temple Management Council Member ISKCON Abids" },
      { src: "https://lh3.googleusercontent.com/d/1vu3f15JL_oJ8LAiYq4WItoVSH4Of5uEz", alt: "Global Duty Officer Youth Training ISKCON" },
    ];
    return (
      <section key={block.id} style={{ padding: '60px 24px', background: '#FFF', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div ref={credsScrollRef} className="credentials-scroll-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px' }}>
            {creds.concat(creds).map((cred, idx) => (
              <div key={idx} className={`cred-slide-card ${idx >= creds.length ? 'duplicate' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '16px' }}>
                <img src={formatImageUrl(cred.src)} alt={cred.alt} style={{ maxHeight: '260px', width: 'auto', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px' }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function renderSystemLogos(block) {
    const marqueeDuration = block.props?.autoplayInterval !== undefined ? Number(block.props.autoplayInterval) : 25;
    return (
      <section key={block.id} style={{ padding: '40px 24px', background: '#FAF8F5', borderBottom: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '700', color: '#1A1B4B', textAlign: 'center', marginBottom: '24px' }}>Corporate Trainer</h4>
          <div style={{ overflow: 'hidden', width: '100%', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '40px', width: 'max-content', animation: `marquee ${marqueeDuration}s linear infinite` }}>
              {COMPANIES.concat(COMPANIES).map((comp, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#FFF', padding: '12px 24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                  <img src={comp.logo} alt={comp.name} style={{ height: '36px', maxWidth: '120px', objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderSystemFeatured(block) {
    return (
      <section key={block.id} style={{ padding: '60px 24px', background: '#FFF', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            <div style={{ background: '#FAF8F5', borderRadius: '16px', padding: '32px 24px', textAlign: 'center', border: '1px solid rgba(26,27,75,0.06)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', display: 'block' }}>Featured Book</span>
              <img src="https://cdn.shopify.com/s/files/1/0614/8639/9543/files/WisdomEye-cover.jpg?v=1780304483" alt="" style={{ width: '100%', height: '180px', objectFit: 'contain', borderRadius: '8px', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1B4B', marginBottom: '8px' }}>Wisdom Eye</h3>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5', marginBottom: '16px' }}>Laying the foundation for character and personal leadership success.</p>
              <Link href="/books" style={{ fontSize: '13px', fontWeight: '700', color: '#FF9F1C', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>View All Books <ExternalLink size={14} /></Link>
            </div>
            <div style={{ background: '#FAF8F5', borderRadius: '16px', padding: '32px 24px', textAlign: 'center', border: '1px solid rgba(26,27,75,0.06)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', display: 'block' }}>Scripture Academy</span>
              <img src="https://gaurangadarshandas.com/images/courses/8aab8f0c77c546568fd0c9c430ef6547_dw6z4v.png" alt="" style={{ width: '100%', height: '180px', objectFit: 'contain', borderRadius: '8px', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1B4B', marginBottom: '8px' }}>Certified Courses</h3>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5', marginBottom: '16px' }}>Auto-graded quizzes, certification, and discussions under the guidance of Radheshyam Das.</p>
              <Link href="/courses" style={{ fontSize: '13px', fontWeight: '700', color: '#FF9F1C', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Explore Academy <ChevronRight size={14} /></Link>
            </div>
            <div style={{ background: '#FAF8F5', borderRadius: '16px', padding: '32px 24px', textAlign: 'center', border: '1px solid rgba(26,27,75,0.06)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', display: 'block' }}>Daily Reading</span>
              <div style={{ width: '100%', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eadecd', borderRadius: '8px', marginBottom: '16px' }}>
                <BookOpenCheck size={48} color="#1A1B4B" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1B4B', marginBottom: '8px' }}>Daily Reading Wisdom</h3>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5', marginBottom: '16px' }}>Start your day with spiritual inspiration and logical insights from timeless scriptures.</p>
              <Link href="/daily-reading" style={{ fontSize: '13px', fontWeight: '700', color: '#FF9F1C', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Read Daily Verse <ChevronRight size={14} /></Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderSystemAbout(block) {
    return (
      <section key={block.id} style={{ padding: '80px 24px', background: '#FAF8F5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '48px', alignItems: 'center' }} className="special-two-col">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#FF9F1C', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Biography</span>
              <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif' }}>Radheshyam Das</h2>
              <div style={{ height: '4px', width: '60px', background: '#FF9F1C', margin: '16px 0 24px', borderRadius: '2px' }} />
              <p style={{ fontSize: '15px', lineHeight: '1.65', color: '#4B5563', marginBottom: '20px', textAlign: 'left' }}><strong>Radheshyam Das</strong> is an IIT Mumbai Topper who dedicated his life as a full-time monk, youth educator, and author. Born in a devout family near Madurai, his childhood was fascinated by Vedic chants and philosophical classics.</p>
              <p style={{ fontSize: '15px', lineHeight: '1.65', color: '#4B5563', marginBottom: '20px', textAlign: 'left' }}>After top ranking at IIT Mumbai, working as a Senior Research Fellow and mechanical engineer at top companies, he took up the role of a celibate monk. He designed the DYS (Discover Your Self) and GAME (Gita for All Made Easy) course structures which are taught across leading universities.</p>
            </div>
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', bottom: '-20px', background: '#DA9B5B', borderRadius: '16px', zIndex: 1 }} />
              <img src="https://lh3.googleusercontent.com/d/1MN4z91XjyCUFfuOPKDCeBse8TwAfJRVg" alt="" style={{ position: 'relative', width: '100%', maxWidth: '320px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', zIndex: 2, margin: '0 auto' }} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderSystemBooks(block) {
    const liveBooks = homeConfig?.featuredBooks?.length > 0 ? homeConfig.featuredBooks : FEATURED_BOOKS;
    return (
      <section key={block.id} style={{ padding: '80px 24px', background: '#DA9B5B', color: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', borderBottom: '2px solid rgba(255,255,255,0.2)', paddingBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#FFF8E2', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Publications</span>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif', margin: 0 }}>Featured Books</h2>
            </div>
            <a href="https://voicepublication.in" target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(255,255,255,0.2)', color: '#FFF', border: 'none', borderRadius: '9999px', padding: '10px 24px', fontWeight: '700', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              View All Books <ExternalLink size={14} />
            </a>
          </div>
          <div ref={booksScrollRef} className="books-scroll-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {liveBooks.concat(liveBooks).map((book, idx) => (
              <div key={idx} style={{ background: '#FFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: '220px', background: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                  <img src={book.image} alt="" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1A1B4B', marginBottom: '8px', lineHeight: '1.35', height: '38px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{book.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#1A1B4B' }}>{book.price}</span>
                  </div>
                  <a href={book.url} target="_blank" rel="noopener noreferrer" style={{ background: '#FF9F1C', color: '#1A1B4B', textDecoration: 'none', textAlign: 'center', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: 'auto' }}>
                    Buy Now <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function renderSystemYoutube(block) {
    const pinned = homeConfig?.pinnedVideos || [];
    const pinnedList = pinned.map(id => youtubeVideos.find(v => v.id === id)).filter(Boolean);
    const rest = youtubeVideos.filter(v => !pinned.includes(v.id));
    const liveVideos = [...pinnedList, ...rest];

    return (
      <section key={block.id} style={{ padding: '80px 24px', background: '#FAF8F5', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '2px solid rgba(26,27,75,0.1)', paddingBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#FF9F1C', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Media Lectures</span>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif', margin: 0 }}>Radheshyam Das YouTube Lectures</h2>
            </div>
            <a href="https://www.youtube.com/channel/UC9Pap1xwEQAo7X1tKqpcpWg" target="_blank" rel="noopener noreferrer" style={{ background: '#FF0000', color: '#FFF', borderRadius: '9999px', padding: '10px 24px', fontWeight: '700', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(255,0,0,0.2)' }}>
              Subscribe on YouTube <Play size={14} fill="#FFF" style={{ marginLeft: '4px' }} />
            </a>
          </div>
          {ytLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', fontSize: '15px', color: '#6B7280' }}>
              <div>Loading latest lectures...</div>
            </div>
          ) : liveVideos.length > 0 ? (
            <div className="youtube-layout">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {activeVideo && (
                  <>
                    <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', background: '#000' }}>
                      <iframe src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}`} title={activeVideo.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1A1B4B', marginTop: '16px', marginBottom: '8px', lineHeight: 1.4 }}>{activeVideo.title}</h3>
                    <p style={{ fontSize: '12px', color: '#6B7280' }}>Published: {new Date(activeVideo.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '450px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#1A1B4B', marginBottom: '16px' }}>Recent Lectures ({liveVideos.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
                  {liveVideos.map((video) => (
                    <div key={video.id} onClick={() => setActiveVideo(video)} style={{ display: 'flex', gap: '12px', padding: '8px', borderRadius: '8px', border: '1px solid rgba(26, 27, 75, 0.08)', cursor: 'pointer', background: activeVideo?.id === video.id ? 'rgba(255, 159, 28, 0.15)' : 'transparent', borderColor: activeVideo?.id === video.id ? '#FF9F1C' : 'rgba(26, 27, 75, 0.08)' }}>
                      <img src={video.thumbnail} alt="" style={{ width: '100px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                        <h5 style={{ fontSize: '13px', fontWeight: '700', lineHeight: 1.35, marginBottom: '4px', color: activeVideo?.id === video.id ? '#FF9F1C' : '#1A1B4B' }}>{video.title}</h5>
                        <p style={{ fontSize: '11px', color: '#6B7280' }}>{new Date(video.publishedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', fontSize: '15px', color: '#6B7280' }}>
              <p>No videos available. Visit the YouTube channel to watch more.</p>
            </div>
          )}
        </div>
      </section>
    );
  }

  // ─── Main Render ─────────────────────────────────────────────────
  const renderBlock = (block, isNested = false) => {
    switch (block.type) {
      case 'hero': return renderHero(block);
      case 'text': return renderText(block, isNested);
      case 'rich_text': return renderRichText(block, isNested);
      case 'video': return renderVideo(block, isNested);
      case 'image': return renderImage(block, isNested);
      case 'gallery': return renderGallery(block);
      case 'features': return renderFeatures(block);
      case 'stats': return renderStats(block);
      case 'testimonials': return renderTestimonials(block);
      case 'team_cards': return renderTeamCards(block);
      case 'timeline': return renderTimeline(block);
      case 'accordion': return renderAccordion(block, isNested);
      case 'faq': return renderFaq(block);
      case 'instructor': return renderInstructor(block);
      case 'curriculum': return renderCurriculum(block);
      case 'enroll_card': return renderEnrollCard(block);
      case 'countdown': return renderCountdown(block);
      case 'two_column': return renderTwoColumn(block);
      case 'three_column': return renderThreeColumn(block);
      case 'four_column': return renderFourColumn(block);
      case 'divider': return renderDivider(block);
      case 'cta': return renderCta(block);
      case 'banner': return renderBanner(block);
      case 'html_embed': return renderHtmlEmbed(block);
      case 'system_hero_slides': return renderSystemHeroSlides(block);
      case 'system_credentials': return renderSystemCredentials(block);
      case 'system_logos': return renderSystemLogos(block);
      case 'system_featured': return renderSystemFeatured(block);
      case 'system_about': return renderSystemAbout(block);
      case 'system_books': return renderSystemBooks(block);
      case 'system_youtube': return renderSystemYoutube(block);
      case '__row__': return renderRow(block);
      default: return null;
    }
  };

  function renderRow(row) {
    const cols = row.columns || [];
    const gap = row.rowGap ?? 16;
    return (
      <div
        key={row.id}
        className="special-row"
        style={{
          display: 'flex',
          gap: `${gap}px`,
          alignItems: row.rowAlign ?? 'stretch',
          background: row.rowBackground && row.rowBackground !== 'transparent' ? row.rowBackground : undefined,
          padding: row.rowPadding ? `${row.rowPadding}px` : undefined,
        }}
      >
        {cols.map((col, i) => {
          const gapReduction = ((cols.length - 1) * gap) / cols.length;
          const finalWidth = `calc(${col.width}% - ${gapReduction}px)`;
          return (
            <div 
              key={col.block.id} 
              style={{ 
                flex: `0 0 ${finalWidth}`, 
                width: finalWidth, 
                minWidth: 0, 
                boxSizing: 'border-box' 
              }}
            >
              {renderBlock(col.block, true)}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {previewModal}
      <div style={{ minHeight: '100vh' }}>
        {/* Back link */}
        <div style={{ background: '#1A1B4B', padding: '12px 24px' }}>
          <Link href="/courses" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}>← All Courses</Link>
        </div>

        {blocks.map(block => renderBlock(block))}

        {/* Footer spacer */}
        <div style={{ height: '40px', background: '#F0F2F5' }} />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .feature-card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.1) !important;
        }
        @media (max-width: 700px) {
          .special-two-col { grid-template-columns: 1fr !important; gap: 24px !important; }
          .special-features { grid-template-columns: 1fr !important; }
          .special-stats { grid-template-columns: repeat(4, 1fr) !important; gap: 8px !important; }
          .special-stats > div > div:first-child { font-size: 20px !important; }
          .special-stats > div > div:last-child { font-size: 10px !important; margin-top: 4px !important; }
          
          .special-row { flex-direction: column !important; }
          .special-row > div { flex: 0 0 100% !important; width: 100% !important; }
          
          /* Instructor mobile responsiveness */
          .special-instructor-card {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            padding: 24px !important;
          }
          .special-instructor-card > div {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          /* Countdown timer mobile responsiveness */
          .special-countdown {
            gap: 10px !important;
          }
          .special-countdown-unit {
            padding: 12px 16px !important;
            min-width: 65px !important;
          }
          .special-countdown-unit > div:first-child {
            fontSize: 28px !important;
          }
        }
      `}</style>
    </>
  );
}
