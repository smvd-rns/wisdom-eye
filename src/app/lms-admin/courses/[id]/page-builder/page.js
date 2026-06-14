'use client';

import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SpecialCourseLanding from '@/components/SpecialCourseLanding';
import {
  ArrowLeft, Save, Eye, Loader2, Plus, Trash2, Copy,
  GripVertical, ChevronUp, ChevronDown, Sparkles, Settings,
  Image, Type, Video, Layout, Star, Users, Award, AlignLeft,
  Layers, BarChart3, Clock, MessageSquare, HelpCircle, Zap, Minus,
  ExternalLink, Check, X, Palette, ToggleLeft, ToggleRight, Columns,
  SplitSquareHorizontal, AlignJustify
} from 'lucide-react';

// ─── Block Definitions (the palette) ────────────────────────────────
const BLOCK_TYPES = [
  { type: 'hero', label: 'Hero Banner', icon: '🎯', desc: 'Eye-catching header section', color: '#7C3AED' },
  { type: 'text', label: 'Text Block', icon: '📝', desc: 'Heading + paragraph content', color: '#0891B2' },
  { type: 'two_column', label: 'Two Column', icon: '◫', desc: 'Side-by-side layout', color: '#059669' },
  { type: 'video', label: 'YouTube Video', icon: '🎬', desc: 'Embed a YouTube video', color: '#DC2626' },
  { type: 'image', label: 'Image', icon: '🖼️', desc: 'Full-width image block', color: '#D97706' },
  { type: 'features', label: 'Features Grid', icon: '✨', desc: 'Icon + title + text cards', color: '#7C3AED' },
  { type: 'stats', label: 'Stats Bar', icon: '📊', desc: 'Numbers / achievements row', color: '#1A1B4B' },
  { type: 'testimonials', label: 'Testimonials', icon: '💬', desc: 'Student reviews carousel', color: '#0891B2' },
  { type: 'instructor', label: 'Instructor Card', icon: '👨‍🏫', desc: 'About the instructor', color: '#059669' },
  { type: 'curriculum', label: 'Curriculum', icon: '📚', desc: 'Course modules (auto-populated)', color: '#D97706' },
  { type: 'enroll_card', label: 'Enroll Card', icon: '💰', desc: 'Price & enroll button', color: '#16A34A' },
  { type: 'faq', label: 'FAQ Accordion', icon: '❓', desc: 'Frequently asked questions', color: '#DC2626' },
  { type: 'countdown', label: 'Countdown Timer', icon: '⏱️', desc: 'Urgency countdown clock', color: '#7C3AED' },
  { type: 'cta', label: 'CTA Banner', icon: '🚀', desc: 'Call-to-action section', color: '#1A1B4B' },
  { type: 'divider', label: 'Spacer/Divider', icon: '➖', desc: 'Blank space or line', color: '#9CA3AF' },
];

