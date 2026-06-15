'use client';

import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SpecialCourseLanding from '@/components/SpecialCourseLanding';
import {
  ArrowLeft, Save, Eye, EyeOff, Loader2, Plus, Trash2, Copy,
  GripVertical, ChevronUp, ChevronDown, Sparkles, Settings,
  Image, Type, Video, Layout, Star, Users, Award, AlignLeft,
  Layers, BarChart3, Clock, MessageSquare, HelpCircle, Zap, Minus,
  ExternalLink, Check, X, Palette, ToggleLeft, ToggleRight, Columns,
  SplitSquareHorizontal, AlignJustify, Undo2, Redo2, Monitor, Tablet, Smartphone
} from 'lucide-react';

// ─── Block Definitions (the palette, extended to 20+ types) ────────────────────────────────
const BLOCK_TYPES = [
  { type: 'hero', label: 'Hero Banner', icon: '🎯', desc: 'Eye-catching header section', color: '#7C3AED' },
  { type: 'text', label: 'Text Block', icon: '📝', desc: 'Heading + paragraph content', color: '#0891B2' },
  { type: 'rich_text', label: 'Rich Text', icon: '✍️', desc: 'WYSIWYG rich text block', color: '#3B82F6' },
  { type: 'two_column', label: 'Two Column', icon: '◫', desc: 'Side-by-side layout', color: '#059669' },
  { type: 'three_column', label: 'Three Column', icon: '☰', desc: '3-column grid layout', color: '#10B981' },
  { type: 'four_column', label: 'Four Column', icon: '⧉', desc: '4-column grid layout', color: '#06B6D4' },
  { type: 'video', label: 'YouTube Video', icon: '🎬', desc: 'Embed a YouTube video', color: '#DC2626' },
  { type: 'image', label: 'Image', icon: '🖼️', desc: 'Full-width image block', color: '#D97706' },
  { type: 'gallery', label: 'Photo Gallery', icon: '📸', desc: 'Grid of images with caption', color: '#F59E0B' },
  { type: 'features', label: 'Features Grid', icon: '✨', desc: 'Icon + title + text cards', color: '#7C3AED' },
  { type: 'stats', label: 'Stats Bar', icon: '📊', desc: 'Numbers / achievements row', color: '#1A1B4B' },
  { type: 'testimonials', label: 'Testimonials', icon: '💬', desc: 'Student reviews carousel', color: '#0891B2' },
  { type: 'team_cards', label: 'Team Members', icon: '👥', desc: 'Team/Instructor profiles', color: '#6366F1' },
  { type: 'timeline', label: 'Timeline', icon: '📅', desc: 'Step-by-step history timeline', color: '#8B5CF6' },
  { type: 'accordion', label: 'Accordion (FAQ)', icon: '❓', desc: 'Collapsible text questions', color: '#EC4899' },
  { type: 'countdown', label: 'Countdown Timer', icon: '⏱️', desc: 'Urgency countdown clock', color: '#7C3AED' },
  { type: 'cta', label: 'CTA Banner', icon: '🚀', desc: 'Call-to-action section', color: '#1A1B4B' },
  { type: 'divider', label: 'Spacer/Divider', icon: '➖', desc: 'Blank space or line', color: '#9CA3AF' },
  { type: 'banner', label: 'Alert Banner', icon: '📢', desc: 'Header notification bar', color: '#EF4444' },
  { type: 'html_embed', label: 'Custom HTML', icon: '💻', desc: 'Raw HTML / Iframe / Map embed', color: '#111827' },
  { type: 'system_hero_slides', label: 'System: Hero Slides', icon: '🎠', desc: 'Standard homepage sliding poster hero', color: '#1A1B4B' },
  { type: 'system_credentials', label: 'System: Credentials', icon: '🎓', desc: 'Standard credentials/monk certificates row', color: '#1A1B4B' },
  { type: 'system_logos', label: 'System: Corporate Logos', icon: '🏢', desc: 'Standard corporate trainer logos slider', color: '#1A1B4B' },
  { type: 'system_featured', label: 'System: Featured Cards', icon: '📦', desc: 'Standard featured book, academy & reading cards', color: '#1A1B4B' },
  { type: 'system_about', label: 'System: Biography', icon: '👤', desc: 'Standard biography section of Radheshyam Das', color: '#1A1B4B' },
  { type: 'system_books', label: 'System: Shopify Books', icon: '📚', desc: 'Standard featured Shopify books grid', color: '#DA9B5B' },
  { type: 'system_youtube', label: 'System: YouTube Playlist', icon: '📺', desc: 'Standard recent YouTube lectures playlist', color: '#DC2626' }
];

// ─── Default props for each block type (Extended) ──────────────────────────────
const DEFAULT_PROPS = {
  system_hero_slides: {
    autoplayInterval: 5000,
    heroSlides: [
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
    ]
  },
  system_credentials: {},
  system_logos: {},
  system_featured: {},
  system_about: {
    heading: 'Radheshyam Das',
    avatar: 'https://lh3.googleusercontent.com/d/1MN4z91XjyCUFfuOPKDCeBse8TwAfJRVg',
    bio1: 'Radheshyam Das is an IIT Mumbai Topper who dedicated his life as a full-time monk, youth educator, and author. Born in a devout family near Madurai, his childhood was fascinated by Vedic chants and philosophical classics.',
    bio2: 'After top ranking at IIT Mumbai, working as a Senior Research Fellow and mechanical engineer at top companies, he took up the role of a celibate monk. He designed the DYS (Discover Your Self) and GAME (Gita for All Made Easy) course structures which are taught across leading universities.',
    background: '#FAF8F5'
  },
  system_books: {},
  system_youtube: {},
  hero: {
    title: 'Transform Your Life with Vedic Wisdom',
    subtitle: 'Join thousands of students on a journey of self-discovery and spiritual growth.',
    badge: '🌟 Featured Wisdom',
    background: '#1A1B4B',
    backgroundImage: '',
    overlayOpacity: 0.5,
    textColor: '#ffffff',
    subtitleColor: 'rgba(255,255,255,0.8)',
    align: 'left',
    titleSize: 48,
    subtitleSize: 18,
    ctaText: 'Explore Courses',
    ctaColor: 'linear-gradient(135deg, #FF9F1C, #E07A5F)',
    ctaTextColor: '#fff',
    secondaryCta: '',
    showStats: true,
    studentsCount: '5,000',
    rating: '4.9',
    duration: 'Self-paced',
    paddingY: 80,
    layoutMode: 'split',
    rightAssetType: 'image',
    rightImage: '',
    rightVideoUrl: '',
    rightImageHeight: 400,
    rightImageFit: 'cover',
  },
  text: {
    eyebrow: 'Introduction',
    heading: 'Discover the Path of Wisdom',
    headingSize: 32,
    headingColor: '#1A1B4B',
    content: 'Wisdom Eye is dedicated to bringing ancient philosophy and timeless teachings to modern life, helping you navigate career, relationships, and well-being.',
    textColor: '#4B5563',
    fontSize: 16,
    lineHeight: 1.8,
    align: 'left',
    background: '#fff',
    paddingY: 56,
    maxWidth: '800px',
  },
  rich_text: {
    content: '<h2><b>Empower Your Spiritual Journey</b></h2><p>Here you can write custom rich text content. Modify sizes, headings, add lists, links, or styles manually to highlight key concepts.</p>',
    background: '#ffffff',
    textColor: '#1f2937',
    paddingY: 48,
    maxWidth: '900px',
    align: 'left'
  },
  two_column: {
    leftType: 'text',
    leftHeading: 'Column One Heading',
    leftContent: 'This is the content of the left column. You can change this type to an image or YouTube video.',
    leftImage: '',
    leftVideoUrl: '',
    leftCtaText: '',
    leftCtaColor: '#FF9F1C',
    leftCtaTextColor: '#1A1B4B',
    rightType: 'image',
    rightEyebrow: '',
    rightHeading: '',
    rightContent: '',
    rightImage: '',
    rightVideoUrl: '',
    rightCtaText: '',
    rightCtaColor: '#FF9F1C',
    rightCtaTextColor: '#1A1B4B',
    background: '#fff',
    paddingY: 60,
    gap: 48,
    leftWidth: '50% 50%',
    imageShadow: true,
    imageHeight: 380,
    imageFit: 'cover',
  },
  three_column: {
    col1Heading: 'Veda studies',
    col1Content: 'Explore the depths of ancient texts and historical timelines.',
    col1Image: '',
    col2Heading: 'Meditation',
    col2Content: 'Practice daily mindfulness and deep spiritual introspection.',
    col2Image: '',
    col3Heading: 'Yoga & Living',
    col3Content: 'Bridging wellness philosophy to your daily work life.',
    col3Image: '',
    background: '#ffffff',
    paddingY: 60,
    textColor: '#4b5563',
    headingColor: '#1a1b4b',
    gap: 24
  },
  four_column: {
    col1Title: 'Bhakti Yoga',
    col1Text: 'The path of devotion.',
    col2Title: 'Jnana Yoga',
    col2Text: 'The path of knowledge.',
    col3Title: 'Karma Yoga',
    col3Text: 'The path of action.',
    col4Title: 'Raja Yoga',
    col4Text: 'The path of meditation.',
    background: '#fafafa',
    paddingY: 50,
    gap: 16
  },
  video: {
    url: '',
    title: 'Watch Latest Wisdom Video',
    background: '#0F0F0F',
    paddingY: 48,
  },
  image: {
    src: '',
    alt: '',
    caption: '',
    maxHeight: 500,
    borderRadius: 16,
    shadow: true,
    fit: 'contain',
    background: '#fff',
    paddingY: 32,
    maxWidth: '900px',
  },
  gallery: {
    title: 'Photo Gallery',
    images: [],
    columns: 3,
    background: '#ffffff',
    paddingY: 48,
    imageHeight: 250
  },
  features: {
    eyebrow: 'Our Features',
    heading: 'Core Offerings & Philosophy',
    subheading: 'Structured programs and community circles built around pure consciousness.',
    headingColor: '#1A1B4B',
    background: '#F8F9FE',
    accentColor: '#FF9F1C',
    columns: 3,
    iconPosition: 'top',
    paddingY: 60,
    items: [
      { icon: '🧘', title: 'Daily Meditation', text: 'Simple yet powerful mindfulness sessions held daily.' },
      { icon: '📖', title: 'Vedic Literature', text: 'Interactive scriptural courses based on standard Vedic texts.' },
      { icon: '👥', title: 'Community Support', text: 'Access global forums and local support circles.' }
    ],
  },
  stats: {
    background: '#1A1B4B',
    accentColor: '#FF9F1C',
    paddingY: 48,
    items: [
      { value: '10,000+', label: 'Seekers Guided' },
      { value: '150+', label: 'Classes Conducted' },
      { value: '30+', label: 'Spiritual Mentors' }
    ],
  },
  testimonials: {
    heading: 'Words of Inspiration',
    background: '#F0F2F5',
    paddingY: 64,
    autoplayInterval: 5000,
    items: [
      { name: 'Priya Sharma', role: 'Software Engineer', rating: 5, text: 'This platform completely transformed my perspective on work and devotion. Truly a blessing!' },
      { name: 'Rahul Mehta', role: 'Student', rating: 5, text: 'The courses are extremely systematic and deep. Highly recommended to everyone seeking truth.' }
    ],
  },
  team_cards: {
    heading: 'Spiritual Guides & Speakers',
    background: '#ffffff',
    paddingY: 60,
    items: [
      { name: 'Radheshyam Das', title: 'VOICE Director', bio: 'Renowned Vedic teacher with 30+ years of teaching experience.', avatar: '' }
    ]
  },
  timeline: {
    heading: 'Historical Journey',
    background: '#fafafa',
    paddingY: 60,
    items: [
      { title: 'Founding Voice', date: '1996', text: 'VOICE was founded to impart value-education classes.' },
      { title: 'Wisdom Eye Portal', date: '2024', text: 'Launched the online platform to expand access to seekers worldwide.' }
    ]
  },
  accordion: {
    heading: 'Frequently Asked Questions',
    background: '#fff',
    paddingY: 60,
    items: [
      { q: 'Who can enroll in these classes?', a: 'Anyone! Our programs are open to seekers of all ages, cultures, and levels of experience.' },
      { q: 'Is there any certification provided?', a: 'Yes, select structured courses offer certificates of participation upon course completion.' }
    ],
  },
  countdown: {
    heading: '🔥 Upcoming Masterclass Starts In',
    subheading: 'Register now to secure your spot for the live interactive Q&A session.',
    targetDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16),
    accentColor: '#FF9F1C',
    background: '#1A1B4B',
    expiredText: 'Session has started!',
    paddingY: 48,
  },
  cta: {
    heading: 'Ready to Deepen Your Understanding?',
    subheading: 'Start exploring our systematically curated programs today.',
    btnText: 'Explore Programs',
    btnColor: '#FF9F1C',
    btnTextColor: '#1A1B4B',
    background: 'linear-gradient(135deg, #1A1B4B, #2D1B69)',
    paddingY: 64,
    note: 'Free & premium courses available.',
  },
  divider: {
    height: 48,
    background: 'transparent',
    showLine: false,
    lineColor: '#E5E7EB',
  },
  banner: {
    text: '📢 Announcement: Live Gita discussion with Radheshyam Prabhu this Saturday 7 PM IST!',
    background: '#FF9F1C',
    textColor: '#1A1B4B',
    linkText: 'Register Here',
    linkUrl: '',
    paddingY: 12
  },
  html_embed: {
    html: '<div style="padding: 20px; border: 2px dashed #ccc; text-align: center;"><b>Custom Embed Area</b><br/>Paste map IFRAME, widgets, or custom HTML tags in the block properties panel.</div>',
    background: '#ffffff',
    paddingY: 24
  }
};

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

