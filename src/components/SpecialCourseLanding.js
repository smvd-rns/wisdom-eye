'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronDown, ChevronUp, Play, FileText, Lock, CheckCircle, 
  Loader2, Star, Users, BookOpen, Clock, Award, Quote
} from 'lucide-react';
import { formatImageUrl } from '@/lib/utils';

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
  const blocks = layout?.blocks || [];

  // Accordion state for curriculum + FAQ blocks
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedFaqs, setExpandedFaqs] = useState({});
  const [previewLesson, setPreviewLesson] = useState(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [timeLeft, setTimeLeft] = useState({});
  const [imageErrors, setImageErrors] = useState({});

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
    const interval = setInterval(() => {
      setActiveTestimonial(prev => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  function renderText(block) {
    const p = block.props;
    return (
      <div key={block.id} style={{ background: p.background || '#fff', padding: `${p.paddingY || 48}px 24px` }}>
        <div style={{ maxWidth: p.maxWidth || '800px', margin: '0 auto', textAlign: p.align || 'left' }}>
          {p.eyebrow && (
            <p style={{ fontSize: '12px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
              {p.eyebrow}
            </p>
          )}
          {p.heading && (
            <h2 style={{ fontSize: `${p.headingSize || 32}px`, fontWeight: '800', color: p.headingColor || '#1A1B4B', marginBottom: '16px', fontFamily: 'Outfit, sans-serif', lineHeight: 1.2 }}>
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

  function renderVideo(block) {
    const p = block.props;
    const ytId = getYouTubeId(p.url);
    if (!ytId) return null;
    return (
      <div key={block.id} style={{ background: p.background || '#0F0F0F', padding: `${p.paddingY || 48}px 24px` }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          {p.title && (
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginBottom: '24px', textAlign: 'center', fontFamily: 'Outfit, sans-serif' }}>
              {p.title}
            </h2>
          )}
          <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
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

  // ─── Main Render ─────────────────────────────────────────────────
  const renderBlock = (block) => {
    switch (block.type) {
      case 'hero': return renderHero(block);
      case 'text': return renderText(block);
      case 'video': return renderVideo(block);
      case 'image': return renderImage(block);
      case 'features': return renderFeatures(block);
      case 'stats': return renderStats(block);
      case 'testimonials': return renderTestimonials(block);
      case 'faq': return renderFaq(block);
      case 'instructor': return renderInstructor(block);
      case 'curriculum': return renderCurriculum(block);
      case 'enroll_card': return renderEnrollCard(block);
      case 'countdown': return renderCountdown(block);
      case 'two_column': return renderTwoColumn(block);
      case 'divider': return renderDivider(block);
      case 'cta': return renderCta(block);
      case '__row__': return renderRow(block);
      default: return null;
    }
  };

  function renderRow(row) {
    const cols = row.columns || [];
    return (
      <div
        key={row.id}
        className="special-row"
        style={{
          display: 'flex',
          gap: `${row.rowGap ?? 0}px`,
          alignItems: row.rowAlign ?? 'stretch',
          background: row.rowBackground && row.rowBackground !== 'transparent' ? row.rowBackground : undefined,
          padding: row.rowPadding ? `${row.rowPadding}px` : undefined,
        }}
      >
        {cols.map((col, i) => (
          <div key={col.block.id} style={{ flex: `0 0 ${col.width}%`, width: `${col.width}%`, minWidth: 0, boxSizing: 'border-box' }}>
            {renderBlock(col.block)}
          </div>
        ))}
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