// ─── Default props for each block type ──────────────────────────────
const DEFAULT_PROPS = {
  hero: {
    title: 'Transform Your Life with Vedic Wisdom',
    subtitle: 'Join thousands of students on a journey of self-discovery and spiritual growth.',
    badge: '🌟 Featured Course',
    background: '#1A1B4B',
    backgroundImage: '',
    overlayOpacity: 0.5,
    textColor: '#ffffff',
    subtitleColor: 'rgba(255,255,255,0.8)',
    align: 'left',
    titleSize: 48,
    subtitleSize: 18,
    ctaText: 'Enroll Now',
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
    eyebrow: 'About This Course',
    heading: 'What You Will Discover',
    headingSize: 32,
    headingColor: '#1A1B4B',
    content: 'This course takes you on a profound journey through ancient Vedic philosophy, making timeless wisdom accessible and applicable to modern life.',
    textColor: '#4B5563',
    fontSize: 16,
    lineHeight: 1.8,
    align: 'left',
    background: '#fff',
    paddingY: 56,
    maxWidth: '800px',
  },
  two_column: {
    leftType: 'image',
    leftHeading: '',
    leftContent: '',
    leftImage: '',
    leftVideoUrl: '',
    leftCtaText: '',
    leftCtaColor: '#FF9F1C',
    leftCtaTextColor: '#1A1B4B',
    rightType: 'text',
    rightEyebrow: 'Why This Course?',
    rightHeading: 'Ancient Wisdom for Modern Times',
    rightContent: 'Discover how 5,000-year-old Vedic teachings provide practical solutions to contemporary challenges in career, relationships, and mental well-being.',
    rightImage: '',
    rightVideoUrl: '',
    rightCtaText: '',
    rightCtaColor: '#FF9F1C',
    rightCtaTextColor: '#1A1B4B',
    background: '#fff',
    paddingY: 60,
    gap: 48,
    leftWidth: '1.2fr 0.8fr',
    rightWidth: '1fr',
    imageShadow: true,
    imageHeight: 380,
    imageFit: 'cover',
  },
  video: {
    url: '',
    title: 'Watch Course Introduction',
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
  features: {
    eyebrow: 'What You Will Learn',
    heading: 'Course Highlights',
    subheading: 'Everything you need to transform your life with Vedic knowledge',
    headingColor: '#1A1B4B',
    background: '#F8F9FE',
    accentColor: '#FF9F1C',
    columns: 3,
    iconPosition: 'top',
    paddingY: 60,
    items: [
      { icon: '🧘', title: 'Daily Mindfulness Practices', text: 'Simple yet powerful techniques you can implement immediately in your daily routine.' },
      { icon: '📖', title: 'Timeless Vedic Philosophy', text: 'Deep dive into the Bhagavad Gita, Upanishads, and other sacred texts.' },
      { icon: '🌱', title: 'Practical Life Application', text: 'Bridge ancient wisdom to your career, relationships, and personal growth.' },
      { icon: '🧠', title: 'Mental Clarity & Focus', text: 'Learn yogic techniques to sharpen concentration and reduce stress.' },
      { icon: '💫', title: 'Spiritual Development', text: 'Cultivate a deeper sense of purpose, meaning, and inner peace.' },
      { icon: '🎓', title: 'Expert Guidance', text: 'Learn directly from a renowned Vedic scholar with 30+ years of experience.' },
    ],
  },
  stats: {
    background: '#1A1B4B',
    accentColor: '#FF9F1C',
    paddingY: 48,
    items: [
      { value: '50,000+', label: 'Students Enrolled' },
      { value: '4.9★', label: 'Average Rating' },
      { value: '30+', label: 'Years Experience' },
      { value: '120+', label: 'Countries Reached' },
    ],
  },
  testimonials: {
    heading: 'What Our Students Say',
    background: '#F0F2F5',
    paddingY: 64,
    items: [
      { name: 'Priya Sharma', role: 'Software Engineer, Bangalore', rating: 5, text: 'This course completely changed my perspective on life. The teachings are profound yet practical. I feel more grounded and focused than ever before.' },
      { name: 'Rahul Mehta', role: 'Entrepreneur, Mumbai', rating: 5, text: 'Radheshyam Dasji has a rare gift of making complex Vedic concepts simple and relatable. Every lesson was a revelation.' },
      { name: 'Anita Patel', role: 'Doctor, Delhi', rating: 5, text: 'I was skeptical at first, but this course genuinely helped me find balance in my demanding professional life.' },
    ],
  },
  instructor: {
    heading: 'Meet Your Instructor',
    name: 'Radheshyam Das',
    title: 'Founding Director, VOICE & Renowned Vedic Educator',
    bio: "Radheshyam Das holds a Master's degree from IIT Bombay and is a celebrated author, speaker, and spiritual mentor. Having dedicated over three decades to studying and teaching Vedic literature, he has inspired tens of thousands of youths and professionals across the globe.",
    avatar: '',
    credentials: ['IIT Bombay Alumni', '30+ Years Teaching', 'Author & Speaker', 'VOICE Director'],
    background: '#fff',
    cardBackground: '#F8F9FE',
    paddingY: 60,
  },
  curriculum: {
    heading: 'Course Curriculum',
    subheading: 'Explore all modules and lessons included in this course',
    background: '#F8F9FE',
    paddingY: 60,
  },
  enroll_card: {
    headerBg: 'linear-gradient(135deg, #1A1B4B, #2D1B69)',
    headerTitle: 'Start Your Journey Today',
    headerSubtitle: 'Join thousands of students transforming their lives',
    background: '#F0F2F5',
    btnColor: 'linear-gradient(135deg, #FF9F1C, #E07A5F)',
    btnText: 'Enroll Now',
    paddingY: 60,
    guarantees: ['Lifetime access', 'Learn at your own pace', 'Certificate on completion'],
  },
  faq: {
    heading: 'Frequently Asked Questions',
    background: '#fff',
    paddingY: 60,
    items: [
      { q: 'Who is this course for?', a: 'This course is designed for students, professionals, and seekers of all backgrounds who want to deepen their understanding of life, spirituality, and personal leadership based on Vedic principles.' },
      { q: 'Do I need any prior knowledge?', a: 'No prior knowledge of Vedic philosophy is required. The course is designed to be accessible to complete beginners while also offering depth for more advanced students.' },
      { q: 'How long will I have access?', a: 'You will get lifetime access to all course content. Learn at your own pace and revisit lessons whenever you like.' },
      { q: 'Is there a certificate?', a: 'Yes! Upon successful completion of the course, you will receive a digital certificate that can be shared on LinkedIn and other platforms.' },
    ],
  },
  countdown: {
    heading: '🔥 Limited Time Offer',
    subheading: 'Enroll before this exclusive offer expires!',
    targetDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16),
    accentColor: '#FF9F1C',
    background: '#1A1B4B',
    expiredText: 'Offer has ended!',
    paddingY: 48,
  },
  cta: {
    heading: 'Ready to Transform Your Life?',
    subheading: 'Join thousands of students who have already started their journey.',
    btnText: 'Enroll Now — Start Learning Today',
    btnColor: '#FF9F1C',
    btnTextColor: '#1A1B4B',
    background: 'linear-gradient(135deg, #1A1B4B, #2D1B69)',
    paddingY: 64,
    note: '',
  },
  divider: {
    height: 48,
    background: 'transparent',
    showLine: false,
    lineColor: '#E5E7EB',
  },
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
      // Compress client-side
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

// ─── Properties Panel Component ──────────────────────────────────────
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
          <Field label="Badge Text"><Input field="badge" placeholder="🌟 Featured Course" /></Field>
          <Field label="Main Title"><Textarea field="title" rows={2} /></Field>
          <Field label="Subtitle"><Textarea field="subtitle" rows={3} /></Field>
          <Field label="CTA Button Text"><Input field="ctaText" placeholder="Enroll Now" /></Field>
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
          <Field label="Eyebrow (small top label)"><Input field="eyebrow" placeholder="About This Course" /></Field>
          <Field label="Heading"><Input field="heading" placeholder="Main heading" /></Field>
          <Field label="Body Text"><Textarea field="content" rows={6} /></Field>

          <SectionTitle>Design</SectionTitle>
          <ColorRow field="background" label="Background" />
          <Field label="Text Alignment"><Select field="align" options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} /></Field>
          <Field label="Font Size (px)"><Input field="fontSize" type="number" min={12} max={24} /></Field>
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" min={20} max={160} /></Field>
        </div>
      );

      case 'video': return (
        <div style={propsScroll}>
          <Field label="YouTube URL" hint="Paste any YouTube video URL"><Input field="url" placeholder="https://youtube.com/watch?v=..." /></Field>
          <Field label="Section Title"><Input field="title" placeholder="Watch Course Introduction" /></Field>
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

      case 'features': return (
        <div style={propsScroll}>
          <SectionTitle>Heading</SectionTitle>
          <Field label="Eyebrow"><Input field="eyebrow" placeholder="What You Will Learn" /></Field>
          <Field label="Heading"><Input field="heading" placeholder="Course Highlights" /></Field>
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
          <button onClick={() => set('items', [...(p.items || []), { name: 'Student Name', role: 'City', text: 'Amazing course!', rating: 5 }])} style={addItemBtn}><Plus size={13} /> Add Review</button>
        </div>
      );

      case 'instructor': return (
        <div style={propsScroll}>
          <Field label="Section Heading"><Input field="heading" /></Field>
          <Field label="Name"><Input field="name" /></Field>
          <Field label="Title / Role"><Input field="title" /></Field>
          <Field label="Bio"><Textarea field="bio" rows={4} /></Field>
          <Field label="Avatar Image"><ImageInput field="avatar" placeholder="Upload or enter URL" /></Field>
          <SectionTitle>Credentials (chips)</SectionTitle>
          {(p.credentials || []).map((cred, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
              <input value={cred} onChange={e => set('credentials', (p.credentials || []).map((c, j) => j === i ? e.target.value : c))} style={{ ...inputStyle, flex: 1 }} />
              <button onClick={() => set('credentials', (p.credentials || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={14} /></button>
            </div>
          ))}
          <button onClick={() => set('credentials', [...(p.credentials || []), 'New Credential'])} style={addItemBtn}><Plus size={13} /> Add Credential</button>
          <SectionTitle>Design</SectionTitle>
          <ColorRow field="background" label="Section Background" />
          <ColorRow field="cardBackground" label="Card Background" />
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" /></Field>
        </div>
      );

      case 'curriculum': return (
        <div style={propsScroll}>
          <Field label="Section Heading"><Input field="heading" /></Field>
          <Field label="Subheading"><Input field="subheading" /></Field>
          <ColorRow field="background" label="Background" />
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" /></Field>
          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#92400E', marginTop: '8px' }}>
            ℹ️ Curriculum is automatically populated from the real course modules in the database.
          </div>
        </div>
      );

      case 'enroll_card': return (
        <div style={propsScroll}>
          <SectionTitle>Card Header</SectionTitle>
          <Field label="Header Background"><Input field="headerBg" placeholder="gradient or hex" /></Field>
          <Field label="Header Title"><Input field="headerTitle" /></Field>
          <Field label="Header Subtitle"><Input field="headerSubtitle" /></Field>

          <SectionTitle>Button</SectionTitle>
          <Field label="Button Text"><Input field="btnText" placeholder="Enroll Now" /></Field>
          <Field label="Button Color"><Input field="btnColor" placeholder="gradient or hex" /></Field>

          <SectionTitle>Guarantees</SectionTitle>
          {(p.guarantees || []).map((g, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
              <input value={g} onChange={e => set('guarantees', (p.guarantees || []).map((gg, j) => j === i ? e.target.value : gg))} style={{ ...inputStyle, flex: 1 }} />
              <button onClick={() => set('guarantees', (p.guarantees || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={14} /></button>
            </div>
          ))}
          <button onClick={() => set('guarantees', [...(p.guarantees || []), 'New guarantee'])} style={addItemBtn}><Plus size={13} /> Add Guarantee</button>

          <SectionTitle>Design</SectionTitle>
          <ColorRow field="background" label="Section Background" />
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" /></Field>
        </div>
      );

      case 'faq': return (
        <div style={propsScroll}>
          <Field label="Section Heading"><Input field="heading" /></Field>
          <ColorRow field="background" label="Background" />
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" /></Field>
          <SectionTitle>FAQ Items</SectionTitle>
          {(p.items || []).map((item, i) => (
            <div key={i} style={{ background: '#F9FAFB', borderRadius: '10px', padding: '12px', marginBottom: '10px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>Q{i + 1}</span>
                <button onClick={() => set('items', (p.items || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={14} /></button>
              </div>
              <input placeholder="Question" value={item.q || ''} onChange={e => set('items', (p.items || []).map((it, j) => j === i ? { ...it, q: e.target.value } : it))} style={{ ...inputStyle, marginBottom: '6px' }} />
              <textarea placeholder="Answer" value={item.a || ''} onChange={e => set('items', (p.items || []).map((it, j) => j === i ? { ...it, a: e.target.value } : it))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          ))}
          <button onClick={() => set('items', [...(p.items || []), { q: 'New Question?', a: 'Answer here.' }])} style={addItemBtn}><Plus size={13} /> Add FAQ</button>
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
          {(p.leftType === 'text' || !p.leftType) && (
            <>
              <Field label="Left Heading"><Input field="leftHeading" /></Field>
              <Field label="Left Body Text"><Textarea field="leftContent" rows={4} /></Field>
              <Field label="Left Button Text"><Input field="leftCtaText" placeholder="optional" /></Field>
              {p.leftCtaText && (
                <>
                  <Field label="Left Button Color"><Input field="leftCtaColor" /></Field>
                  <Field label="Left Button Text Color"><Input field="leftCtaTextColor" /></Field>
                </>
              )}
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
              {p.rightCtaText && (
                <>
                  <Field label="Right Button Color"><Input field="rightCtaColor" /></Field>
                  <Field label="Right Button Text Color"><Input field="rightCtaTextColor" /></Field>
                </>
              )}
            </>
          )}
          {p.rightType === 'image' && <Field label="Right Image"><ImageInput field="rightImage" placeholder="Upload or enter URL" /></Field>}
          {p.rightType === 'video' && <Field label="Right YouTube URL"><Input field="rightVideoUrl" placeholder="https://..." /></Field>}

          <SectionTitle>Design</SectionTitle>
          <ColorRow field="background" label="Background" />
          <Field label="Column Split" hint="e.g. '1.2fr 0.8fr' or '1fr 1fr'"><Input field="leftWidth" placeholder="1.2fr 0.8fr" /></Field>
          <Field label="Gap (px)"><Input field="gap" type="number" min={0} max={120} /></Field>
          <Toggle field="imageShadow" label="Image drop shadow" />
          <Field label="Image Height (px)"><Input field="imageHeight" type="number" min={100} max={800} /></Field>
          <Field label="Image Fit"><Select field="imageFit" options={[{ value: 'cover', label: 'Cover (fill & crop)' }, { value: 'contain', label: 'Contain (fit inside)' }]} /></Field>
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" min={20} max={160} /></Field>
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
export default function PageBuilderPage() {
  const { id } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [isSpecial, setIsSpecial] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [previewActive, setPreviewActive] = useState(false);
  const dragItem = useRef(null);
  const dragFromPalette = useRef(null);
  // For resizing columns
  const resizingRef = useRef(null);

  // Load existing layout
  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/courses/${id}/layout`);
      if (!res.ok) { router.push('/lms-admin/courses'); return; }
      const data = await res.json();
      setCourse(data);
      setIsSpecial(data.is_special || false);
      setBlocks(data.custom_layout?.blocks || []);
      setLoading(false);
    };
    load();
  }, [id]);

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
    setBlocks(newBlocks);
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
    setBlocks(b => b.filter(bl => bl.id !== blockId));
    if (selectedId === blockId) setSelectedId(null);
    if (selectedRowId === blockId) setSelectedRowId(null);
  };

  // ── Delete a column from a row ───────────────────────────────────
  const deleteColumnFromRow = (rowId, colIdx) => {
    setBlocks(prev => prev.map(b => {
      if (b.id !== rowId) return b;
      const newCols = b.columns.filter((_, i) => i !== colIdx);
      if (newCols.length === 0) return null; // Remove row if empty
      // Redistribute widths evenly
      const even = 100 / newCols.length;
      return { ...b, columns: newCols.map(c => ({ ...c, width: even })) };
    }).filter(Boolean));
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
    setBlocks(nb);
    setSelectedId(copy.id);
  };

  // ── Move top-level block ─────────────────────────────────────────
  const moveBlock = (idx, dir) => {
    const nb = [...blocks];
    const target = idx + dir;
    if (target < 0 || target >= nb.length) return;
    [nb[idx], nb[target]] = [nb[target], nb[idx]];
    setBlocks(nb);
  };

  // ── Update a block (top-level or inside row) ─────────────────────
  const updateBlock = (updated) => {
    setBlocks(prev => prev.map(b => {
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
    }));
  };

  // ── Change type of a block (swap) ────────────────────────────────
  const changeBlockType = (blockId, newType) => {
    setBlocks(prev => prev.map(b => {
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
    }));
    // Re-select to trigger props panel refresh
    setTimeout(() => {
      setSelectedId(blockId);
    }, 50);
  };

  // ── Update row-level settings ────────────────────────────────────
  const updateRow = (updatedRow) => {
    setBlocks(prev => prev.map(b => b.id === updatedRow.id ? updatedRow : b));
  };

  // ── Wrap a top-level block in a row (add column beside it) ───────
  const wrapInRow = (blockIdx) => {
    const block = blocks[blockIdx];
    if (block.type === '__row__') return; // Already a row
    const newBlock = { id: genId(), type: BLOCK_TYPES[1].type, props: { ...DEFAULT_PROPS[BLOCK_TYPES[1].type] } };
    const row = {
      id: genId(),
      type: '__row__',
      rowBackground: 'transparent',
      rowPadding: 0,
      rowGap: 0,
      rowAlign: 'stretch',
      columns: [
        { width: 50, block },
        { width: 50, block: newBlock },
      ],
    };
    const nb = [...blocks];
    nb.splice(blockIdx, 1, row);
    setBlocks(nb);
    setSelectedId(null);
    setSelectedRowId(row.id);
  };

  // ── Add column to existing row ───────────────────────────────────
  const addColumnToRow = (rowId) => {
    setBlocks(prev => prev.map(b => {
      if (b.id !== rowId) return b;
      const newBlock = { id: genId(), type: 'text', props: { ...DEFAULT_PROPS.text } };
      const newCols = [...b.columns, { width: 0, block: newBlock }];
      const even = 100 / newCols.length;
      return { ...b, columns: newCols.map(c => ({ ...c, width: even })) };
    }));
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
      setBlocks(nb);
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
    setBlocks(nb);
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

      setBlocks(prev => prev.map(b => {
        if (b.id !== rowId) return b;
        const newWidths = [...startWidths];
        const minPct = 10;
        newWidths[dividerIdx] = Math.max(minPct, Math.min(startWidths[dividerIdx] + dPct, 100 - minPct * (b.columns.length - 1)));
        newWidths[dividerIdx + 1] = Math.max(minPct, startWidths[dividerIdx] + startWidths[dividerIdx + 1] - newWidths[dividerIdx]);
        return { ...b, columns: b.columns.map((col, i) => ({ ...col, width: newWidths[i] })) };
      }));
    };

    const onMouseUp = () => {
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
      const res = await fetch(`/api/courses/${id}/layout`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_special: isSpecial,
          custom_layout: { version: 2, blocks },
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Save failed.'); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { setError('An error occurred.'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F2F5' }}>
      <div style={{ textAlign: 'center' }}>
        <Loader2 size={36} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
        <p style={{ color: '#6B7280', fontSize: '14px' }}>Loading Page Builder…</p>
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#F0F2F5', fontFamily: 'Outfit, Inter, sans-serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
        .block-hover:hover .block-actions { opacity: 1 !important; }
        .palette-item:hover { background: #F3F4F6 !important; border-color: #D1D5DB !important; }
        .palette-item:active { transform: scale(0.97); }
        .canvas-block { animation: fadeIn 0.2s ease; }
        .col-resize-handle { cursor: col-resize; }
        .col-resize-handle:hover { background: rgba(99,102,241,0.3) !important; }
        .col-resize-handle:active { background: rgba(99,102,241,0.5) !important; }
      `}</style>

      {/* ── Top Toolbar ─────────────────────────────────────── */}
      <div style={{ background: '#1A1B4B', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '16px', height: '56px', flexShrink: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.2)', zIndex: 100 }}>
        <Link href={`/lms-admin/courses/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none', paddingRight: '16px', borderRight: '1px solid rgba(255,255,255,0.15)' }}>
          <ArrowLeft size={14} /> Back
        </Link>

        <div style={{ flex: 1 }}>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>🎨 Page Builder</span>
          {course?.title && <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginLeft: '10px' }}>— {course.title}</span>}
        </div>

        {/* Special toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '6px 14px', borderRadius: '8px', background: isSpecial ? 'rgba(255,159,28,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${isSpecial ? 'rgba(255,159,28,0.4)' : 'rgba(255,255,255,0.1)'}`, transition: 'all 0.2s' }}>
          <div style={{ width: '34px', height: '18px', borderRadius: '9px', background: isSpecial ? '#FF9F1C' : '#4B5563', position: 'relative', transition: 'background 0.2s' }}>
            <div style={{ position: 'absolute', top: '2px', left: isSpecial ? '16px' : '2px', width: '14px', height: '14px', background: '#fff', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
          </div>
          <span style={{ color: isSpecial ? '#FF9F1C' : 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '600' }}>
            {isSpecial ? '⭐ Special Course' : 'Mark as Special'}
          </span>
          <input type="checkbox" checked={isSpecial} onChange={e => setIsSpecial(e.target.checked)} style={{ display: 'none' }} />
        </label>

        {error && <span style={{ color: '#F87171', fontSize: '12px' }}>⚠️ {error}</span>}

        <button onClick={() => setPreviewActive(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', background: 'none', border: '1px solid rgba(255,255,255,0.15)', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', outline: 'none' }}>
          <Eye size={14} /> Live Preview
        </button>

        <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: saved ? '#22C55E' : '#FF9F1C', color: saved ? '#fff' : '#1A1B4B', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', minWidth: '100px', justifyContent: 'center' }}>
          {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save</>}
        </button>
      </div>

      {/* ── Three-panel layout ───────────────────────────────── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '240px 1fr 300px', overflow: 'hidden' }}>

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
        <div style={{ overflowY: 'auto', background: '#E5E7EB', padding: '24px 32px' }}>
          {/* Drop zone at top */}
          <DropZone idx={0} dragOverIdx={dragOverIdx} onDragOver={handleDragOver} onDrop={handleDrop} onDragLeave={() => setDragOverIdx(null)} />

          {blocks.length === 0 && (
            <div
              onDragOver={e => { e.preventDefault(); setDragOverIdx(0); }}
              onDrop={e => handleDrop(e, 0)}
              style={{ background: '#fff', borderRadius: '16px', border: '2px dashed #D1D5DB', padding: '60px 32px', textAlign: 'center', cursor: 'default' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1A1B4B', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>Start Building Your Special Course Page</h3>
              <p style={{ fontSize: '14px', color: '#9CA3AF', maxWidth: '360px', margin: '0 auto 24px' }}>
                Drag blocks from the left panel onto this canvas, or click any block in the library to add it.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {['hero', 'features', 'enroll_card'].map(type => {
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
              <div key={block.id} className="canvas-block">
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '520px' }}>
                {BLOCK_TYPES.slice(0, 6).map(bt => (
                  <button key={bt.type} onClick={() => addBlock(bt.type)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', color: '#374151', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    {bt.icon} {bt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
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
              course={{ ...course, custom_layout: { blocks } }}
              isEnrolled={false}
              onEnroll={() => {}}
              slug={course?.slug}
            />
          </div>
        </div>
      )}
        </div>
      </div>
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
      style={{ height: active ? '48px' : '8px', borderRadius: '8px', background: active ? 'rgba(255,159,28,0.2)' : 'transparent', border: active ? '2px dashed #FF9F1C' : '2px dashed transparent', transition: 'all 0.15s', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {active && <span style={{ fontSize: '12px', color: '#FF9F1C', fontWeight: '600' }}>Drop here</span>}
    </div>
  );
}

// ─── Block Preview (simplified canvas render) ────────────────────────
function BlockPreview({ block }) {
  const p = block.props;

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
        <div style={{ ...previewStyle, ...bgStyle, padding: '32px 20px', color: '#fff', position: 'relative' }}>
          {p.backgroundImage && <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${p.overlayOpacity ?? 0.5})`, zIndex: 1 }} />}
          <div style={{ position: 'relative', zIndex: 2, display: isSplit ? 'grid' : 'block', gridTemplateColumns: isSplit ? '1.2fr 0.8fr' : 'none', gap: '20px', alignItems: 'center' }}>
            <div style={{ textAlign: p.align === 'center' ? 'center' : 'left' }}>
              {p.badge && (
                <span style={{ display: 'inline-block', background: 'rgba(255,159,28,0.2)', color: '#FF9F1C', padding: '3px 10px', borderRadius: '9999px', fontSize: '9px', fontWeight: '700', marginBottom: '8px' }}>
                  {p.badge}
                </span>
              )}
              <h1 style={{ fontSize: '20px', fontWeight: '900', color: p.textColor || '#fff', marginBottom: '8px', fontFamily: 'Outfit, sans-serif', lineHeight: 1.2 }}>
                {p.title || 'Course Title'}
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
            {isSplit && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {p.rightAssetType === 'image' && p.rightImage && (
                  <img src={p.rightImage} alt="" style={{ width: '100%', maxHeight: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                )}
                {p.rightAssetType === 'video' && p.rightVideoUrl && (
                  <div style={{ width: '100%', height: '90px', background: '#000', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', border: '1px solid rgba(255,255,255,0.1)' }}>🎬 Video</div>
                )}
                {p.rightAssetType === 'image' && !p.rightImage && (
                  <div style={{ width: '100%', height: '90px', background: 'rgba(255,255,255,0.1)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🖼️</div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'text':
      return (
        <div style={{ ...previewStyle, background: p.background || '#fff', padding: '24px 20px' }}>
          <div style={{ textAlign: p.align || 'left' }}>
            {p.eyebrow && <p style={{ fontSize: '9px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{p.eyebrow}</p>}
            {p.heading && <h2 style={{ fontSize: '16px', fontWeight: '800', color: p.headingColor || '#1A1B4B', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>{p.heading}</h2>}
            {p.content && <div style={{ fontSize: '11px', color: p.textColor || '#4B5563', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{p.content}</div>}
          </div>
        </div>
      );

    case 'video': {
      const ytId = getYouTubeId(p.url);
      return (
        <div style={{ ...previewStyle, background: p.background || '#0F0F0F', padding: '20px', color: '#fff', textAlign: 'center' }}>
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
        <div style={{ ...previewStyle, background: p.background || '#fff', padding: '16px 20px', textAlign: 'center' }}>
          {p.src ? (
            <img src={p.src} alt="" style={{ maxWidth: '100%', maxHeight: '120px', objectFit: p.fit || 'contain', borderRadius: `${p.borderRadius || 12}px` }} />
          ) : (
            <div style={{ width: '100%', height: '80px', background: '#F3F4F6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', border: '1px dashed #D1D5DB' }}>🖼️ Paste Image URL in properties</div>
          )}
          {p.caption && <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '6px', fontStyle: 'italic' }}>{p.caption}</p>}
        </div>
      );

    case 'features': {
      const cols = p.columns || 3;
      return (
        <div style={{ ...previewStyle, background: p.background || '#F8F9FE', padding: '24px 20px' }}>
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
        <div style={{ ...previewStyle, background: p.background || '#1A1B4B', padding: '20px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${(p.items || []).length || 4}, 1fr)`, gap: '12px', textAlign: 'center' }}>
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
        <div style={{ ...previewStyle, background: p.background || '#F0F2F5', padding: '24px 20px', textAlign: 'center' }}>
          {p.heading && <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1A1B4B', marginBottom: '12px' }}>{p.heading}</h3>}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', maxWidth: '480px', margin: '0 auto' }}>
            <p style={{ fontSize: '11px', color: '#374151', fontStyle: 'italic', margin: '0 0 8px' }}>
              "{(p.items || [])[0]?.text || 'Student feedback goes here.'}"
            </p>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#1A1B4B' }}>- {(p.items || [])[0]?.name || 'Student Name'}</div>
          </div>
        </div>
      );

    case 'instructor':
      return (
        <div style={{ ...previewStyle, background: p.background || '#fff', padding: '24px 20px' }}>
          <div style={{ background: p.cardBackground || '#F8F9FE', borderRadius: '12px', padding: '16px', border: '1px solid rgba(26,27,75,0.06)', display: 'flex', gap: '16px', alignItems: 'center', maxWidth: '540px', margin: '0 auto' }}>
            {p.avatar ? (
              <img src={p.avatar} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1A1B4B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>{(p.name || 'R')[0]}</div>
            )}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#1A1B4B', margin: 0 }}>{p.name || 'Instructor'}</h4>
              <p style={{ fontSize: '10px', color: '#FF9F1C', margin: '2px 0 0', fontWeight: '600' }}>{p.title}</p>
            </div>
          </div>
        </div>
      );

    case 'curriculum':
      return (
        <div style={{ ...previewStyle, background: p.background || '#F8F9FE', padding: '20px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#1A1B4B', margin: '0 0 6px' }}>{p.heading || 'Course Curriculum'}</h4>
          <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: '#374151' }}>
            📚 Curriculum layout is automatically populated from course modules
          </div>
        </div>
      );

    case 'enroll_card':
      return (
        <div style={{ ...previewStyle, background: p.background || '#F0F2F5', padding: '24px 20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.04)', maxWidth: '360px', margin: '0 auto' }}>
            <div style={{ background: p.headerBg || '#1A1B4B', padding: '12px', color: '#fff', textAlign: 'center', fontSize: '12px', fontWeight: '700' }}>
              {p.headerTitle || 'Start Learning'}
            </div>
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#1A1B4B', marginBottom: '10px' }}>₹ Price Display</div>
              <button style={{ background: p.btnColor || '#FF9F1C', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', width: '100%', fontSize: '11px', fontWeight: '800' }}>
                {p.btnText || 'Enroll Now'}
              </button>
            </div>
          </div>
        </div>
      );

    case 'faq':
      return (
        <div style={{ ...previewStyle, background: p.background || '#fff', padding: '24px 20px' }}>
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
        <div style={{ ...previewStyle, background: p.background || '#1A1B4B', padding: '24px 20px', textAlign: 'center', color: '#fff' }}>
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
        <div style={{ ...previewStyle, background: p.background || 'linear-gradient(135deg, #1A1B4B, #2D1B69)', padding: '28px 20px', textAlign: 'center', color: '#fff' }}>
          {p.heading && <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#fff', marginBottom: '6px', fontFamily: 'Outfit, sans-serif' }}>{p.heading}</h2>}
          {p.subheading && <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', marginBottom: '14px', maxWidth: '420px', margin: '0 auto 14px' }}>{p.subheading}</p>}
          <button style={{ background: p.btnColor || '#FF9F1C', color: p.btnTextColor || '#1A1B4B', border: 'none', borderRadius: '8px', padding: '8px 24px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
            {p.btnText || 'Enroll Now'}
          </button>
          {p.note && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginTop: '10px' }}>{p.note}</p>}
        </div>
      );

    case 'two_column': {
      const lType = p.leftType || (p.leftImage ? 'image' : 'text');
      const rType = p.rightType || (p.rightImage ? 'image' : 'text');
      const gridCols = p.leftWidth && p.leftWidth.includes(' ') ? p.leftWidth : '1fr 1fr';

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
        
        // Text type
        const heading = col === 'left' ? p.leftHeading : p.rightHeading;
        const content = col === 'left' ? p.leftContent : p.rightContent;
        const ctaText = col === 'left' ? p.leftCtaText : p.rightCtaText;
        const ctaColor = col === 'left' ? p.leftCtaColor : p.rightCtaColor;
        const ctaTextColor = col === 'left' ? p.leftCtaTextColor : p.rightCtaTextColor;
        
        return (
          <div style={{ textAlign: 'left' }}>
            {heading && <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#1A1B4B', marginBottom: '4px' }}>{heading}</h4>}
            {content && <p style={{ fontSize: '9px', color: '#4B5563', lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{content}</p>}
            {ctaText && (
              <button style={{ marginTop: '8px', background: ctaColor || '#FF9F1C', color: ctaTextColor || '#1A1B4B', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '9px', fontWeight: '700' }}>
                {ctaText}
              </button>
            )}
          </div>
        );
      };

      return (
        <div style={{ ...previewStyle, background: p.background || '#fff', padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: `${p.gap ? p.gap / 2 : 20}px`, alignItems: 'center' }}>
            <div>{renderColumnPreview(lType, 'left')}</div>
            <div>{renderColumnPreview(rType, 'right')}</div>
          </div>
        </div>
      );
    }

    case 'divider':
      return (
        <div style={{ ...previewStyle, background: p.background || 'transparent', padding: '4px 0' }}>
          <div style={{ height: `${(p.height || 48) / 3}px`, display: 'flex', alignItems: 'center' }}>
            {p.showLine && <div style={{ width: '100%', height: '1px', background: p.lineColor || '#E5E7EB' }} />}
          </div>
        </div>
      );

    case '__row__':
      return <div style={previewStyle}><p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>Row container</p></div>;

    default:
      return <div style={previewStyle}><p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>{block.type} block</p></div>;
  }
}

// ─── Shared micro-styles ─────────────────────────────────────────────
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