const PropsContext = createContext(null);

const Field = ({ label, children, hint }) => (
  <div style={{ marginBottom: '14px' }}>
    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</label>
    {children}
    {hint && <span style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '3px', display: 'block' }}>{hint}</span>}
  </div>
);

const Input = ({ field, type = 'text', placeholder = '', min, max, step }) => {
  const { p, set } = useContext(PropsContext);
  return (
    <input
      type={type}
      value={p[field] ?? ''}
      onChange={e => set(field, type === 'number' ? Number(e.target.value) : e.target.value)}
      placeholder={placeholder}
      min={min} max={max} step={step}
      style={inputStyle}
    />
  );
};

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

const ImageInput = ({ field, value, onChange, placeholder = 'https://...' }) => {
  const context = useContext(PropsContext);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const currentValue = value !== undefined ? value : (context?.p ? context.p[field] : '');
  const handleChange = onChange || (val => context?.set(field, val));

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

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
        alert(data.error || 'Upload failed');
        return;
      }

      handleChange(data.url);
    } catch (err) {
      console.error(err);
      alert('Error compressing or uploading image: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%' }}>
      <input
        type="text"
        value={currentValue ?? ''}
        onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inputStyle, flex: 1 }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current.click()}
        style={{
          background: '#EFF6FF',
          border: '1.5px solid #BFDBFE',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '11px',
          fontWeight: '700',
          color: '#1E40AF',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.15s'
        }}
      >
        {uploading ? (
          <>
            <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
            Uploading...
          </>
        ) : (
          <>🖼️ Upload</>
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
  );
};

const Textarea = ({ field, rows = 3, placeholder = '' }) => {
  const { p, set } = useContext(PropsContext);
  return (
    <textarea
      value={p[field] ?? ''}
      onChange={e => set(field, e.target.value)}
      rows={rows}
      placeholder={placeholder}
      style={{ ...inputStyle, resize: 'vertical', minHeight: `${rows * 24}px` }}
    />
  );
};

const Select = ({ field, options }) => {
  const { p, set } = useContext(PropsContext);
  return (
    <select value={p[field] ?? ''} onChange={e => set(field, e.target.value)} style={inputStyle}>
      {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  );
};

const Toggle = ({ field, label: tLabel }) => {
  const { p, set } = useContext(PropsContext);
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '10px' }}>
      <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: p[field] ? '#22C55E' : '#D1D5DB', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: '2px', left: p[field] ? '16px' : '2px', width: '16px', height: '16px', background: '#fff', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </div>
      <span style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>{tLabel}</span>
      <input type="checkbox" checked={!!p[field]} onChange={e => set(field, e.target.checked)} style={{ display: 'none' }} />
    </label>
  );
};

const ColorRow = ({ field, label: cLabel }) => {
  const { p, set } = useContext(PropsContext);
  return (
    <Field label={cLabel}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input type="color" value={p[field]?.startsWith('#') ? p[field] : '#1A1B4B'} onChange={e => set(field, e.target.value)} style={{ width: '36px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '2px' }} />
        <input type="text" value={p[field] ?? ''} onChange={e => set(field, e.target.value)} placeholder="#1A1B4B or gradient" style={{ ...inputStyle, flex: 1 }} />
      </div>
    </Field>
  );
};

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: '11px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', letterSpacing: '1px', padding: '10px 0 6px', borderBottom: '1px solid #F3F4F6', marginBottom: '12px' }}>
    {children}
  </div>
);

// ─── Properties Panel Component (Extended blocks properties) ──────────────────────────────────────
function PropsPanel({ block, onChange, onTypeChange }) {
  if (!block) return (
    <div style={{ padding: '32px 20px', textAlign: 'center', color: '#9CA3AF' }}>
      <Layers size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
      <p style={{ fontSize: '13px' }}>Click a block on the canvas to edit its properties</p>
    </div>
  );

  const p = block.props;
  const set = (key, val) => onChange({ ...block, props: { ...p, [key]: val } });

  const renderContent = () => {
    switch (block.type) {
      case 'hero': return (
        <div style={propsScroll}>
          <SectionTitle>Content</SectionTitle>
          <Field label="Badge Text"><Input field="badge" placeholder="🌟 Featured Wisdom" /></Field>
          <Field label="Main Title"><Textarea field="title" rows={2} /></Field>
          <Field label="Subtitle"><Textarea field="subtitle" rows={3} /></Field>
          <Field label="CTA Button Text"><Input field="ctaText" placeholder="Explore Courses" /></Field>
          <Field label="Secondary Button (optional)"><Input field="secondaryCta" placeholder="Watch Preview" /></Field>

          <SectionTitle>Design & Layout</SectionTitle>
          <Field label="Layout Style"><Select field="layoutMode" options={[{ value: 'split', label: 'Split (2 Columns)' }, { value: 'full_width', label: 'Full Width (Centered)' }]} /></Field>
          {p.layoutMode === 'split' && (
            <>
              <Field label="Right Asset Type"><Select field="rightAssetType" options={[{ value: 'image', label: 'Image' }, { value: 'video', label: 'YouTube Video' }, { value: 'none', label: 'None' }]} /></Field>
              {p.rightAssetType === 'image' && (
                <>
                  <Field label="Right Image"><ImageInput field="rightImage" placeholder="Upload or enter URL" /></Field>
                  <Field label="Right Image Height (px)"><Input field="rightImageHeight" type="number" min={100} max={800} /></Field>
                  <Field label="Right Image Fit"><Select field="rightImageFit" options={[{ value: 'cover', label: 'Cover (fill & crop)' }, { value: 'contain', label: 'Contain (fit inside)' }]} /></Field>
                </>
              )}
              {p.rightAssetType === 'video' && <Field label="Right YouTube Video URL"><Input field="rightVideoUrl" placeholder="https://youtube.com/watch?v=..." /></Field>}
            </>
          )}
          <ColorRow field="background" label="Background Color" />
          <Field label="Background Image"><ImageInput field="backgroundImage" placeholder="Upload or enter URL" /></Field>
          {p.backgroundImage && <Field label="Overlay Opacity (0–1)"><Input field="overlayOpacity" type="number" min={0} max={1} step={0.05} /></Field>}
          <Field label="Text Alignment"><Select field="align" options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }]} /></Field>
          <Field label="Title Size (px)"><Input field="titleSize" type="number" min={24} max={80} /></Field>
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" min={20} max={200} /></Field>

          <SectionTitle>Stats Row</SectionTitle>
          <Toggle field="showStats" label="Show stats below subtitle" />
          {p.showStats && <>
            <Field label="Students Count"><Input field="studentsCount" placeholder="5,000" /></Field>
            <Field label="Rating"><Input field="rating" placeholder="4.9" /></Field>
            <Field label="Duration Label"><Input field="duration" placeholder="Self-paced" /></Field>
          </>}
        </div>
      );

      case 'text': return (
        <div style={propsScroll}>
          <SectionTitle>Content</SectionTitle>
          <Field label="Eyebrow"><Input field="eyebrow" placeholder="Top label" /></Field>
          <Field label="Heading"><Input field="heading" placeholder="Main heading" /></Field>
          <Field label="Body Text"><Textarea field="content" rows={6} /></Field>

          <SectionTitle>Design</SectionTitle>
          <ColorRow field="background" label="Background" />
          <Field label="Text Alignment"><Select field="align" options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} /></Field>
          <Field label="Font Size (px)"><Input field="fontSize" type="number" min={12} max={24} /></Field>
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" min={20} max={160} /></Field>
        </div>
      );

      case 'rich_text': return (
        <div style={propsScroll}>
          <SectionTitle>Content</SectionTitle>
          <Field label="HTML Content" hint="Use standard HTML formatting tags like <b>, <i>, <ul>, <p>, <h2>"><Textarea field="content" rows={10} /></Field>
          <SectionTitle>Styling</SectionTitle>
          <ColorRow field="background" label="Background" />
          <ColorRow field="textColor" label="Text Color" />
          <Field label="Text Alignment"><Select field="align" options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} /></Field>
          <Field label="Max Width"><Input field="maxWidth" placeholder="900px" /></Field>
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" min={20} max={160} /></Field>
        </div>
      );

      case 'video': return (
        <div style={propsScroll}>
          <Field label="YouTube URL" hint="Paste any YouTube video URL"><Input field="url" placeholder="https://youtube.com/watch?v=..." /></Field>
          <Field label="Section Title"><Input field="title" placeholder="Watch Wisdom Introduction" /></Field>
          <ColorRow field="background" label="Background Color" />
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" min={20} max={120} /></Field>
        </div>
      );

      case 'image': return (
        <div style={propsScroll}>
          <Field label="Image URL"><ImageInput field="src" placeholder="Upload or enter URL" /></Field>
          <Field label="Alt Text"><Input field="alt" placeholder="Description for accessibility" /></Field>
          <Field label="Caption (optional)"><Input field="caption" /></Field>
          <Field label="Max Height (px)"><Input field="maxHeight" type="number" min={100} max={1000} /></Field>
          <Field label="Image Fit"><Select field="fit" options={[{ value: 'contain', label: 'Contain (fit inside)' }, { value: 'cover', label: 'Cover (fill & crop)' }]} /></Field>
          <Field label="Border Radius (px)"><Input field="borderRadius" type="number" min={0} max={40} /></Field>
          <Toggle field="shadow" label="Show drop shadow" />
          <ColorRow field="background" label="Section Background" />
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" min={0} max={120} /></Field>
        </div>
      );

      case 'gallery': return (
        <div style={propsScroll}>
          <SectionTitle>Content</SectionTitle>
          <Field label="Section Title"><Input field="title" /></Field>
          <Field label="Columns"><Select field="columns" options={[{ value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4' }]} /></Field>
          <Field label="Image Heights (px)"><Input field="imageHeight" type="number" /></Field>
          <ColorRow field="background" label="Background" />
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" /></Field>

          <SectionTitle>Gallery Items</SectionTitle>
          {(p.images || []).map((img, i) => (
            <div key={i} style={{ background: '#F9FAFB', borderRadius: '10px', padding: '12px', marginBottom: '10px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>Image {i + 1}</span>
                <button onClick={() => set('images', (p.images || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={14} /></button>
              </div>
              <ImageInput
                value={img.src || ''}
                onChange={val => set('images', (p.images || []).map((item, j) => j === i ? { ...item, src: val } : item))}
                placeholder="Upload image"
              />
              <input placeholder="Caption" value={img.caption || ''} onChange={e => set('images', (p.images || []).map((item, j) => j === i ? { ...item, caption: e.target.value } : item))} style={{ ...inputStyle, marginTop: '6px' }} />
            </div>
          ))}
          <button onClick={() => set('images', [...(p.images || []), { src: '', caption: '' }])} style={addItemBtn}><Plus size={13} /> Add Image</button>
        </div>
      );

      case 'features': return (
        <div style={propsScroll}>
          <SectionTitle>Heading</SectionTitle>
          <Field label="Eyebrow"><Input field="eyebrow" placeholder="What You Will Learn" /></Field>
          <Field label="Heading"><Input field="heading" placeholder="Highlights" /></Field>
          <Field label="Subheading"><Input field="subheading" /></Field>

          <SectionTitle>Layout</SectionTitle>
          <Field label="Columns"><Select field="columns" options={[{ value: 2, label: '2 columns' }, { value: 3, label: '3 columns' }, { value: 4, label: '4 columns' }]} /></Field>
          <ColorRow field="background" label="Background" />
          <ColorRow field="accentColor" label="Accent Color" />
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" min={20} max={160} /></Field>

          <SectionTitle>Feature Items</SectionTitle>
          {(p.items || []).map((item, i) => (
            <div key={i} style={{ background: '#F9FAFB', borderRadius: '10px', padding: '12px', marginBottom: '10px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>Item {i + 1}</span>
                <button onClick={() => set('items', (p.items || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '0' }}><X size={14} /></button>
              </div>
              <input placeholder="Emoji icon (e.g. 🧘)" value={item.icon || ''} onChange={e => set('items', (p.items || []).map((it, j) => j === i ? { ...it, icon: e.target.value } : it))} style={{ ...inputStyle, marginBottom: '6px' }} />
              <input placeholder="Title" value={item.title || ''} onChange={e => set('items', (p.items || []).map((it, j) => j === i ? { ...it, title: e.target.value } : it))} style={{ ...inputStyle, marginBottom: '6px' }} />
              <textarea placeholder="Description" value={item.text || ''} onChange={e => set('items', (p.items || []).map((it, j) => j === i ? { ...it, text: e.target.value } : it))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          ))}
          <button onClick={() => set('items', [...(p.items || []), { icon: '⭐', title: 'New Feature', text: 'Feature description here.' }])} style={addItemBtn}>
            <Plus size={13} /> Add Feature
          </button>
        </div>
      );

      case 'stats': return (
        <div style={propsScroll}>
          <ColorRow field="background" label="Background" />
          <ColorRow field="accentColor" label="Number Color" />
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" min={20} max={120} /></Field>
          <SectionTitle>Stats Items</SectionTitle>
          {(p.items || []).map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <input placeholder="Value (e.g. 50,000+)" value={item.value || ''} onChange={e => set('items', (p.items || []).map((it, j) => j === i ? { ...it, value: e.target.value } : it))} style={{ ...inputStyle, flex: 1 }} />
              <input placeholder="Label" value={item.label || ''} onChange={e => set('items', (p.items || []).map((it, j) => j === i ? { ...it, label: e.target.value } : it))} style={{ ...inputStyle, flex: 1 }} />
              <button onClick={() => set('items', (p.items || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={14} /></button>
            </div>
          ))}
          <button onClick={() => set('items', [...(p.items || []), { value: '1,000+', label: 'New Stat' }])} style={addItemBtn}><Plus size={13} /> Add Stat</button>
        </div>
      );

      case 'testimonials': return (
        <div style={propsScroll}>
          <Field label="Section Heading"><Input field="heading" /></Field>
          <ColorRow field="background" label="Background" />
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" min={20} max={160} /></Field>
          <Field label="Autoplay Speed (ms)" hint="Speed in milliseconds. E.g. 5000 for 5 seconds. Set to 0 to disable."><Input field="autoplayInterval" type="number" step={500} min={0} /></Field>
          <SectionTitle>Testimonial Items</SectionTitle>
          {(p.items || []).map((item, i) => (
            <div key={i} style={{ background: '#F9FAFB', borderRadius: '10px', padding: '12px', marginBottom: '10px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>Review {i + 1}</span>
                <button onClick={() => set('items', (p.items || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={14} /></button>
              </div>
              <input placeholder="Name" value={item.name || ''} onChange={e => set('items', (p.items || []).map((it, j) => j === i ? { ...it, name: e.target.value } : it))} style={{ ...inputStyle, marginBottom: '6px' }} />
              <input placeholder="Role / Title" value={item.role || ''} onChange={e => set('items', (p.items || []).map((it, j) => j === i ? { ...it, role: e.target.value } : it))} style={{ ...inputStyle, marginBottom: '6px' }} />
              <div style={{ marginBottom: '6px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#4B5563', marginBottom: '4px' }}>Avatar Image</label>
                <ImageInput
                  value={item.avatar || ''}
                  onChange={val => set('items', (p.items || []).map((it, j) => j === i ? { ...it, avatar: val } : it))}
                  placeholder="Upload avatar"
                />
              </div>
              <textarea placeholder="Review text" value={item.text || ''} onChange={e => set('items', (p.items || []).map((it, j) => j === i ? { ...it, text: e.target.value } : it))} rows={3} style={{ ...inputStyle, resize: 'vertical', marginBottom: '6px' }} />
              <select value={item.rating || 5} onChange={e => set('items', (p.items || []).map((it, j) => j === i ? { ...it, rating: Number(e.target.value) } : it))} style={inputStyle}>
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
              </select>
            </div>
          ))}
          <button onClick={() => set('items', [...(p.items || []), { name: 'Student Name', role: 'City', text: 'Amazing class!', rating: 5 }])} style={addItemBtn}><Plus size={13} /> Add Review</button>
        </div>
      );

      case 'team_cards': return (
        <div style={propsScroll}>
          <SectionTitle>Content</SectionTitle>
          <Field label="Section Heading"><Input field="heading" /></Field>
          <ColorRow field="background" label="Background" />
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" /></Field>

          <SectionTitle>Team Members</SectionTitle>
          {(p.items || []).map((item, i) => (
            <div key={i} style={{ background: '#F9FAFB', borderRadius: '10px', padding: '12px', marginBottom: '10px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>Member {i + 1}</span>
                <button onClick={() => set('items', (p.items || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={14} /></button>
              </div>
              <input placeholder="Name" value={item.name || ''} onChange={e => set('items', (p.items || []).map((it, j) => j === i ? { ...it, name: e.target.value } : it))} style={{ ...inputStyle, marginBottom: '6px' }} />
              <input placeholder="Title / Role" value={item.title || ''} onChange={e => set('items', (p.items || []).map((it, j) => j === i ? { ...it, title: e.target.value } : it))} style={{ ...inputStyle, marginBottom: '6px' }} />
              <div style={{ marginBottom: '6px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#4B5563', marginBottom: '4px' }}>Avatar Image</label>
                <ImageInput
                  value={item.avatar || ''}
                  onChange={val => set('items', (p.items || []).map((it, j) => j === i ? { ...it, avatar: val } : it))}
                  placeholder="Upload photo"
                />
              </div>
              <textarea placeholder="Bio" value={item.bio || ''} onChange={e => set('items', (p.items || []).map((it, j) => j === i ? { ...it, bio: e.target.value } : it))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          ))}
          <button onClick={() => set('items', [...(p.items || []), { name: 'Member Name', title: 'Role', bio: 'Short bio...', avatar: '' }])} style={addItemBtn}><Plus size={13} /> Add Member</button>
        </div>
      );

      case 'timeline': return (
        <div style={propsScroll}>
          <SectionTitle>Content</SectionTitle>
          <Field label="Section Heading"><Input field="heading" /></Field>
          <ColorRow field="background" label="Background" />
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" /></Field>

          <SectionTitle>Timeline Items</SectionTitle>
          {(p.items || []).map((item, i) => (
            <div key={i} style={{ background: '#F9FAFB', borderRadius: '10px', padding: '12px', marginBottom: '10px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>Step {i + 1}</span>
                <button onClick={() => set('items', (p.items || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={14} /></button>
              </div>
              <input placeholder="Date / Year (e.g. 2026)" value={item.date || ''} onChange={e => set('items', (p.items || []).map((it, j) => j === i ? { ...it, date: e.target.value } : it))} style={{ ...inputStyle, marginBottom: '6px' }} />
              <input placeholder="Title" value={item.title || ''} onChange={e => set('items', (p.items || []).map((it, j) => j === i ? { ...it, title: e.target.value } : it))} style={{ ...inputStyle, marginBottom: '6px' }} />
              <textarea placeholder="Text content" value={item.text || ''} onChange={e => set('items', (p.items || []).map((it, j) => j === i ? { ...it, text: e.target.value } : it))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          ))}
          <button onClick={() => set('items', [...(p.items || []), { title: 'New Milestone', date: '2026', text: 'Detail of milestone...' }])} style={addItemBtn}><Plus size={13} /> Add Timeline Step</button>
        </div>
      );

      case 'accordion': return (
        <div style={propsScroll}>
          <Field label="Section Heading"><Input field="heading" /></Field>
          <ColorRow field="background" label="Background" />
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" min={20} max={160} /></Field>
          <SectionTitle>Questions (Accordion)</SectionTitle>
          {(p.items || []).map((item, i) => (
            <div key={i} style={{ background: '#F9FAFB', borderRadius: '10px', padding: '12px', marginBottom: '10px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>Q&A {i + 1}</span>
                <button onClick={() => set('items', (p.items || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={14} /></button>
              </div>
              <input placeholder="Question" value={item.q || ''} onChange={e => set('items', (p.items || []).map((it, j) => j === i ? { ...it, q: e.target.value } : it))} style={{ ...inputStyle, marginBottom: '6px' }} />
              <textarea placeholder="Answer" value={item.a || ''} onChange={e => set('items', (p.items || []).map((it, j) => j === i ? { ...it, a: e.target.value } : it))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          ))}
          <button onClick={() => set('items', [...(p.items || []), { q: 'New Question?', a: 'Answer text...' }])} style={addItemBtn}><Plus size={13} /> Add Question</button>
        </div>
      );

      case 'countdown': return (
        <div style={propsScroll}>
          <Field label="Heading"><Input field="heading" /></Field>
          <Field label="Subheading"><Input field="subheading" /></Field>
          <Field label="Target Date & Time" hint="Pick when the countdown expires"><input type="datetime-local" value={p.targetDate || ''} onChange={e => set('targetDate', e.target.value)} style={inputStyle} /></Field>
          <Field label="Expired Message"><Input field="expiredText" placeholder="Offer has ended!" /></Field>
          <ColorRow field="background" label="Background" />
          <ColorRow field="accentColor" label="Number Color" />
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" min={20} max={120} /></Field>
        </div>
      );

      case 'cta': return (
        <div style={propsScroll}>
          <Field label="Heading"><Input field="heading" /></Field>
          <Field label="Subheading"><Input field="subheading" /></Field>
          <Field label="Button Text"><Input field="btnText" /></Field>
          <Field label="Fine Print / Note"><Input field="note" placeholder="30-Day Money-Back Guarantee" /></Field>
          <SectionTitle>Design</SectionTitle>
          <Field label="Background"><Input field="background" placeholder="gradient or hex" /></Field>
          <ColorRow field="btnColor" label="Button Color" />
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" /></Field>
        </div>
      );

      case 'two_column': return (
        <div style={propsScroll}>
          <SectionTitle>Left Column</SectionTitle>
          <Field label="Left Column Type"><Select field="leftType" options={[{ value: 'text', label: 'Text/CTA' }, { value: 'image', label: 'Image' }, { value: 'video', label: 'YouTube Video' }]} /></Field>
          {p.leftType === 'text' && (
            <>
              <Field label="Left Heading"><Input field="leftHeading" /></Field>
              <Field label="Left Body Text"><Textarea field="leftContent" rows={4} /></Field>
              <Field label="Left Button Text"><Input field="leftCtaText" placeholder="optional" /></Field>
            </>
          )}
          {p.leftType === 'image' && <Field label="Left Image"><ImageInput field="leftImage" placeholder="Upload or enter URL" /></Field>}
          {p.leftType === 'video' && <Field label="Left YouTube URL"><Input field="leftVideoUrl" placeholder="https://..." /></Field>}

          <SectionTitle>Right Column</SectionTitle>
          <Field label="Right Column Type"><Select field="rightType" options={[{ value: 'text', label: 'Text/CTA' }, { value: 'image', label: 'Image' }, { value: 'video', label: 'YouTube Video' }]} /></Field>
          {p.rightType === 'text' && (
            <>
              <Field label="Right Heading"><Input field="rightHeading" /></Field>
              <Field label="Right Body Text"><Textarea field="rightContent" rows={4} /></Field>
              <Field label="Right Button Text"><Input field="rightCtaText" placeholder="optional" /></Field>
            </>
          )}
          {p.rightType === 'image' && <Field label="Right Image"><ImageInput field="rightImage" placeholder="Upload or enter URL" /></Field>}
          {p.rightType === 'video' && <Field label="Right YouTube URL"><Input field="rightVideoUrl" placeholder="https://..." /></Field>}

          <SectionTitle>Design</SectionTitle>
          <ColorRow field="background" label="Background" />
          <Field label="Column Split Widths"><Input field="leftWidth" placeholder="50% 50% or 1.2fr 0.8fr" /></Field>
          <Field label="Gap (px)"><Input field="gap" type="number" min={0} max={120} /></Field>
          <Toggle field="imageShadow" label="Image drop shadow" />
          <Field label="Image Height (px)"><Input field="imageHeight" type="number" min={100} max={800} /></Field>
          <Field label="Image Fit"><Select field="imageFit" options={[{ value: 'cover', label: 'Cover' }, { value: 'contain', label: 'Contain' }]} /></Field>
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" min={20} max={160} /></Field>
        </div>
      );

      case 'three_column': return (
        <div style={propsScroll}>
          <ColorRow field="background" label="Background" />
          <ColorRow field="textColor" label="Text Color" />
          <ColorRow field="headingColor" label="Heading Color" />
          <Field label="Gap between columns (px)"><Input field="gap" type="number" /></Field>
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" /></Field>

          <SectionTitle>Column 1</SectionTitle>
          <Field label="Col 1 Heading"><Input field="col1Heading" /></Field>
          <Field label="Col 1 Text"><Textarea field="col1Content" /></Field>
          <Field label="Col 1 Image"><ImageInput field="col1Image" /></Field>

          <SectionTitle>Column 2</SectionTitle>
          <Field label="Col 2 Heading"><Input field="col2Heading" /></Field>
          <Field label="Col 2 Text"><Textarea field="col2Content" /></Field>
          <Field label="Col 2 Image"><ImageInput field="col2Image" /></Field>

          <SectionTitle>Column 3</SectionTitle>
          <Field label="Col 3 Heading"><Input field="col3Heading" /></Field>
          <Field label="Col 3 Text"><Textarea field="col3Content" /></Field>
          <Field label="Col 3 Image"><ImageInput field="col3Image" /></Field>
        </div>
      );

      case 'four_column': return (
        <div style={propsScroll}>
          <ColorRow field="background" label="Background" />
          <Field label="Gap between columns (px)"><Input field="gap" type="number" /></Field>
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" /></Field>

          <SectionTitle>Column 1</SectionTitle>
          <Field label="Title"><Input field="col1Title" /></Field>
          <Field label="Text"><Input field="col1Text" /></Field>
          <SectionTitle>Column 2</SectionTitle>
          <Field label="Title"><Input field="col2Title" /></Field>
          <Field label="Text"><Input field="col2Text" /></Field>
          <SectionTitle>Column 3</SectionTitle>
          <Field label="Title"><Input field="col3Title" /></Field>
          <Field label="Text"><Input field="col3Text" /></Field>
          <SectionTitle>Column 4</SectionTitle>
          <Field label="Title"><Input field="col4Title" /></Field>
          <Field label="Text"><Input field="col4Text" /></Field>
        </div>
      );

      case 'divider': return (
        <div style={propsScroll}>
          <Field label="Height (px)"><Input field="height" type="number" min={8} max={200} /></Field>
          <ColorRow field="background" label="Background Color" />
          <Toggle field="showLine" label="Show horizontal line" />
          {p.showLine && <ColorRow field="lineColor" label="Line Color" />}
        </div>
      );

      case 'banner': return (
        <div style={propsScroll}>
          <Field label="Banner Text"><Input field="text" /></Field>
          <ColorRow field="background" label="Banner Color" />
          <ColorRow field="textColor" label="Text Color" />
          <Field label="Link Text"><Input field="linkText" /></Field>
          <Field label="Link URL"><Input field="linkUrl" /></Field>
          <Field label="Padding Y (px)"><Input field="paddingY" type="number" /></Field>
        </div>
      );

      case 'html_embed': return (
        <div style={propsScroll}>
          <Field label="Raw HTML / Embed Code" hint="IFRAME, maps, widgets or raw HTML elements"><Textarea field="html" rows={12} /></Field>
          <ColorRow field="background" label="Background" />
          <Field label="Padding Y (px)"><Input field="paddingY" type="number" /></Field>
        </div>
      );

      case 'system_about': return (
        <div style={propsScroll}>
          <SectionTitle>Biography Content</SectionTitle>
          <Field label="Heading"><Input field="heading" /></Field>
          <Field label="Biography Image"><ImageInput field="avatar" /></Field>
          <Field label="Bio Paragraph 1"><Textarea field="bio1" rows={6} /></Field>
          <Field label="Bio Paragraph 2"><Textarea field="bio2" rows={6} /></Field>
          <ColorRow field="background" label="Background Color" />
        </div>
      );

      case 'system_hero_slides': return (
        <div style={propsScroll}>
          <SectionTitle>Hero Slider Settings</SectionTitle>
          <Field label="Autoplay Speed (ms)" hint="Speed in milliseconds. E.g. 5000 for 5 seconds. Set to 0 to disable."><Input field="autoplayInterval" type="number" step={500} min={0} /></Field>
          <SectionTitle>Slider Images</SectionTitle>
          {(p.heroSlides || []).map((slide, i) => (
            <div key={i} style={{ background: '#F9FAFB', borderRadius: '10px', padding: '12px', marginBottom: '10px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>Slide {i + 1}</span>
                <button onClick={() => set('heroSlides', (p.heroSlides || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={14} /></button>
              </div>
              <ImageInput
                value={slide || ''}
                onChange={val => set('heroSlides', (p.heroSlides || []).map((it, j) => j === i ? val : it))}
                placeholder="Upload slide image"
              />
            </div>
          ))}
          <button onClick={() => set('heroSlides', [...(p.heroSlides || []), ''])} style={addItemBtn}><Plus size={13} /> Add Slide Image</button>
        </div>
      );

      case 'system_logos': return (
        <div style={propsScroll}>
          <SectionTitle>Logos Slider Settings</SectionTitle>
          <Field label="Marquee Speed (seconds)" hint="Time to complete a full scroll loop. E.g. 25 seconds (lower = faster)."><Input field="autoplayInterval" type="number" step={1} min={2} /></Field>
        </div>
      );

      default: return (
        <div style={{ padding: '20px', color: '#9CA3AF', fontSize: '13px' }}>No properties for this block.</div>
      );
    }
  };

  return (
    <PropsContext.Provider value={{ p, set }}>
      {onTypeChange && block.type !== 'hero' && block.type !== '__row__' && (
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', background: '#FFFBEB' }}>
          <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>🔄 Swap Block Type</label>
          <select
            value={block.type}
            onChange={e => onTypeChange(block.id, e.target.value)}
            style={{ ...inputStyle, background: '#fff', borderColor: '#FDE68A', fontWeight: '700', color: '#B45309' }}
          >
            {BLOCK_TYPES.filter(bt => bt.type !== '__row__').map(bt => (
              <option key={bt.type} value={bt.type}>{bt.icon} {bt.label}</option>
            ))}
          </select>
        </div>
      )}
      {renderContent()}
    </PropsContext.Provider>
  );
}

// ─── Row Props Panel ──────────────────────────────────────────────────
function RowPropsPanel({ row, onUpdateRow }) {
  return (
    <div style={propsScroll}>
      <SectionTitle>Row Settings</SectionTitle>
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#1E40AF', marginBottom: '14px' }}>
        💡 Drag the <strong>blue handle</strong> between columns in the canvas to resize them. Click a block inside the row to edit its properties.
      </div>
      <Field label="Row Background">
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input type="color" value={row.rowBackground?.startsWith('#') ? row.rowBackground : '#ffffff'} onChange={e => onUpdateRow({ ...row, rowBackground: e.target.value })} style={{ width: '36px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '2px' }} />
          <input type="text" value={row.rowBackground ?? ''} onChange={e => onUpdateRow({ ...row, rowBackground: e.target.value })} placeholder="#fff or transparent" style={{ ...inputStyle, flex: 1 }} />
        </div>
      </Field>
      <Field label="Row Padding (px)">
        <input type="number" value={row.rowPadding ?? 0} onChange={e => onUpdateRow({ ...row, rowPadding: Number(e.target.value) })} min={0} max={80} style={inputStyle} />
      </Field>
      <Field label="Gap Between Columns (px)">
        <input type="number" value={row.rowGap ?? 0} onChange={e => onUpdateRow({ ...row, rowGap: Number(e.target.value) })} min={0} max={60} style={inputStyle} />
      </Field>
      <Field label="Vertical Alignment">
        <select value={row.rowAlign ?? 'stretch'} onChange={e => onUpdateRow({ ...row, rowAlign: e.target.value })} style={inputStyle}>
          <option value="stretch">Stretch (equal height)</option>
          <option value="flex-start">Top</option>
          <option value="center">Center</option>
          <option value="flex-end">Bottom</option>
        </select>
      </Field>
    </div>
  );
}

// ─── Main Page Builder ───────────────────────────────────────────────
export default function SiteBuilderEditorPage() {
  const { slug: rawSlug } = useParams();
  const router = useRouter();
  const pageSlug = decodeURIComponent(rawSlug);

  const [pageData, setPageData] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [previewActive, setPreviewActive] = useState(false);
  
  // Viewport / device size settings
  const [viewport, setViewport] = useState('desktop');

  // History stack for Undo/Redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const dragItem = useRef(null);
  const dragFromPalette = useRef(null);
  const resizingRef = useRef(null);

  // Push new state to history for undo/redo
  const pushToHistory = useCallback((newBlocks) => {
    const serialized = JSON.stringify(newBlocks);
    setHistory(prev => {
      const updated = prev.slice(0, historyIndex + 1);
      if (updated[updated.length - 1] === serialized) return prev;
      const next = [...updated, serialized];
      if (next.length > 50) next.shift(); // limit to 50 steps
      setHistoryIndex(next.length - 1);
      return next;
    });
  }, [historyIndex]);

  // Sync state with manual sets
  const setBlocksWithHistory = (newBlocks, recordHistory = true) => {
    setBlocks(newBlocks);
    if (recordHistory) {
      pushToHistory(newBlocks);
    }
  };

  // Load existing layout
  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/site-pages/${encodeURIComponent(pageSlug)}`);
      if (!res.ok) { router.push('/lms-admin/site-builder'); return; }
      const data = await res.json();
      setPageData(data.page);
      setIsPublished(!!data.page.is_published);
      const initialBlocks = data.page.blocks || [];
      setBlocks(initialBlocks);
      setHistory([JSON.stringify(initialBlocks)]);
      setHistoryIndex(0);
      setLoading(false);
    };
    load();
  }, [pageSlug]);

  // Keyboard undo/redo trigger
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const parsed = JSON.parse(history[prevIdx]);
      setBlocks(parsed);
      setHistoryIndex(prevIdx);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const parsed = JSON.parse(history[nextIdx]);
      setBlocks(parsed);
      setHistoryIndex(nextIdx);
    }
  };

  // ── Helper: find block anywhere (top-level or inside a row) ──────
  const findBlock = useCallback((blockId) => {
    for (const b of blocks) {
      if (b.id === blockId) return { block: b, rowId: null };
      if (b.type === '__row__') {
        for (const col of b.columns) {
          if (col.block.id === blockId) return { block: col.block, rowId: b.id };
        }
      }
    }
    return null;
  }, [blocks]);

  const selectedEntry = selectedId ? findBlock(selectedId) : null;
  const selectedBlock = selectedEntry?.block ?? null;
  const selectedRow = selectedRowId ? blocks.find(b => b.id === selectedRowId) : null;

  const createBlock = (type) => {
    if (type === 'two_column') {
      return {
        id: genId(),
        type: '__row__',
        rowBackground: 'transparent',
        rowPadding: 0,
        rowGap: 16,
        rowAlign: 'stretch',
        columns: [
          {
            width: 50,
            block: { id: genId(), type: 'text', props: { ...DEFAULT_PROPS.text, eyebrow: 'Column One', heading: 'Left Column Content', content: 'You can drag any block here or customize this text.' } }
          },
          {
            width: 50,
            block: { id: genId(), type: 'image', props: { ...DEFAULT_PROPS.image, src: '' } }
          }
        ]
      };
    }
    return { id: genId(), type, props: { ...(DEFAULT_PROPS[type] || {}) } };
  };

  // ── Add top-level block ──────────────────────────────────────────
  const addBlock = (type, afterIdx = blocks.length - 1) => {
    const newBlock = createBlock(type);
    const newBlocks = [...blocks];
    newBlocks.splice(afterIdx + 1, 0, newBlock);
    setBlocksWithHistory(newBlocks);
    if (type === 'two_column') {
      setSelectedRowId(newBlock.id);
      setSelectedId(null);
    } else {
      setSelectedId(newBlock.id);
      setSelectedRowId(null);
    }
  };

  // ── Delete a top-level block or entire row ───────────────────────
  const deleteBlock = (blockId) => {
    const filtered = blocks.filter(bl => bl.id !== blockId);
    setBlocksWithHistory(filtered);
    if (selectedId === blockId) setSelectedId(null);
    if (selectedRowId === blockId) setSelectedRowId(null);
  };

  // ── Delete a column from a row ───────────────────────────────────
  const deleteColumnFromRow = (rowId, colIdx) => {
    const updated = blocks.map(b => {
      if (b.id !== rowId) return b;
      const newCols = b.columns.filter((_, i) => i !== colIdx);
      if (newCols.length === 0) return null;
      const even = 100 / newCols.length;
      return { ...b, columns: newCols.map(c => ({ ...c, width: even })) };
    }).filter(Boolean);
    setBlocksWithHistory(updated);
    setSelectedId(null);
  };

  // ── Duplicate top-level block ────────────────────────────────────
  const duplicateBlock = (idx) => {
    const block = blocks[idx];
    const copy = { ...block, id: genId(), props: JSON.parse(JSON.stringify(block.props || {})) };
    if (block.type === '__row__') {
      copy.columns = block.columns.map(col => ({
        ...col,
        block: { ...col.block, id: genId(), props: JSON.parse(JSON.stringify(col.block.props)) }
      }));
    }
    const nb = [...blocks];
    nb.splice(idx + 1, 0, copy);
    setBlocksWithHistory(nb);
    setSelectedId(copy.id);
  };

  // ── Move top-level block ─────────────────────────────────────────
  const moveBlock = (idx, dir) => {
    const nb = [...blocks];
    const target = idx + dir;
    if (target < 0 || target >= nb.length) return;
    [nb[idx], nb[target]] = [nb[target], nb[idx]];
    setBlocksWithHistory(nb);
  };

  // ── Update a block (top-level or inside row) ─────────────────────
  const updateBlock = (updated) => {
    const updatedBlocks = blocks.map(b => {
      if (b.id === updated.id) return updated;
      if (b.type === '__row__') {
        return {
          ...b,
          columns: b.columns.map(col =>
            col.block.id === updated.id ? { ...col, block: updated } : col
          )
        };
      }
      return b;
    });
    // Throttle or debounce histories for text edits can be done, but for simplicity:
    setBlocksWithHistory(updatedBlocks);
  };

  // ── Change type of a block (swap) ────────────────────────────────
  const changeBlockType = (blockId, newType) => {
    const updated = blocks.map(b => {
      if (b.id === blockId) {
        return { ...b, type: newType, props: { ...(DEFAULT_PROPS[newType] || {}) } };
      }
      if (b.type === '__row__') {
        return {
          ...b,
          columns: b.columns.map(col =>
            col.block.id === blockId
              ? { ...col, block: { ...col.block, type: newType, props: { ...(DEFAULT_PROPS[newType] || {}) } } }
              : col
          )
        };
      }
      return b;
    });
    setBlocksWithHistory(updated);
    setTimeout(() => {
      setSelectedId(blockId);
    }, 50);
  };

  // ── Update row-level settings ────────────────────────────────────
  const updateRow = (updatedRow) => {
    const updated = blocks.map(b => b.id === updatedRow.id ? updatedRow : b);
    setBlocksWithHistory(updated);
  };

  // ── Wrap a top-level block in a row (add column beside it) ───────
  const wrapInRow = (blockIdx) => {
    const block = blocks[blockIdx];
    if (block.type === '__row__') return;
    const newBlock = { id: genId(), type: 'text', props: { ...DEFAULT_PROPS.text } };
    const row = {
      id: genId(),
      type: '__row__',
      rowBackground: 'transparent',
      rowPadding: 0,
      rowGap: 16,
      rowAlign: 'stretch',
      columns: [
        { width: 50, block },
        { width: 50, block: newBlock },
      ],
    };
    const nb = [...blocks];
    nb.splice(blockIdx, 1, row);
    setBlocksWithHistory(nb);
    setSelectedId(null);
    setSelectedRowId(row.id);
  };

  // ── Add column to existing row ───────────────────────────────────
  const addColumnToRow = (rowId) => {
    const updated = blocks.map(b => {
      if (b.id !== rowId) return b;
      const newBlock = { id: genId(), type: 'text', props: { ...DEFAULT_PROPS.text } };
      const newCols = [...b.columns, { width: 0, block: newBlock }];
      const even = 100 / newCols.length;
      return { ...b, columns: newCols.map(c => ({ ...c, width: even })) };
    });
    setBlocksWithHistory(updated);
  };

  // ── Drag canvas block ────────────────────────────────────────────
  const handleDragStart = (e, idx) => {
    dragItem.current = idx;
    dragFromPalette.current = null;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handlePaletteDragStart = (e, type) => {
    dragFromPalette.current = type;
    dragItem.current = null;
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };

  const handleDrop = (e, dropIdx) => {
    e.preventDefault();
    setDragOverIdx(null);

    if (dragFromPalette.current) {
      const type = dragFromPalette.current;
      const newBlock = createBlock(type);
      const nb = [...blocks];
      nb.splice(dropIdx, 0, newBlock);
      setBlocksWithHistory(nb);
      if (type === 'two_column') {
        setSelectedRowId(newBlock.id);
        setSelectedId(null);
      } else {
        setSelectedId(newBlock.id);
        setSelectedRowId(null);
      }
      dragFromPalette.current = null;
      return;
    }

    if (dragItem.current === null || dragItem.current === dropIdx) return;
    const nb = [...blocks];
    const [moved] = nb.splice(dragItem.current, 1);
    const adjustedDrop = dragItem.current < dropIdx ? dropIdx - 1 : dropIdx;
    nb.splice(adjustedDrop, 0, moved);
    setBlocksWithHistory(nb);
    dragItem.current = null;
  };

  // ── Column resize drag ───────────────────────────────────────────
  const startColumnResize = (e, rowId, dividerIdx) => {
    e.preventDefault();
    e.stopPropagation();
    const row = blocks.find(b => b.id === rowId);
    if (!row) return;
    const startX = e.clientX;
    const startWidths = row.columns.map(c => c.width);
    resizingRef.current = { rowId, dividerIdx, startX, startWidths };

    const onMouseMove = (ev) => {
      if (!resizingRef.current) return;
      const { rowId, dividerIdx, startX, startWidths } = resizingRef.current;
      const rowEl = document.getElementById(`row-${rowId}`);
      if (!rowEl) return;
      const totalWidth = rowEl.getBoundingClientRect().width;
      const dx = ev.clientX - startX;
      const dPct = (dx / totalWidth) * 100;

      const updated = blocks.map(b => {
        if (b.id !== rowId) return b;
        const newWidths = [...startWidths];
        const minPct = 10;
        newWidths[dividerIdx] = Math.max(minPct, Math.min(startWidths[dividerIdx] + dPct, 100 - minPct * (b.columns.length - 1)));
        newWidths[dividerIdx + 1] = Math.max(minPct, startWidths[dividerIdx] + startWidths[dividerIdx + 1] - newWidths[dividerIdx]);
        return { ...b, columns: b.columns.map((col, i) => ({ ...col, width: newWidths[i] })) };
      });
      setBlocks(updated); // temporary set during resize move (no history logged yet)
    };

    const onMouseUp = () => {
      if (resizingRef.current) {
        // Push final resized width to history stack
        const finalRow = blocks.find(b => b.id === resizingRef.current.rowId);
        if (finalRow) {
          pushToHistory(blocks);
        }
      }
      resizingRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // ── Drag paddingY handle ───────────────────────────────────────────
  const startPaddingYResize = (e, blockId, initialPaddingY) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    resizingRef.current = { blockId, startY, initialPaddingY };

    const onMouseMove = (ev) => {
      if (!resizingRef.current) return;
      const { blockId, startY, initialPaddingY } = resizingRef.current;
      const dy = ev.clientY - startY;
      
      // 4px steps sizing sensitivity
      const newPaddingY = Math.max(0, Math.min(240, initialPaddingY + Math.round(dy / 4) * 4));

      setBlocks(prev => prev.map(b => {
        if (b.id === blockId) {
          return { ...b, props: { ...b.props, paddingY: newPaddingY } };
        }
        if (b.type === '__row__') {
          return {
            ...b,
            columns: b.columns.map(col =>
              col.block.id === blockId
                ? { ...col, block: { ...col.block, props: { ...col.block.props, paddingY: newPaddingY } } }
                : col
            )
          };
        }
        return b;
      }));
    };

    const onMouseUp = () => {
      if (resizingRef.current) {
        pushToHistory(blocks);
      }
      resizingRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/site-pages/${encodeURIComponent(pageSlug)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Save failed.'); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { setError('An error occurred.'); }
    finally { setSaving(false); }
  };

  const handleTogglePublish = async () => {
    const nextState = !isPublished;
    setIsPublished(nextState);
    try {
      const res = await fetch(`/api/site-pages/${encodeURIComponent(pageSlug)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_published: nextState
        }),
      });
      if (!res.ok) {
        setIsPublished(!nextState); // Rollback
        const data = await res.json();
        setError(data.error || 'Failed to update publish status.');
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      setIsPublished(!nextState); // Rollback
      setError('An error occurred updating publish status.');
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F2F5' }}>
      <div style={{ textAlign: 'center' }}>
        <Loader2 size={36} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
        <p style={{ color: '#6B7280', fontSize: '14px' }}>Loading Visual Editor…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const blockLabel = BLOCK_TYPES.find(bt => bt.type === selectedBlock?.type);

  const panelTitle = selectedRow && !selectedBlock
    ? '⬜ Row Settings'
    : selectedBlock
      ? `${blockLabel?.icon || ''} ${blockLabel?.label || 'Block'} Properties`
      : 'Properties';

  const viewportWidth = viewport === 'tablet' ? '768px' : viewport === 'mobile' ? '375px' : '100%';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#F0F2F5', fontFamily: 'Outfit, Inter, sans-serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
        .block-hover:hover .block-actions { opacity: 1 !important; }
        .block-hover:hover .resize-handle-paddingY { opacity: 1 !important; }
        .palette-item:hover { background: #F3F4F6 !important; border-color: #D1D5DB !important; }
        .palette-item:active { transform: scale(0.97); }
        .canvas-block { animation: fadeIn 0.2s ease; }
        .col-resize-handle { cursor: col-resize; }
        .col-resize-handle:hover { background: rgba(99,102,241,0.3) !important; }
        .col-resize-handle:active { background: rgba(99,102,241,0.5) !important; }
        .resize-handle-paddingY {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 10px;
          cursor: ns-resize;
          background: rgba(255, 159, 28, 0.15);
          border-bottom: 2px dashed #FF9F1C;
          opacity: 0;
          transition: opacity 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1A1B4B;
          font-size: 8px;
          font-weight: 800;
        }
      `}</style>

      {/* ── Top Toolbar ─────────────────────────────────────── */}
      <div style={{ background: '#1A1B4B', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '16px', height: '56px', flexShrink: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.2)', zIndex: 100 }}>
        <Link href="/lms-admin/site-builder" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none', paddingRight: '16px', borderRight: '1px solid rgba(255,255,255,0.15)' }}>
          <ArrowLeft size={14} /> Back
        </Link>

        <div style={{ flex: 1 }}>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>🌐 Site Builder Editor</span>
          {pageData?.title && <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginLeft: '10px' }}>— {pageData.title} ({pageData.slug})</span>}
        </div>

        {/* Undo/Redo Buttons */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.06)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo (Ctrl+Z)"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: historyIndex <= 0 ? 'rgba(255,255,255,0.2)' : '#fff', padding: '4px 8px', borderRadius: '4px', transition: 'all 0.1s' }}
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo (Ctrl+Y)"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: historyIndex >= history.length - 1 ? 'rgba(255,255,255,0.2)' : '#fff', padding: '4px 8px', borderRadius: '4px', transition: 'all 0.1s' }}
          >
            <Redo2 size={15} />
          </button>
        </div>

        {/* Viewport Toggles */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.06)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => setViewport('desktop')}
            title="Desktop view"
            style={{ background: viewport === 'desktop' ? '#FF9F1C' : 'none', border: 'none', cursor: 'pointer', color: viewport === 'desktop' ? '#1A1B4B' : 'rgba(255,255,255,0.6)', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
          >
            <Monitor size={15} />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            title="Tablet view"
            style={{ background: viewport === 'tablet' ? '#FF9F1C' : 'none', border: 'none', cursor: 'pointer', color: viewport === 'tablet' ? '#1A1B4B' : 'rgba(255,255,255,0.6)', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
          >
            <Tablet size={15} />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            title="Mobile view"
            style={{ background: viewport === 'mobile' ? '#FF9F1C' : 'none', border: 'none', cursor: 'pointer', color: viewport === 'mobile' ? '#1A1B4B' : 'rgba(255,255,255,0.6)', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
          >
            <Smartphone size={15} />
          </button>
        </div>

        {error && <span style={{ color: '#F87171', fontSize: '12px' }}>⚠️ {error}</span>}

        <button onClick={() => setPreviewActive(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', background: 'none', border: '1px solid rgba(255,255,255,0.15)', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', outline: 'none' }}>
          <Eye size={14} /> Live Preview
        </button>

        <button 
          onClick={handleTogglePublish} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            color: isPublished ? '#15803d' : '#b45309', 
            fontSize: '13px', 
            background: isPublished ? '#dcfce7' : '#fef3c7', 
            border: 'none', 
            padding: '8px 14px', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            transition: 'all 0.2s', 
            fontWeight: '700',
            outline: 'none' 
          }}
          title={isPublished ? "Click to set page as Draft" : "Click to Publish Live"}
        >
          {isPublished ? <><Eye size={14} /> Live (Published)</> : <><EyeOff size={14} /> Draft</>}
        </button>

        <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: saved ? '#22C55E' : '#FF9F1C', color: saved ? '#fff' : '#1A1B4B', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', minWidth: '100px', justifyContent: 'center' }}>
          {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save</>}
        </button>
      </div>

      {/* ── Three-panel layout ───────────────────────────────── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr 320px', overflow: 'hidden' }}>

        {/* LEFT — Block Palette */}
        <div style={{ background: '#fff', borderRight: '1px solid #E5E7EB', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
            <h3 style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Block Library</h3>
            <p style={{ fontSize: '11px', color: '#D1D5DB', margin: '4px 0 0' }}>Drag onto canvas or click +</p>
          </div>
          <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {BLOCK_TYPES.map(bt => (
              <div
                key={bt.type}
                draggable
                onDragStart={e => handlePaletteDragStart(e, bt.type)}
                onClick={() => addBlock(bt.type)}
                className="palette-item"
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: '1px solid transparent', cursor: 'grab', transition: 'all 0.15s', userSelect: 'none' }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0, width: '28px', textAlign: 'center' }}>{bt.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#1A1B4B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bt.label}</div>
                  <div style={{ fontSize: '10px', color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bt.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER — Canvas */}
        <div style={{ overflowY: 'auto', background: '#E5E7EB', padding: '24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: viewportWidth, transition: 'max-width 0.3s ease' }}>
            {/* Drop zone at top */}
            <DropZone idx={0} dragOverIdx={dragOverIdx} onDragOver={handleDragOver} onDrop={handleDrop} onDragLeave={() => setDragOverIdx(null)} />

            {blocks.length === 0 && (
              <div
                onDragOver={e => { e.preventDefault(); setDragOverIdx(0); }}
                onDrop={e => handleDrop(e, 0)}
                style={{ background: '#fff', borderRadius: '16px', border: '2px dashed #D1D5DB', padding: '60px 32px', textAlign: 'center', cursor: 'default' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1A1B4B', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>Start Building Your Custom Page</h3>
                <p style={{ fontSize: '14px', color: '#9CA3AF', maxWidth: '360px', margin: '0 auto 24px' }}>
                  Drag blocks from the left library onto this canvas, or click any block to append it.
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {['hero', 'features', 'cta'].map(type => {
                    const bt = BLOCK_TYPES.find(b => b.type === type);
                    return (
                      <button key={type} onClick={() => addBlock(type)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: '9999px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                        {bt.icon} {bt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {blocks.map((block, idx) => {
              const isRowBlock = block.type === '__row__';
              const isSelected = !isRowBlock && selectedId === block.id;
              const isRowSelected = isRowBlock && (selectedRowId === block.id || block.columns.some(c => c.block.id === selectedId));

              return (
                <div key={block.id} className="canvas-block" style={{ width: '100%' }}>
                  {isRowBlock ? (
                    /* ── Row Container ── */
                    <div
                      id={`row-${block.id}`}
                      onClick={e => { if (e.target === e.currentTarget || e.currentTarget.contains(e.target)) { setSelectedRowId(block.id); setSelectedId(null); } }}
                      style={{
                        position: 'relative',
                        background: block.rowBackground && block.rowBackground !== 'transparent' ? block.rowBackground : 'transparent',
                        borderRadius: '12px',
                        border: `2px solid ${isRowSelected ? '#6366F1' : 'transparent'}`,
                        boxShadow: isRowSelected ? '0 0 0 3px rgba(99,102,241,0.2)' : '0 2px 8px rgba(0,0,0,0.06)',
                        marginBottom: '4px',
                        overflow: 'visible',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                        padding: `${block.rowPadding ?? 0}px`,
                      }}>

                      {/* Row label bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: isRowSelected ? 'rgba(99,102,241,0.08)' : '#F3F4F6', borderRadius: '10px 10px 0 0', borderBottom: '1px solid #E5E7EB', marginBottom: '0' }}>
                        <Columns size={13} color={isRowSelected ? '#6366F1' : '#9CA3AF'} />
                        <span style={{ fontSize: '11px', fontWeight: '700', color: isRowSelected ? '#6366F1' : '#9CA3AF', flex: 1 }}>
                          Row — {block.columns.length} columns
                        </span>
                        <div className="block-actions" style={{ display: 'flex', gap: '4px', opacity: isRowSelected ? 1 : 0, transition: 'opacity 0.15s' }}>
                          <button title="Add Column" onClick={e => { e.stopPropagation(); addColumnToRow(block.id); }} style={{ ...actionBtn, color: '#6366F1', borderColor: '#C7D2FE' }}><Plus size={12} /></button>
                          <button title="Move Up" onClick={e => { e.stopPropagation(); moveBlock(idx, -1); }} style={actionBtn}><ChevronUp size={12} /></button>
                          <button title="Move Down" onClick={e => { e.stopPropagation(); moveBlock(idx, 1); }} style={actionBtn}><ChevronDown size={12} /></button>
                          <button title="Duplicate" onClick={e => { e.stopPropagation(); duplicateBlock(idx); }} style={actionBtn}><Copy size={12} /></button>
                          <button title="Delete Row" onClick={e => { e.stopPropagation(); deleteBlock(block.id); }} style={{ ...actionBtn, color: '#DC2626' }}><Trash2 size={12} /></button>
                        </div>
                      </div>

                      {/* Columns */}
                      <div style={{
                        display: 'flex',
                        gap: '0',
                        alignItems: block.rowAlign ?? 'stretch',
                        background: '#fff',
                        borderRadius: '0 0 10px 10px',
                        overflow: 'hidden',
                      }}>
                        {block.columns.map((col, colIdx) => {
                          const isColBlockSelected = selectedId === col.block.id;
                          const bt = BLOCK_TYPES.find(b => b.type === col.block.type);
                          return (
                            <div key={col.block.id} style={{ display: 'flex', flex: 'none', width: `${col.width}%`, position: 'relative', minWidth: 0 }}>
                              {/* Column content */}
                              <div
                                onClick={e => { e.stopPropagation(); setSelectedId(col.block.id); setSelectedRowId(block.id); }}
                                className="block-hover"
                                style={{
                                  flex: 1,
                                  minWidth: 0,
                                  border: `2px solid ${isColBlockSelected ? '#FF9F1C' : 'transparent'}`,
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  background: '#fff',
                                  transition: 'border-color 0.15s',
                                  position: 'relative',
                                  overflow: 'hidden',
                                }}>
                                {/* Column header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 8px', background: isColBlockSelected ? '#FFF8EE' : '#FAFAFA', borderBottom: '1px solid #F3F4F6' }}>
                                  <span style={{ fontSize: '10px', fontWeight: '700', color: isColBlockSelected ? '#FF9F1C' : '#9CA3AF', flex: 1 }}>
                                    {bt?.icon} {bt?.label || col.block.type}
                                  </span>
                                  <span style={{ fontSize: '9px', color: '#D1D5DB', fontWeight: '500' }}>{Math.round(col.width)}%</span>
                                  <div className="block-actions" style={{ display: 'flex', gap: '2px', opacity: isColBlockSelected ? 1 : 0, transition: 'opacity 0.15s' }}>
                                    <button title="Delete Column" onClick={e => { e.stopPropagation(); deleteColumnFromRow(block.id, colIdx); }} style={{ ...actionBtn, padding: '2px 5px', color: '#DC2626' }}><X size={11} /></button>
                                  </div>
                                </div>
                                <BlockPreview block={col.block} />
                                
                                {/* PaddingY Resize handle on column block (or sub block) */}
                                <div
                                  className="resize-handle-paddingY"
                                  onMouseDown={e => startPaddingYResize(e, col.block.id, col.block.props?.paddingY || 40)}
                                  title="Drag Y-Padding"
                                >
                                  ↕ Padding: {col.block.props?.paddingY || 40}px
                                </div>
                              </div>

                              {/* Resize handle (between columns) */}
                              {colIdx < block.columns.length - 1 && (
                                <div
                                  className="col-resize-handle"
                                  onMouseDown={e => startColumnResize(e, block.id, colIdx)}
                                  title="Drag to resize columns"
                                  style={{
                                    width: '8px',
                                    flexShrink: 0,
                                    background: isRowSelected ? 'rgba(99,102,241,0.15)' : 'rgba(0,0,0,0.04)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    zIndex: 10,
                                    transition: 'background 0.15s',
                                  }}>
                                  <div style={{ width: '2px', height: '24px', background: isRowSelected ? '#6366F1' : '#D1D5DB', borderRadius: '2px', opacity: isRowSelected ? 0.8 : 0.5 }} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* ── Regular Block ── */
                    <div
                      draggable
                      onDragStart={e => handleDragStart(e, idx)}
                      onDragOver={e => handleDragOver(e, idx + 1)}
                      onDrop={e => handleDrop(e, idx + 1)}
                      onDragLeave={() => setDragOverIdx(null)}
                      onClick={() => { setSelectedId(block.id); setSelectedRowId(null); }}
                      className="block-hover"
                      style={{
                        position: 'relative',
                        background: '#fff',
                        borderRadius: '12px',
                        border: `2px solid ${isSelected ? '#FF9F1C' : 'transparent'}`,
                        marginBottom: '4px',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        boxShadow: isSelected ? '0 0 0 3px rgba(255,159,28,0.2)' : '0 2px 8px rgba(0,0,0,0.06)',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}>
                      {/* Block label bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: isSelected ? '#FFF8EE' : '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
                        <GripVertical size={14} color="#D1D5DB" style={{ cursor: 'grab', flexShrink: 0 }} />
                        <span style={{ fontSize: '11px', fontWeight: '700', color: isSelected ? '#FF9F1C' : '#9CA3AF', flex: 1 }}>
                          {BLOCK_TYPES.find(b => b.type === block.type)?.icon} {BLOCK_TYPES.find(b => b.type === block.type)?.label || block.type}
                        </span>
                        {/* Actions */}
                        <div className="block-actions" style={{ display: 'flex', gap: '4px', opacity: isSelected ? 1 : 0, transition: 'opacity 0.15s' }}>
                          <button title="Split into columns (add beside)" onClick={e => { e.stopPropagation(); wrapInRow(idx); }} style={{ ...actionBtn, color: '#6366F1', borderColor: '#C7D2FE', fontSize: '10px', gap: '3px' }}>
                            <SplitSquareHorizontal size={12} /> Split
                          </button>
                          <button title="Move Up" onClick={e => { e.stopPropagation(); moveBlock(idx, -1); }} style={actionBtn}><ChevronUp size={12} /></button>
                          <button title="Move Down" onClick={e => { e.stopPropagation(); moveBlock(idx, 1); }} style={actionBtn}><ChevronDown size={12} /></button>
                          <button title="Duplicate" onClick={e => { e.stopPropagation(); duplicateBlock(idx); }} style={actionBtn}><Copy size={12} /></button>
                          <button title="Delete" onClick={e => { e.stopPropagation(); deleteBlock(block.id); }} style={{ ...actionBtn, color: '#DC2626' }}><Trash2 size={12} /></button>
                        </div>
                      </div>

                      {/* Block preview */}
                      <BlockPreview block={block} />

                      {/* Vertical padding resize handle */}
                      <div
                        className="resize-handle-paddingY"
                        onMouseDown={e => startPaddingYResize(e, block.id, block.props?.paddingY || 40)}
                        title="Drag vertical size (paddingY)"
                      >
                        ↕ Padding: {block.props?.paddingY || 40}px
                      </div>
                    </div>
                  )}

                  {/* Drop zone between blocks */}
                  <DropZone idx={idx + 1} dragOverIdx={dragOverIdx} onDragOver={handleDragOver} onDrop={handleDrop} onDragLeave={() => setDragOverIdx(null)} />

                  {/* + Add block button (visible on hover) */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }} className="add-between">
                    <button
                      onClick={() => { addBlock(BLOCK_TYPES[0].type, idx); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '9999px', padding: '4px 14px', fontSize: '11px', fontWeight: '600', color: '#6B7280', cursor: 'pointer', opacity: (isSelected || isRowSelected) ? 1 : 0, transition: 'opacity 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                      <Plus size={11} /> Add Block Below
                    </button>
                  </div>
                </div>
              );
            })}

            {blocks.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '560px' }}>
                  {BLOCK_TYPES.slice(0, 10).map(bt => (
                    <button key={bt.type} onClick={() => addBlock(bt.type)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', color: '#374151', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                      {bt.icon} {bt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Properties Panel */}
        <div style={{ background: '#fff', borderLeft: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <Settings size={14} color="#9CA3AF" />
            <h3 style={{ fontSize: '11px', fontWeight: '800', color: selectedBlock || selectedRow ? '#1A1B4B' : '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
              {panelTitle}
            </h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {selectedBlock
              ? <PropsPanel block={selectedBlock} onChange={updateBlock} onTypeChange={changeBlockType} />
              : selectedRow
                ? <RowPropsPanel row={selectedRow} onUpdateRow={updateRow} />
                : (
                  <div style={{ padding: '32px 20px', textAlign: 'center', color: '#9CA3AF' }}>
                    <Layers size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                    <p style={{ fontSize: '13px' }}>Click a block or row on the canvas to edit its properties</p>
                  </div>
                )
            }
          </div>
        </div>
      </div>

      {previewActive && (
        <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 99999, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Preview Toolbar */}
          <div style={{ background: '#1A1B4B', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>👁️ Unsaved Live Preview</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)' }}>Instantly updates as you type</span>
            </div>
            <button onClick={() => setPreviewActive(false)} style={{ background: '#FF9F1C', color: '#1A1B4B', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              Close Preview
            </button>
          </div>
          {/* Preview Container */}
          <div style={{ flex: 1, overflowY: 'auto', background: '#F0F2F5' }}>
            <SpecialCourseLanding
              course={{ title: pageData?.title, custom_layout: { blocks } }}
              isEnrolled={false}
              onEnroll={() => {}}
              slug={pageData?.slug}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Drop Zone ───────────────────────────────────────────────────────
function DropZone({ idx, dragOverIdx, onDragOver, onDrop, onDragLeave }) {
  const active = dragOverIdx === idx;
  return (
    <div
      onDragOver={e => { e.preventDefault(); e.stopPropagation(); onDragOver(e, idx); }}
      onDrop={e => { e.stopPropagation(); onDrop(e, idx); }}
      onDragLeave={onDragLeave}
      style={{ height: active ? '48px' : '8px', borderRadius: '8px', background: active ? 'rgba(255,159,28,0.2)' : 'transparent', border: active ? '2px dashed #FF9F1C' : '2px dashed transparent', transition: 'all 0.15s', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      {active && <span style={{ fontSize: '12px', color: '#FF9F1C', fontWeight: '600' }}>Drop here</span>}
    </div>
  );
}

// ─── Block Preview (simplified canvas render) ────────────────────────
function BlockPreview({ block }) {
  const p = block.props || {};

  const previewStyle = {
    pointerEvents: 'none',
    userSelect: 'none',
    overflow: 'hidden',
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return (m && m[2].length === 11) ? m[2] : null;
  };

  switch (block.type) {
    case 'hero': {
      const bgStyle = p.backgroundImage
        ? { backgroundImage: `url(${p.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: p.background || '#1A1B4B' };
      const isSplit = p.layoutMode === 'split';

      return (
        <div style={{ ...previewStyle, ...bgStyle, padding: `${(p.paddingY || 80) / 2.5}px 20px`, color: '#fff', position: 'relative' }}>
          {p.backgroundImage && <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${p.overlayOpacity ?? 0.5})`, zIndex: 1 }} />}
          <div style={{ position: 'relative', zIndex: 2, display: isSplit ? 'grid' : 'block', gridTemplateColumns: isSplit ? '1.2fr 0.8fr' : 'none', gap: '20px', alignItems: 'center' }}>
            <div style={{ textAlign: p.align === 'center' ? 'center' : 'left' }}>
              {p.badge && (
                <span style={{ display: 'inline-block', background: 'rgba(255,159,28,0.2)', color: '#FF9F1C', padding: '3px 10px', borderRadius: '9999px', fontSize: '9px', fontWeight: '700', marginBottom: '8px' }}>
                  {p.badge}
                </span>
              )}
              <h1 style={{ fontSize: '20px', fontWeight: '900', color: p.textColor || '#fff', marginBottom: '8px', fontFamily: 'Outfit, sans-serif', lineHeight: 1.2 }}>
                {p.title || 'Wisdom Title'}
              </h1>
              {p.subtitle && (
                <p style={{ fontSize: '11px', color: p.subtitleColor || 'rgba(255,255,255,0.8)', marginBottom: '14px', lineHeight: 1.4 }}>
                  {p.subtitle}
                </p>
              )}
              {p.ctaText && (
                <button style={{ background: p.ctaColor || '#FF9F1C', color: p.ctaTextColor || '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '11px', fontWeight: '800' }}>
                  {p.ctaText}
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    case 'text':
      return (
        <div style={{ ...previewStyle, background: p.background || '#fff', padding: `${(p.paddingY || 56) / 2.5}px 20px` }}>
          <div style={{ textAlign: p.align || 'left' }}>
            {p.eyebrow && <p style={{ fontSize: '9px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{p.eyebrow}</p>}
            {p.heading && <h2 style={{ fontSize: '16px', fontWeight: '800', color: p.headingColor || '#1A1B4B', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>{p.heading}</h2>}
            {p.content && <div style={{ fontSize: '11px', color: p.textColor || '#4B5563', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{p.content}</div>}
          </div>
        </div>
      );

    case 'rich_text':
      return (
        <div style={{ ...previewStyle, background: p.background || '#fff', padding: `${(p.paddingY || 48) / 2.5}px 20px` }}>
          <div style={{ textAlign: p.align || 'left', color: p.textColor || '#1f2937', fontSize: '11px' }} dangerouslySetInnerHTML={{ __html: p.content || '' }} />
        </div>
      );

    case 'video': {
      const ytId = getYouTubeId(p.url);
      return (
        <div style={{ ...previewStyle, background: p.background || '#0F0F0F', padding: `${(p.paddingY || 48) / 2.5}px 20px`, color: '#fff', textAlign: 'center' }}>
          {p.title && <h3 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>{p.title}</h3>}
          <div style={{ width: '100%', maxWidth: '280px', height: '140px', background: '#1F1F1F', margin: '0 auto', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #333' }}>
            <span style={{ fontSize: '32px', color: '#FF0000' }}>▶</span>
            <span style={{ fontSize: '10px', color: '#888', marginTop: '6px' }}>{ytId ? 'YouTube Video Connected' : 'Enter YouTube Video URL'}</span>
          </div>
        </div>
      );
    }

    case 'image':
      return (
        <div style={{ ...previewStyle, background: p.background || '#fff', padding: `${(p.paddingY || 32) / 2.5}px 20px`, textAlign: 'center' }}>
          {p.src ? (
            <img src={p.src} alt="" style={{ maxWidth: '100%', maxHeight: '120px', objectFit: p.fit || 'contain', borderRadius: `${p.borderRadius || 12}px` }} />
          ) : (
            <div style={{ width: '100%', height: '80px', background: '#F3F4F6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', border: '1px dashed #D1D5DB' }}>🖼️ Upload / Paste Image URL</div>
          )}
          {p.caption && <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '6px', fontStyle: 'italic' }}>{p.caption}</p>}
        </div>
      );

    case 'gallery':
      return (
        <div style={{ ...previewStyle, background: p.background || '#fff', padding: `${(p.paddingY || 48) / 2.5}px 20px`, textAlign: 'center' }}>
          {p.title && <h3 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '10px' }}>{p.title}</h3>}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${p.columns || 3}, 1fr)`, gap: '8px' }}>
            {(p.images || []).length > 0 ? (p.images || []).map((img, i) => (
              <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                <img src={img.src || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%239ca3af">Image</text></svg>'} style={{ width: '100%', height: '60px', objectFit: 'cover' }} />
                {img.caption && <div style={{ fontSize: '8px', padding: '4px', background: '#f9fafb' }}>{img.caption}</div>}
              </div>
            )) : <div style={{ gridColumn: '1 / -1', padding: '16px', background: '#f3f4f6', borderRadius: '8px', color: '#9ca3af', fontSize: '10px' }}>No images in gallery yet</div>}
          </div>
        </div>
      );

    case 'features': {
      const cols = p.columns || 3;
      return (
        <div style={{ ...previewStyle, background: p.background || '#F8F9FE', padding: `${(p.paddingY || 60) / 2.5}px 20px` }}>
          {p.heading && (
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              {p.eyebrow && <span style={{ fontSize: '8px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase' }}>{p.eyebrow}</span>}
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: p.headingColor || '#1A1B4B', margin: '2px 0' }}>{p.heading}</h3>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '10px' }}>
            {(p.items || []).slice(0, 6).map((item, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '8px', padding: '10px', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: p.iconPosition === 'top' ? 'column' : 'row', gap: '8px' }}>
                {item.icon && <span style={{ fontSize: '16px' }}>{item.icon}</span>}
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: '700', color: '#1A1B4B', margin: '0 0 2px' }}>{item.title}</h4>
                  <p style={{ fontSize: '9px', color: '#6B7280', margin: 0, lineHeight: 1.3 }}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'stats':
      return (
        <div style={{ ...previewStyle, background: p.background || '#1A1B4B', padding: `${(p.paddingY || 48) / 2.5}px 16px` }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${(p.items || []).length || 3}, 1fr)`, gap: '12px', textAlign: 'center' }}>
            {(p.items || []).map((item, i) => (
              <div key={i}>
                <div style={{ fontSize: '20px', fontWeight: '950', color: p.accentColor || '#FF9F1C', fontFamily: 'Outfit, sans-serif' }}>{item.value}</div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'testimonials':
      return (
        <div style={{ ...previewStyle, background: p.background || '#F0F2F5', padding: `${(p.paddingY || 64) / 2.5}px 20px`, textAlign: 'center' }}>
          {p.heading && <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1A1B4B', marginBottom: '12px' }}>{p.heading}</h3>}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', maxWidth: '480px', margin: '0 auto' }}>
            <p style={{ fontSize: '11px', color: '#374151', fontStyle: 'italic', margin: '0 0 8px' }}>
              "{(p.items || [])[0]?.text || 'Feedback goes here.'}"
            </p>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#1A1B4B' }}>- {(p.items || [])[0]?.name || 'Student Name'}</div>
          </div>
        </div>
      );

    case 'team_cards':
      return (
        <div style={{ ...previewStyle, background: p.background || '#fff', padding: `${(p.paddingY || 60) / 2.5}px 20px` }}>
          {p.heading && <h3 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '12px', textAlign: 'center' }}>{p.heading}</h3>}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {(p.items || []).map((item, i) => (
              <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px', width: '120px', textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ccc', margin: '0 auto 6px' }}></div>
                <div style={{ fontSize: '10px', fontWeight: '700' }}>{item.name}</div>
                <div style={{ fontSize: '8px', color: '#6b7280' }}>{item.title}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'timeline':
      return (
        <div style={{ ...previewStyle, background: p.background || '#fafafa', padding: `${(p.paddingY || 60) / 2.5}px 20px` }}>
          {p.heading && <h3 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '12px', textAlign: 'center' }}>{p.heading}</h3>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(p.items || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '10px' }}>
                <div style={{ fontWeight: '700', color: '#FF9F1C' }}>{item.date}</div>
                <div>
                  <div style={{ fontWeight: '700' }}>{item.title}</div>
                  <div style={{ fontSize: '9px', color: '#6b7280' }}>{item.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'accordion':
      return (
        <div style={{ ...previewStyle, background: p.background || '#fff', padding: `${(p.paddingY || 60) / 2.5}px 20px` }}>
          {p.heading && <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1A1B4B', marginBottom: '12px', textAlign: 'center' }}>{p.heading}</h3>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '500px', margin: '0 auto' }}>
            {(p.items || []).slice(0, 3).map((item, i) => (
              <div key={i} style={{ border: '1px solid #E5E7EB', borderRadius: '6px', padding: '8px 12px', fontSize: '10px', color: '#374151', display: 'flex', justifyContent: 'space-between' }}>
                <span>❓ {item.q}</span>
                <span>▼</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'countdown':
      return (
        <div style={{ ...previewStyle, background: p.background || '#1A1B4B', padding: `${(p.paddingY || 48) / 2.5}px 20px`, textAlign: 'center', color: '#fff' }}>
          {p.heading && <h3 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '4px' }}>{p.heading}</h3>}
          {p.subheading && <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>{p.subheading}</p>}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {['Days', 'Hours', 'Mins', 'Secs'].map((lbl, i) => (
              <div key={lbl} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', minWidth: '45px' }}>
                <div style={{ fontSize: '18px', fontWeight: '900', color: p.accentColor || '#FF9F1C' }}>00</div>
                <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.5)', marginTop: '2px', textTransform: 'uppercase' }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'cta':
      return (
        <div style={{ ...previewStyle, background: p.background || 'linear-gradient(135deg, #1A1B4B, #2D1B69)', padding: `${(p.paddingY || 64) / 2.5}px 20px`, textAlign: 'center', color: '#fff' }}>
          {p.heading && <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#fff', marginBottom: '6px', fontFamily: 'Outfit, sans-serif' }}>{p.heading}</h2>}
          {p.subheading && <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', marginBottom: '14px', maxWidth: '420px', margin: '0 auto 14px' }}>{p.subheading}</p>}
          <button style={{ background: p.btnColor || '#FF9F1C', color: p.btnTextColor || '#1A1B4B', border: 'none', borderRadius: '8px', padding: '8px 24px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
            {p.btnText || 'Explore Programs'}
          </button>
        </div>
      );

    case 'two_column': {
      const lType = p.leftType || 'text';
      const rType = p.rightType || 'image';
      const gridCols = p.leftWidth || '50% 50%';

      const renderColumnPreview = (type, col) => {
        if (type === 'image') {
          const imgSrc = col === 'left' ? p.leftImage : p.rightImage;
          if (!imgSrc) return <div style={{ height: '70px', background: '#F3F4F6', borderRadius: '8px' }} />;
          return (
            <img src={imgSrc} alt="" style={{ width: '100%', height: p.imageHeight ? `${p.imageHeight / 3}px` : '120px', objectFit: p.imageFit || 'cover', borderRadius: '8px' }} />
          );
        }
        if (type === 'video') {
          return <div style={{ height: '75px', background: '#000', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px' }}>🎬 Video Preview</div>;
        }
        
        const heading = col === 'left' ? p.leftHeading : p.rightHeading;
        const content = col === 'left' ? p.leftContent : p.rightContent;
        
        return (
          <div style={{ textAlign: 'left' }}>
            {heading && <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#1A1B4B', marginBottom: '4px' }}>{heading}</h4>}
            {content && <p style={{ fontSize: '9px', color: '#4B5563', lineHeight: 1.4, margin: 0 }}>{content}</p>}
          </div>
        );
      };

      return (
        <div style={{ ...previewStyle, background: p.background || '#fff', padding: `${(p.paddingY || 60) / 2.5}px 20px` }}>
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: `${p.gap ? p.gap / 2 : 20}px`, alignItems: 'center' }}>
            <div>{renderColumnPreview(lType, 'left')}</div>
            <div>{renderColumnPreview(rType, 'right')}</div>
          </div>
        </div>
      );
    }

    case 'three_column':
      return (
        <div style={{ ...previewStyle, background: p.background || '#fff', padding: `${(p.paddingY || 60) / 2.5}px 20px` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: `${p.gap || 16}px` }}>
            {[1, 2, 3].map(n => (
              <div key={n} style={{ fontSize: '10px', color: p.textColor }}>
                <div style={{ fontWeight: '800', color: p.headingColor }}>{p[`col${n}Heading`]}</div>
                <div>{p[`col${n}Content`]}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'four_column':
      return (
        <div style={{ ...previewStyle, background: p.background || '#fafafa', padding: `${(p.paddingY || 50) / 2.5}px 20px` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: `${p.gap || 16}px` }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} style={{ fontSize: '9px' }}>
                <div style={{ fontWeight: '800' }}>{p[`col${n}Title`]}</div>
                <div>{p[`col${n}Text`]}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'divider':
      return (
        <div style={{ ...previewStyle, background: p.background || 'transparent', padding: '4px 0' }}>
          <div style={{ height: `${(p.height || 48) / 3}px`, display: 'flex', alignItems: 'center' }}>
            {p.showLine && <div style={{ width: '100%', height: '1px', background: p.lineColor || '#E5E7EB' }} />}
          </div>
        </div>
      );

    case 'banner':
      return (
        <div style={{ ...previewStyle, background: p.background || '#FF9F1C', color: p.textColor || '#1A1B4B', padding: `${p.paddingY || 8}px 12px`, textAlign: 'center', fontSize: '10px', fontWeight: '700' }}>
          {p.text} {p.linkText && <span style={{ textDecoration: 'underline', marginLeft: '6px' }}>{p.linkText}</span>}
        </div>
      );

    case 'html_embed':
      return (
        <div style={{ ...previewStyle, background: p.background || '#ffffff', padding: `${p.paddingY || 24}px 20px` }}>
          <div style={{ border: '1px dashed #cccccc', padding: '10px', textAlign: 'center', fontSize: '9px', color: '#999999' }}>
            💻 HTML Embed Code Block
          </div>
        </div>
      );

    case 'system_hero_slides':
      return <div style={{ ...previewStyle, background: '#1A1B4B', color: '#fff', padding: '24px 20px', textAlign: 'center', fontWeight: 'bold', border: '2px dashed #FF9F1C', borderRadius: '8px' }}>🎠 [System Section: Sliding Poster Hero Banner]</div>;
    case 'system_credentials':
      return <div style={{ ...previewStyle, background: '#fff', padding: '20px', textAlign: 'center', border: '2px dashed #FF9F1C', borderRadius: '8px' }}>🎓 [System Section: Credentials / Certificates Row]</div>;
    case 'system_logos':
      return <div style={{ ...previewStyle, background: '#FAF8F5', padding: '16px', textAlign: 'center', border: '2px dashed #FF9F1C', borderRadius: '8px' }}>🏢 [System Section: Corporate Trainer Logos Slider]</div>;
    case 'system_featured':
      return <div style={{ ...previewStyle, background: '#fff', padding: '24px 20px', textAlign: 'center', border: '2px dashed #FF9F1C', borderRadius: '8px' }}>📦 [System Section: Featured Book, Academy & Reading Cards]</div>;
    case 'system_about':
      return <div style={{ ...previewStyle, background: '#FAF8F5', padding: '30px 20px', textAlign: 'center', border: '2px dashed #FF9F1C', borderRadius: '8px' }}>👤 [System Section: Biography of Radheshyam Das]</div>;
    case 'system_books':
      return <div style={{ ...previewStyle, background: '#DA9B5B', color: '#fff', padding: '30px 20px', textAlign: 'center', border: '2px dashed #FF9F1C', borderRadius: '8px' }}>📚 [System Section: Shopify Books Slider/Grid]</div>;
    case 'system_youtube':
      return <div style={{ ...previewStyle, background: '#FAF8F5', padding: '30px 20px', textAlign: 'center', border: '2px dashed #FF9F1C', borderRadius: '8px' }}>📺 [System Section: YouTube Lectures Playlist]</div>;

    default:
      return <div style={previewStyle}><p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>{block.type} block</p></div>;
  }
}

// ─── Shared styles ─────────────────────────────────────────────
const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  border: '1.5px solid #E5E7EB',
  borderRadius: '8px',
  fontSize: '12px',
  background: '#FAFAFA',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  outline: 'none',
};

const propsScroll = {
  padding: '14px 16px',
  overflowY: 'auto',
};

const actionBtn = {
  background: '#F9FAFB',
  border: '1px solid #E5E7EB',
  borderRadius: '6px',
  padding: '4px 7px',
  cursor: 'pointer',
  color: '#6B7280',
  display: 'flex',
  alignItems: 'center',
};

const addItemBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  padding: '7px 14px',
  background: '#F9FAFB',
  border: '1.5px dashed #D1D5DB',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: '600',
  color: '#6B7280',
  cursor: 'pointer',
  width: '100%',
  justifyContent: 'center',
  marginTop: '4px',
};
