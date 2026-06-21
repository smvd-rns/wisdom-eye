'use client';

import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SpecialCourseLanding from '@/components/SpecialCourseLanding';
import RichTextEditor from '@/components/RichTextEditor';
import { buildAnchorPosition, getAnchorElement, migrateFloatingBlocks, resolveAnchorBlockId, resolveAnchorPosition } from '@/lib/floatingTextPosition';
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
  { type: 'floating_text', label: 'Floating Text', icon: '🍃', desc: 'Text box that floats/overlays anywhere', color: '#EC4899' },
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
  { type: 'slider', label: 'Image Slider', icon: '🎠', desc: 'Auto-playing image slider/carousel', color: '#8B5CF6' },
  { type: 'banner', label: 'Alert Banner', icon: '📢', desc: 'Header notification bar', color: '#EF4444' },
  { type: 'html_embed', label: 'Custom HTML', icon: '💻', desc: 'Raw HTML / Iframe / Map embed', color: '#111827' },
  { type: 'instructor', label: 'Instructor Card', icon: '👨‍🏫', desc: 'About the instructor', color: '#059669' },
  { type: 'curriculum', label: 'Curriculum', icon: '📚', desc: 'Course modules (auto-populated)', color: '#D97706' },
  { type: 'enroll_card', label: 'Enroll Card', icon: '💰', desc: 'Price & enroll button', color: '#16A34A' },
  { type: 'faq', label: 'FAQ Accordion', icon: '❓', desc: 'Frequently asked questions', color: '#DC2626' },
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
  system_credentials: {
    credentials: [
      { src: "https://lh3.googleusercontent.com/d/19yYbEATwSgrOVfuKk339h6j6qVNY48Nw", alt: "IIT Mumbai Topper" },
      { src: "https://lh3.googleusercontent.com/d/1zHSviGsVWpcjqEEcDClEht0qNihIQ8qp", alt: "Temple President ISKCON Pune" },
      { src: "https://lh3.googleusercontent.com/d/1etXzaXu2p4rmW81PrMW6T-bHRfKIZzSQ", alt: "Temple Management Council Member ISKCON Abids" },
      { src: "https://lh3.googleusercontent.com/d/1vu3f15JL_oJ8LAiYq4WItoVSH4Of5uEz", alt: "Global Duty Officer Youth Training ISKCON" }
    ]
  },
  system_logos: {
    title: 'Corporate Trainer',
    autoplayInterval: 25,
    logos: [
      { name: 'Amazon', logo: 'https://lh3.googleusercontent.com/d/1DF9uSwnpkjGQ9OXDNGDR8B-dCiuJaPX4' },
      { name: 'Infosys', logo: 'https://lh3.googleusercontent.com/d/1oFHK0JU99lHxpGuqwiXqox-Nm6BhFxqx' },
      { name: 'Microsoft', logo: 'https://lh3.googleusercontent.com/d/Sr0qsDkIeZMEw3u2oTZh_RM8qbsFMhFs' },
      { name: 'Copart', logo: 'https://lh3.googleusercontent.com/d/1iL1K0SP21l_qL6Kk6ffnLIadsd-jZuwY' },
      { name: 'Cognizant', logo: 'https://lh3.googleusercontent.com/d/1vUpMGwycvntOjh3tAgaeO7lMLqB6SdJ_' },
      { name: 'Tata Technologies', logo: 'https://lh3.googleusercontent.com/d/1-3jI0h1ee7fKUs_P2LB_xAqrqSKm5ZNE' },
      { name: 'Bank of America', logo: 'https://lh3.googleusercontent.com/d/1OEC-o5xewzCsEU-MzH2Hs07_I6EHpfTI' },
      { name: 'Deutsche Bank', logo: 'https://lh3.googleusercontent.com/d/13i_fpLr15wL6Y3LeTwzMjDftxMR-Y1WX' },
      { name: 'Persistent', logo: 'https://lh3.googleusercontent.com/d/1-9Qxn6bc__GW5b3v3GEQdU4EukG9THUK' }
    ]
  },
  system_featured: {
    featuredCards: [
      { type: 'book', badge: 'Featured Book', title: 'Wisdom Eye', desc: 'Laying the foundation for character and personal leadership success.', image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/WisdomEye-cover.jpg?v=1780304483', link: '/books', linkText: 'View All Books' },
      { type: 'academy', badge: 'Scripture Academy', title: 'Certified Courses', desc: 'Auto-graded quizzes, certification, and discussions under the guidance of Radheshyam Das.', image: 'https://gaurangadarshandas.com/images/courses/8aab8f0c77c546568fd0c9c430ef6547_dw6z4v.png', link: '/courses', linkText: 'Explore Academy' },
      { type: 'reading', badge: 'Daily Reading', title: 'Daily Reading Wisdom', desc: 'Start your day with spiritual inspiration and logical insights from timeless scriptures.', image: '', icon: 'BookOpenCheck', link: '/daily-reading', linkText: 'Read Daily Verse' }
    ]
  },
  system_about: {
    heading: 'Radheshyam Das',
    avatar: 'https://lh3.googleusercontent.com/d/1MN4z91XjyCUFfuOPKDCeBse8TwAfJRVg',
    bio1: 'Radheshyam Das is an IIT Mumbai Topper who dedicated his life as a full-time monk, youth educator, and author. Born in a devout family near Madurai, his childhood was fascinated by Vedic chants and philosophical classics.',
    bio2: 'After top ranking at IIT Mumbai, working as a Senior Research Fellow and mechanical engineer at top companies, he took up the role of a celibate monk. He designed the DYS (Discover Your Self) and GAME (Gita for All Made Easy) course structures which are taught across leading universities.',
    background: '#FAF8F5'
  },
  system_books: {
    heading: 'Featured Books',
    subLabel: 'Publications',
    viewAllUrl: 'https://voicepublication.in',
    books: [
      { id: 1, title: 'The Happiness Paradox (SS Series - Book 1)', price: '₹170.00', url: 'https://voicepublication.in/products/the-happiness-paradox', image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/TheHappinessParadox-cover.jpg?v=1780304890' },
      { id: 3, title: 'Decoding the Self (CC Series - Book 1)', price: '₹200.00', url: 'https://voicepublication.in/products/decoding-the-self', image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/TCCDecodingtheself-cover.jpg?v=1780305591' },
      { id: 5, title: 'Your Best Friend', price: '₹280.00', url: 'https://voicepublication.in/products/your-best-friend', image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/YourBestFriend-front.jpg?v=1764746523' },
      { id: 6, title: 'Wisdom Eye (Course 1) - Laying the Foundation for Success', price: '₹150.00', url: 'https://voicepublication.in/products/wisdom-eye', image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/WisdomEye-cover.jpg?v=1780304483' }
    ]
  },
  system_youtube: {
    heading: 'Radheshyam Das YouTube Lectures',
    subLabel: 'Media Lectures',
    subscribeUrl: 'https://www.youtube.com/channel/UC9Pap1xwEQAo7X1tKqpcpWg',
    customVideos: []
  },
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
  floating_text: {
    content: '<h2><b>Floating Text Box</b></h2><p>Drag the ✥ handle to position me on a section — stays in place on all screen sizes!</p>',
    textColor: '#1f2937',
    background: '#ffffff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    width: 320,
    topPercent: 55,
    leftPercent: 58,
    zIndex: 50,
    shadow: true,
    positionMode: 'anchor',
    anchorBlockId: null,
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
  },
  slider: {
    autoplayInterval: 4000,
    height: 400,
    background: '#ffffff',
    paddingY: 40,
    slides: [
      { image: 'https://lh3.googleusercontent.com/d/1Bpk-lc_U4E2Gxo8_9b-43X-fHbrYWwrU', title: 'Welcome to our platform', subtitle: 'Timeless teachings and values for modern seekers', linkUrl: '' },
      { image: 'https://lh3.googleusercontent.com/d/1MN4z91XjyCUFfuOPKDCeBse8TwAfJRVg', title: 'Discover Yourself', subtitle: 'Begin your journey of spiritual and personal growth', linkUrl: '' }
    ]
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

  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryFiles, setLibraryFiles] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  const currentValue = value !== undefined ? value : (context?.p ? context.p[field] : '');
  const handleChange = onChange || (val => context?.set(field, val));

  const loadLibraryFiles = async () => {
    setLoadingLibrary(true);
    try {
      const res = await fetch('/api/admin/upload-drive');
      if (res.ok) {
        const data = await res.json();
        setLibraryFiles(data.files || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLibrary(false);
    }
  };

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
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
      <input
        type="text"
        value={currentValue ?? ''}
        onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inputStyle, flex: 1, minWidth: '150px' }}
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
      <button
        type="button"
        onClick={() => { loadLibraryFiles(); setShowLibrary(true); }}
        style={{
          background: '#F3F4F6',
          border: '1.5px solid #D1D5DB',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '11px',
          fontWeight: '700',
          color: '#374151',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.15s'
        }}
      >
        🗂️ Library
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Media Library Selector Modal */}
      {showLibrary && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} onClick={() => setShowLibrary(false)}>
          <div style={{
            background: '#FFF',
            borderRadius: '20px',
            padding: '28px',
            width: '100%',
            maxWidth: '580px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            color: '#1A1B4B'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif', margin: 0 }}>Media Library</h3>
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px', margin: '4px 0 0 0' }}>Choose a previously uploaded image.</p>
              </div>
              <button onClick={() => setShowLibrary(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '20px' }}>×</button>
            </div>

            {loadingLibrary ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '160px', color: '#9CA3AF', gap: '8px' }}>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Loading media library...
              </div>
            ) : libraryFiles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: '#9CA3AF', fontSize: '13px' }}>
                No uploaded files found. Upload an image to start your library!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px', maxHeight: '240px', overflowY: 'auto', padding: '4px' }}>
                {libraryFiles.map(file => (
                  <div 
                    key={file.id} 
                    onClick={() => {
                      handleChange(file.url);
                      setShowLibrary(false);
                    }}
                    style={{
                      border: '1.5px solid #E5E7EB',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: '#FAFAFA'
                    }}
                  >
                    <img src={file.url} alt="" style={{ width: '100%', height: '70px', objectFit: 'cover' }} />
                    <div style={{ padding: '6px', fontSize: '10px', color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.file_name}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="button" onClick={() => setShowLibrary(false)} style={{ padding: '8px 16px', background: '#F3F4F6', color: '#4B5563', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Textarea = ({ field, rows = 3, placeholder = '', rich = true }) => {
  const { p, set, setBatch } = useContext(PropsContext);
  return (
    <RichTextEditor
      value={p[field] ?? ''}
      onChange={html => {
        if (p.textAnimation && p.textAnimation !== 'none') {
          setBatch({ [field]: html, _previewTrigger: (p._previewTrigger || 0) + 1 });
        } else {
          set(field, html);
        }
      }}
      rows={rows}
      rich={rich}
      placeholder={placeholder}
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
        <button
          type="button"
          onClick={() => set(field, 'transparent')}
          style={{
            padding: '6px 10px',
            fontSize: '11px',
            fontWeight: '600',
            background: p[field] === 'transparent' ? '#EC4899' : '#F3F4F6',
            color: p[field] === 'transparent' ? '#FFF' : '#374151',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🚫 Trans
        </button>
      </div>
    </Field>
  );
};

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: '11px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', letterSpacing: '1px', padding: '10px 0 6px', borderBottom: '1px solid #F3F4F6', marginBottom: '12px' }}>
    {children}
  </div>
);

// ─── Animation Section (shared across all block types) ────────────────────
const ANIMATION_OPTIONS = [
  { value: 'none', label: '— None —' },
  { value: 'fade-in', label: '✨ Fade In' },
  { value: 'fade-up', label: '⬆️ Fade Up' },
  { value: 'fade-down', label: '⬇️ Fade Down' },
  { value: 'fade-left', label: '➡️ Fade Left' },
  { value: 'fade-right', label: '⬅️ Fade Right' },
  { value: 'zoom-in', label: '🔍 Zoom In' },
  { value: 'zoom-out', label: '🔎 Zoom Out' },
  { value: 'flip-up', label: '🔄 Flip Up' },
  { value: 'flip-left', label: '↩️ Flip Left' },
  { value: 'flip-right', label: '↪️ Flip Right' },
  { value: 'bounce-in', label: '🏀 Bounce In' },
  { value: 'slide-up', label: '🚀 Slide Up' },
  { value: 'slide-down', label: '📥 Slide Down' },
  { value: 'slide-left', label: '📲 Slide Left' },
  { value: 'slide-right', label: '📳 Slide Right' },
  { value: 'rotate-in', label: '🌀 Rotate In' },
  { value: 'skew-up', label: '📐 Skew Up' },
  { value: 'blur-in', label: '🌫️ Blur In' },
  { value: 'roll-in', label: '🎳 Roll In' },
  { value: 'swing-in', label: '🎵 Swing In' },
  { value: 'elastic-up', label: '🎸 Elastic Up' },
  { value: 'pulse-in', label: '💓 Pulse In' },
];

const EASING_OPTIONS = [
  { value: 'ease', label: 'Ease (smooth)' },
  { value: 'ease-in', label: 'Ease In (accelerate)' },
  { value: 'ease-out', label: 'Ease Out (decelerate)' },
  { value: 'ease-in-out', label: 'Ease In-Out (balanced)' },
  { value: 'linear', label: 'Linear (constant)' },
  { value: 'cubic-bezier(0.34,1.56,0.64,1)', label: 'Spring (overshoot)' },
  { value: 'cubic-bezier(0.25,0.46,0.45,0.94)', label: 'Quint (snappy)' },
  { value: 'cubic-bezier(0.68,-0.55,0.265,1.55)', label: 'Back (elastic)' },
];

const AnimationSection = () => {
  const { p, setBatch } = useContext(PropsContext);
  const [previewKey, setPreviewKey] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const anim = p.animation || 'none';
  const dur = p.animationDuration ?? 0.8;
  const delay = p.animationDelay ?? 0;
  const ease = p.animationEasing ?? 'ease-out';

  const ANIM_ITEMS = [
    { value: 'none', icon: '✕', label: 'None' },
    { value: 'fade-in', icon: '✦', label: 'Fade' },
    { value: 'fade-up', icon: '↑', label: 'Fade Up' },
    { value: 'fade-down', icon: '↓', label: 'Fade Down' },
    { value: 'fade-left', icon: '→', label: 'Fade ←' },
    { value: 'fade-right', icon: '←', label: 'Fade →' },
    { value: 'zoom-in', icon: '⊕', label: 'Zoom In' },
    { value: 'zoom-out', icon: '⊖', label: 'Zoom Out' },
    { value: 'slide-up', icon: '⇑', label: 'Slide Up' },
    { value: 'slide-down', icon: '⇓', label: 'Slide Down' },
    { value: 'slide-left', icon: '⇒', label: 'Slide ←' },
    { value: 'slide-right', icon: '⇐', label: 'Slide →' },
    { value: 'flip-up', icon: '⟳', label: 'Flip Up' },
    { value: 'flip-left', icon: '↻', label: 'Flip L' },
    { value: 'flip-right', icon: '↺', label: 'Flip R' },
    { value: 'bounce-in', icon: '◎', label: 'Bounce' },
    { value: 'rotate-in', icon: '↕', label: 'Rotate' },
    { value: 'blur-in', icon: '◌', label: 'Blur In' },
    { value: 'elastic-up', icon: '⤴', label: 'Elastic' },
    { value: 'swing-in', icon: '♫', label: 'Swing' },
    { value: 'pulse-in', icon: '◉', label: 'Pulse' },
    { value: 'roll-in', icon: '●', label: 'Roll In' },
    { value: 'skew-up', icon: '⟋', label: 'Skew' },
  ];

  const PRESETS = [
    { name: 'Gentle', color: '#059669', lightBg: '#ECFDF5', dur: 0.8, delay: 0, ease: 'ease-out' },
    { name: 'Snappy', color: '#2563EB', lightBg: '#EFF6FF', dur: 0.45, delay: 0, ease: 'cubic-bezier(0.25,0.46,0.45,0.94)' },
    { name: 'Dramatic', color: '#7C3AED', lightBg: '#F5F3FF', dur: 1.2, delay: 0.1, ease: 'ease-in-out' },
    { name: 'Playful', color: '#D97706', lightBg: '#FFFBEB', dur: 0.9, delay: 0, ease: 'cubic-bezier(0.34,1.56,0.64,1)' },
    { name: 'Cinematic', color: '#DC2626', lightBg: '#FEF2F2', dur: 1.5, delay: 0.2, ease: 'ease' },
  ];

  const currentPreset = PRESETS.find(pr =>
    Math.abs(pr.dur - dur) < 0.06 && Math.abs(pr.delay - delay) < 0.06 && pr.ease === ease
  );

  const handleAnimSelect = (val) => {
    const updates = { animation: val };
    if (val !== 'none' && (!p.animationDuration || anim === 'none')) {
      updates.animationDuration = 0.8;
      updates.animationDelay = 0;
      updates.animationEasing = 'ease-out';
    }
    setBatch(updates);
    if (val !== 'none') setPreviewKey(k => k + 1);
  };

  const applyPreset = (preset) => {
    setBatch({ animationDuration: preset.dur, animationDelay: preset.delay, animationEasing: preset.ease });
    setPreviewKey(k => k + 1);
  };

  const selectedAnimItem = ANIM_ITEMS.find(a => a.value === anim);

  return (
    <div>
      <SectionTitle>✨ Scroll Animation</SectionTitle>

      {/* Animation Effect Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px', marginBottom: '12px' }}>
        {ANIM_ITEMS.map(item => {
          const isNone = item.value === 'none';
          const isSelected = anim === item.value;
          return (
            <button
              key={item.value}
              onClick={() => handleAnimSelect(item.value)}
              style={{
                background: isSelected ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : isNone ? '#fff' : '#F5F3FF',
                color: isSelected ? '#fff' : isNone ? '#9CA3AF' : '#5B21B6',
                border: isSelected ? '2px solid #4F46E5' : isNone ? '1.5px dashed #D1D5DB' : '1.5px solid #DDD6FE',
                borderRadius: '8px',
                padding: '7px 3px 6px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                transition: 'all 0.15s',
                boxShadow: isSelected ? '0 3px 10px rgba(79,70,229,0.35)' : 'none',
                outline: 'none',
              }}
            >
              <span style={{ fontSize: '16px', lineHeight: 1, display: 'block' }}>{item.icon}</span>
              <span style={{ fontSize: '9.5px', lineHeight: 1.2, textAlign: 'center', fontWeight: isSelected ? '700' : '600' }}>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Panel (when animation selected) */}
      {anim !== 'none' && (
        <div style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)', border: '1.5px solid #C4B5FD', borderRadius: '12px', padding: '12px' }}>

          {/* Style Presets */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '7px' }}>
              🎨 Style — {currentPreset ? currentPreset.name : 'Custom'}
            </div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {PRESETS.map(preset => {
                const isActive = currentPreset?.name === preset.name;
                return (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    title={`Duration: ${preset.dur}s, Delay: ${preset.delay}s`}
                    style={{
                      background: isActive ? preset.color : preset.lightBg,
                      color: isActive ? '#fff' : preset.color,
                      border: `1.5px solid ${isActive ? preset.color : preset.color + '60'}`,
                      borderRadius: '20px',
                      padding: '4px 11px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      outline: 'none',
                      boxShadow: isActive ? `0 2px 8px ${preset.color}40` : 'none',
                    }}
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stagger Toggle */}
          <div style={{ marginBottom: '12px', borderTop: '1px dashed #C4B5FD', paddingTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!p.animationStagger}
                onChange={e => setBatch({ animationStagger: e.target.checked, _previewTrigger: (p._previewTrigger || 0) + 1 })}
                style={{ accentColor: '#7C3AED' }}
              />
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#5B21B6' }}>✨ Stagger child elements in sequence</span>
            </label>
          </div>

          {/* Live Mini Preview */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '7px' }}>
              👁 Preview
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
              <div
                key={previewKey}
                data-sa-animation={anim}
                className="sa-visible"
                style={{
                  '--sa-dur': `${dur}s`,
                  '--sa-delay': '0s',
                  '--sa-ease': ease,
                  flex: 1,
                  minHeight: '48px',
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: '700',
                  gap: '6px',
                  overflow: 'hidden',
                }}
              >
                <span>{selectedAnimItem?.icon}</span>
                <span>{selectedAnimItem?.label} effect</span>
              </div>
              <button
                onClick={() => {
                  setPreviewKey(k => k + 1);
                  setBatch({ _previewTrigger: (p._previewTrigger || 0) + 1 });
                }}
                title="Replay preview"
                style={{
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0 14px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 3px 10px rgba(79,70,229,0.35)',
                }}
              >
                ▶
              </button>
            </div>
          </div>

          {/* Advanced Toggle */}
          <button
            onClick={() => setShowAdvanced(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#7C3AED', fontWeight: '700', padding: 0, display: 'flex', alignItems: 'center', gap: '4px', outline: 'none', marginBottom: showAdvanced ? '8px' : 0 }}
          >
            ⚙ Advanced {showAdvanced ? '▲' : '▼'}
          </button>

          {showAdvanced && (
            <div style={{ paddingTop: '10px', borderTop: '1px dashed #C4B5FD' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#4B5563', width: '56px', flexShrink: 0 }}>Duration</span>
                <input type="range" min="0.1" max="2.5" step="0.1" value={dur}
                  onChange={e => { setBatch({ animationDuration: parseFloat(e.target.value), _previewTrigger: (p._previewTrigger || 0) + 1 }); setPreviewKey(k => k + 1); }}
                  style={{ flex: 1, accentColor: '#7C3AED' }} />
                <span style={{ fontSize: '11px', color: '#7C3AED', fontWeight: '700', width: '32px', textAlign: 'right' }}>{dur}s</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#4B5563', width: '56px', flexShrink: 0 }}>Delay</span>
                <input type="range" min="0" max="2" step="0.1" value={delay}
                  onChange={e => setBatch({ animationDelay: parseFloat(e.target.value), _previewTrigger: (p._previewTrigger || 0) + 1 })}
                  style={{ flex: 1, accentColor: '#7C3AED' }} />
                <span style={{ fontSize: '11px', color: '#7C3AED', fontWeight: '700', width: '32px', textAlign: 'right' }}>{delay}s</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#4B5563', width: '56px', flexShrink: 0 }}>Easing</span>
                <select value={ease} onChange={e => setBatch({ animationEasing: e.target.value, _previewTrigger: (p._previewTrigger || 0) + 1 })}
                  style={{ ...inputStyle, flex: 1, fontSize: '11px', padding: '4px 8px' }}>
                  {EASING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TextAnimationSection = () => {
  const { p, setBatch } = useContext(PropsContext);
  const textAnim = p.textAnimation || 'none';

  const TEXT_ANIM_OPTIONS = [
    { value: 'none', label: '— None (Static Text) —' },
    { value: 'typewriter', label: '⌨️ Typewriter (Keyboard)' },
    { value: 'pencil', label: '✏️ Handwriting (Pencil)' },
    { value: 'quill', label: '✒️ Feather Quill (Ink Writer)' },
    { value: 'word-fade', label: '✨ Word Fade & Rise' },
    { value: 'focus-blur', label: '🔍 Focus & Blur Reveal' },
    { value: 'sparkle', label: '🌟 Gold Shine & Sparkle' },
    { value: 'rainbow', label: '🌈 Rainbow Gradient Sweep' },
    { value: 'bounce', label: '⚽ Bounce Letter Wave' },
    { value: 'flip', label: '🔄 3D Flip Reveal' },
    { value: 'fly-in', label: '✈️ Fly In (Left/Right)' },
    { value: 'scale-pop', label: '💥 Elastic Scale Pop' },
    { value: 'letter-merge', label: '↔️ Letter Space Collapse' },
    { value: 'neon-flicker', label: '💡 Neon Sign Flicker' },
    { value: 'clip-slide', label: '🎞️ Slide Up & Clip Reveal' },
    { value: 'wave-sine', label: '🌊 Sine Wave Float' },
  ];

  return (
    <div style={{ borderTop: '1.5px solid #E5E7EB', paddingTop: '14px', marginTop: '14px' }}>
      <SectionTitle>📖 Text Appearance Effect</SectionTitle>
      <Field label="Text Animation Style">
        <select
          value={textAnim}
          onChange={e => setBatch({ textAnimation: e.target.value, _previewTrigger: (p._previewTrigger || 0) + 1 })}
          style={{ ...inputStyle, background: '#fff' }}
        >
          {TEXT_ANIM_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Field>
    </div>
  );
};

// ─── Properties Panel Component (Extended blocks properties) ──────────────────────────────────────
function PropsPanel({ block, onChange, onTypeChange, allBlocks = [] }) {
  if (!block) return (
    <div style={{ padding: '32px 20px', textAlign: 'center', color: '#9CA3AF' }}>
      <Layers size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
      <p style={{ fontSize: '13px' }}>Click a block on the canvas to edit its properties</p>
    </div>
  );

  const p = block.props;
  const set = (key, val) => onChange({ ...block, props: { ...p, [key]: val } });
  const setBatch = (updates) => onChange({ ...block, props: { ...p, ...updates } });

  const renderContent = () => {
    switch (block.type) {
      case 'hero': return (
        <div style={propsScroll}>
          <SectionTitle>Content</SectionTitle>
          <Field label="Badge Text"><Textarea field="badge" rows={1} placeholder="🌟 Featured Wisdom" /></Field>
          <Field label="Main Title"><Textarea field="title" rows={2} /></Field>
          <Field label="Subtitle"><Textarea field="subtitle" rows={3} /></Field>
          <Field label="CTA Button Text"><Textarea field="ctaText" rows={1} placeholder="Explore Courses" /></Field>
          <Field label="Secondary Button (optional)"><Textarea field="secondaryCta" rows={1} placeholder="Watch Preview" /></Field>

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
          <Field label="Eyebrow"><Textarea field="eyebrow" rows={1} placeholder="Top label" /></Field>
          <Field label="Heading"><Textarea field="heading" rows={2} placeholder="Main heading" /></Field>
          <Field label="Body Text"><Textarea field="content" rows={6} /></Field>

          <SectionTitle>Design</SectionTitle>
          <ColorRow field="background" label="Background Color" />
          <ColorRow field="headingColor" label="Heading Text Color" />
          <ColorRow field="textColor" label="Body Text Color" />
          <Field label="Text Alignment"><Select field="align" options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} /></Field>
          <Field label="Heading Size (px)"><Input field="headingSize" type="number" min={16} max={72} /></Field>
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

      case 'floating_text': return (
        <div style={propsScroll}>
          <SectionTitle>Floating Content</SectionTitle>
          <Field label="Content"><Textarea field="content" rows={6} /></Field>
          <SectionTitle>Positioning</SectionTitle>
          <Field label="Pin to Section" hint="Text position is % inside this section — responsive on all screens">
            <Select
              field="anchorBlockId"
              options={allBlocks
                .filter(b => b.type !== 'floating_text')
                .map(b => ({
                  value: b.id,
                  label: `${BLOCK_TYPES.find(t => t.type === b.type)?.icon || ''} ${BLOCK_TYPES.find(t => t.type === b.type)?.label || b.type}`,
                }))}
            />
          </Field>
          <Field label="Top (% within section)"><Input field="topPercent" type="number" min={0} max={95} step={0.5} /></Field>
          <Field label="Left (% within section)"><Input field="leftPercent" type="number" min={0} max={95} step={0.5} /></Field>
          <Field label="Width (px)"><Input field="width" type="number" min={50} max={1200} /></Field>
          <Field label="Z-Index"><Input field="zIndex" type="number" min={0} max={1000} /></Field>
          
          <SectionTitle>Styling</SectionTitle>
          <ColorRow field="background" label="Background Color" />
          <ColorRow field="textColor" label="Text Color" />
          <ColorRow field="borderColor" label="Border Color" />
          <Field label="Border Width (px)"><Input field="borderWidth" type="number" min={0} max={10} /></Field>
          <Field label="Border Radius (px)"><Input field="borderRadius" type="number" min={0} max={50} /></Field>
          <Field label="Padding (px)"><Input field="padding" type="number" min={0} max={100} /></Field>
          <Toggle field="shadow" label="Show drop shadow" />
          
          <TextAnimationSection />
          <AnimationSection />
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

      case 'slider': return (
        <div style={propsScroll}>
          <SectionTitle>Slider Settings</SectionTitle>
          <Field label="Autoplay Delay (ms)"><Input field="autoplayInterval" type="number" min={1000} step={500} /></Field>
          <Field label="Height (px)"><Input field="height" type="number" min={100} max={1000} /></Field>
          <ColorRow field="background" label="Background Color" />
          <Field label="Vertical Padding (px)"><Input field="paddingY" type="number" min={0} max={120} /></Field>

          <SectionTitle>Slides</SectionTitle>
          {(p.slides || []).map((slide, i) => (
            <div key={i} style={{ background: '#F9FAFB', borderRadius: '10px', padding: '12px', marginBottom: '10px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>Slide {i + 1}</span>
                <button onClick={() => set('slides', (p.slides || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0 }}><X size={14} /></button>
              </div>
              <div style={{ marginBottom: '6px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#4B5563', marginBottom: '4px' }}>Slide Image</label>
                <ImageInput
                  value={slide.image || ''}
                  onChange={val => set('slides', (p.slides || []).map((s, j) => j === i ? { ...s, image: val } : s))}
                  placeholder="Upload or enter image URL"
                />
              </div>
              <input placeholder="Slide Title (optional)" value={slide.title || ''} onChange={e => set('slides', (p.slides || []).map((s, j) => j === i ? { ...s, title: e.target.value } : s))} style={{ ...inputStyle, marginBottom: '6px' }} />
              <input placeholder="Slide Subtitle (optional)" value={slide.subtitle || ''} onChange={e => set('slides', (p.slides || []).map((s, j) => j === i ? { ...s, subtitle: e.target.value } : s))} style={{ ...inputStyle, marginBottom: '6px' }} />
              <input placeholder="Link URL (optional)" value={slide.linkUrl || ''} onChange={e => set('slides', (p.slides || []).map((s, j) => j === i ? { ...s, linkUrl: e.target.value } : s))} style={inputStyle} />
            </div>
          ))}
          <button onClick={() => set('slides', [...(p.slides || []), { image: '', title: '', subtitle: '', linkUrl: '' }])} style={addItemBtn}>
            <Plus size={13} /> Add Slide
          </button>
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
          <Field label="Section Title"><Input field="title" /></Field>
          <Field label="Marquee Speed (seconds)" hint="Time to complete a full scroll loop (lower = faster)."><Input field="autoplayInterval" type="number" step={1} min={2} /></Field>
          
          <SectionTitle>Logos</SectionTitle>
          {(p.logos || []).map((logo, i) => (
            <div key={i} style={{ background: '#F9FAFB', borderRadius: '10px', padding: '12px', marginBottom: '10px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>Logo {i + 1}</span>
                <button onClick={() => set('logos', (p.logos || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0 }}><X size={14} /></button>
              </div>
              <div style={{ marginBottom: '6px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#4B5563', marginBottom: '4px' }}>Logo Image</label>
                <ImageInput
                  value={logo.logo || ''}
                  onChange={val => set('logos', (p.logos || []).map((l, j) => j === i ? { ...l, logo: val } : l))}
                  placeholder="Upload or enter URL"
                />
              </div>
              <input placeholder="Company Name" value={logo.name || ''} onChange={e => set('logos', (p.logos || []).map((l, j) => j === i ? { ...l, name: e.target.value } : l))} style={inputStyle} />
            </div>
          ))}
          <button onClick={() => set('logos', [...(p.logos || []), { logo: '', name: '' }])} style={addItemBtn}>
            <Plus size={13} /> Add Logo
          </button>
        </div>
      );

      case 'system_credentials': return (
        <div style={propsScroll}>
          <SectionTitle>Credentials Settings</SectionTitle>
          <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 12px 0' }}>Upload image certificates or achievements. They will auto-scroll on mobile view.</p>
          {(p.credentials || []).map((cred, i) => (
            <div key={i} style={{ background: '#F9FAFB', borderRadius: '10px', padding: '12px', marginBottom: '10px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>Credential {i + 1}</span>
                <button onClick={() => set('credentials', (p.credentials || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0 }}><X size={14} /></button>
              </div>
              <div style={{ marginBottom: '6px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#4B5563', marginBottom: '4px' }}>Certificate Image</label>
                <ImageInput
                  value={cred.src || ''}
                  onChange={val => set('credentials', (p.credentials || []).map((c, j) => j === i ? { ...c, src: val } : c))}
                  placeholder="Upload or enter URL"
                />
              </div>
              <input placeholder="Label / Alt text (e.g. IIT Topper)" value={cred.alt || ''} onChange={e => set('credentials', (p.credentials || []).map((c, j) => j === i ? { ...c, alt: e.target.value } : c))} style={inputStyle} />
            </div>
          ))}
          <button onClick={() => set('credentials', [...(p.credentials || []), { src: '', alt: '' }])} style={addItemBtn}>
            <Plus size={13} /> Add Credential
          </button>
        </div>
      );

      case 'system_featured': return (
        <div style={propsScroll}>
          <SectionTitle>Featured Cards Settings</SectionTitle>
          <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 12px 0' }}>Configure the 3 featured promo cards.</p>
          {(p.featuredCards || []).map((card, i) => (
            <div key={i} style={{ background: '#F9FAFB', borderRadius: '10px', padding: '12px', marginBottom: '10px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#1A1B4B', marginBottom: '8px' }}>Card {i + 1} ({card.badge})</div>
              <Field label="Badge/Eyebrow"><input value={card.badge || ''} onChange={e => set('featuredCards', (p.featuredCards || []).map((c, j) => j === i ? { ...c, badge: e.target.value } : c))} style={inputStyle} /></Field>
              <Field label="Title"><input value={card.title || ''} onChange={e => set('featuredCards', (p.featuredCards || []).map((c, j) => j === i ? { ...c, title: e.target.value } : c))} style={inputStyle} /></Field>
              <Field label="Description"><textarea value={card.desc || ''} onChange={e => set('featuredCards', (p.featuredCards || []).map((c, j) => j === i ? { ...c, desc: e.target.value } : c))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></Field>
              <Field label="Link URL"><input value={card.link || ''} onChange={e => set('featuredCards', (p.featuredCards || []).map((c, j) => j === i ? { ...c, link: e.target.value } : c))} style={inputStyle} /></Field>
              <Field label="Link Text"><input value={card.linkText || ''} onChange={e => set('featuredCards', (p.featuredCards || []).map((c, j) => j === i ? { ...c, linkText: e.target.value } : c))} style={inputStyle} /></Field>
              <Field label="Card Image (leave blank for reading icon)"><ImageInput value={card.image || ''} onChange={val => set('featuredCards', (p.featuredCards || []).map((c, j) => j === i ? { ...c, image: val } : c))} placeholder="Upload or enter URL" /></Field>
            </div>
          ))}
        </div>
      );

      case 'system_books': return (
        <div style={propsScroll}>
          <SectionTitle>Shopify Books Settings</SectionTitle>
          <Field label="Section Heading"><Input field="heading" /></Field>
          <Field label="Sub Label / Eyebrow"><Input field="subLabel" /></Field>
          <Field label="View All URL"><Input field="viewAllUrl" /></Field>

          <SectionTitle>Featured Books</SectionTitle>
          {(p.books || []).map((book, i) => (
            <div key={i} style={{ background: '#F9FAFB', borderRadius: '10px', padding: '12px', marginBottom: '10px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>Book {i + 1}</span>
                <button onClick={() => set('books', (p.books || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0 }}><X size={14} /></button>
              </div>
              <Field label="Book Cover"><ImageInput value={book.image || ''} onChange={val => set('books', (p.books || []).map((b, j) => j === i ? { ...b, image: val } : b))} placeholder="Upload or enter URL" /></Field>
              <Field label="Book Title"><input value={book.title || ''} onChange={e => set('books', (p.books || []).map((b, j) => j === i ? { ...b, title: e.target.value } : b))} style={inputStyle} /></Field>
              <Field label="Price Label"><input value={book.price || ''} onChange={e => set('books', (p.books || []).map((b, j) => j === i ? { ...b, price: e.target.value } : b))} style={inputStyle} /></Field>
              <Field label="Purchase Link"><input value={book.url || ''} onChange={e => set('books', (p.books || []).map((b, j) => j === i ? { ...b, url: e.target.value } : b))} style={inputStyle} /></Field>
            </div>
          ))}
          <button onClick={() => set('books', [...(p.books || []), { image: '', title: 'New Book', price: '₹150.00', url: '' }])} style={addItemBtn}>
            <Plus size={13} /> Add Book
          </button>
        </div>
      );

      case 'system_youtube': return (
        <div style={propsScroll}>
          <SectionTitle>YouTube Settings</SectionTitle>
          <Field label="Section Heading"><Input field="heading" /></Field>
          <Field label="Sub Label / Eyebrow"><Input field="subLabel" /></Field>
          <Field label="Subscribe Channel URL"><Input field="subscribeUrl" /></Field>

          <SectionTitle>Custom Video Playlist</SectionTitle>
          <p style={{ fontSize: '10px', color: '#9CA3AF', margin: '0 0 10px' }}>Add specific videos manually (overrides auto-fetch).</p>
          {(p.customVideos || []).map((video, i) => (
            <div key={i} style={{ background: '#F9FAFB', borderRadius: '10px', padding: '12px', marginBottom: '10px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>Video {i + 1}</span>
                <button onClick={() => set('customVideos', (p.customVideos || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0 }}><X size={14} /></button>
              </div>
              <Field label="YouTube Video ID (11 chars)"><input value={video.id || ''} onChange={e => set('customVideos', (p.customVideos || []).map((v, j) => j === i ? { ...v, id: e.target.value } : v))} style={inputStyle} placeholder="E.g. 1Bpk-lc_U4E" /></Field>
              <Field label="Video Title"><input value={video.title || ''} onChange={e => set('customVideos', (p.customVideos || []).map((v, j) => j === i ? { ...v, title: e.target.value } : v))} style={inputStyle} /></Field>
              <Field label="Thumbnail Image URL"><ImageInput value={video.thumbnail || ''} onChange={val => set('customVideos', (p.customVideos || []).map((v, j) => j === i ? { ...v, thumbnail: val } : v))} placeholder="Leave blank for default" /></Field>
            </div>
          ))}
          <button onClick={() => set('customVideos', [...(p.customVideos || []), { id: '', title: '', thumbnail: '', publishedAt: new Date().toISOString() }])} style={addItemBtn}>
            <Plus size={13} /> Add Video
          </button>
        </div>
      );

      default: return (
        <div style={{ padding: '20px', color: '#9CA3AF', fontSize: '13px' }}>No properties for this block.</div>
      );
    }
  };

  return (
    <PropsContext.Provider value={{ p, set, setBatch }}>
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
      {/* Animation section is always available for every block type */}
      {block.type !== 'divider' && block.type !== 'banner' && (
        <div style={{ padding: '0 16px' }}>
          <AnimationSection />
          <TextAnimationSection />
        </div>
      )}
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
  const canvasContentRef = useRef(null);

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
      const migrated = migrateFloatingBlocks(data.page.blocks || []);
      setBlocks(migrated);
      setHistory([JSON.stringify(migrated)]);
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
    if (type === 'floating_text') {
      const anchorId = resolveAnchorBlockId(blocks, newBlock.id) || (afterIdx >= 0 && blocks[afterIdx]?.type !== 'floating_text' ? blocks[afterIdx].id : null);
      newBlock.props = { ...newBlock.props, anchorBlockId: anchorId, positionMode: 'anchor' };
    }
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
      
      // Clear homepage session storage cache so fresh contents load on live website
      if (pageSlug === '/' || pageSlug === '' || pageSlug === 'home') {
        sessionStorage.removeItem('homepage_site_page');
      }
      
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
        // Clear homepage session storage cache so fresh contents load on live website
        if (pageSlug === '/' || pageSlug === '' || pageSlug === 'home') {
          sessionStorage.removeItem('homepage_site_page');
        }
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
          <div ref={canvasContentRef} style={{ width: '100%', maxWidth: viewportWidth, transition: 'max-width 0.3s ease', position: 'relative' }}>
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
                <div
                  key={`${block.id}-${block.props?.animation || 'none'}-${block.props?.animationDuration ?? 0.8}-${block.props?.animationDelay ?? 0}-${block.props?.animationEasing ?? 'ease-out'}-${block.props?.animationStagger ? 'stagger' : 'no-stagger'}-${block.props?.textAnimation || 'none'}-${block.props?._previewTrigger || 0}`}
                  className="canvas-block sa-visible"
                  data-sa-animation={block.props?.animation || 'none'}
                  data-sa-stagger={block.props?.animationStagger ? 'true' : undefined}
                  style={{
                    width: '100%',
                    '--sa-dur': `${block.props?.animationDuration ?? 0.8}s`,
                    '--sa-delay': '0s',
                    '--sa-ease': block.props?.animationEasing ?? 'ease-out',
                  }}
                >
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
                            <div
                              key={`${col.block.id}-${col.block.props?.animation || 'none'}-${col.block.props?.animationDuration ?? 0.8}-${col.block.props?.animationDelay ?? 0}-${col.block.props?.animationEasing ?? 'ease-out'}-${col.block.props?.animationStagger ? 'stagger' : 'no-stagger'}-${col.block.props?.textAnimation || 'none'}-${col.block.props?._previewTrigger || 0}`}
                              data-sa-animation={col.block.props?.animation || 'none'}
                              data-sa-stagger={col.block.props?.animationStagger ? 'true' : undefined}
                              className="sa-visible"
                              style={{
                                display: 'flex',
                                flex: 'none',
                                width: `${col.width}%`,
                                position: 'relative',
                                minWidth: 0,
                                '--sa-dur': `${col.block.props?.animationDuration ?? 0.8}s`,
                                '--sa-delay': '0s',
                                '--sa-ease': col.block.props?.animationEasing ?? 'ease-out',
                              }}
                            >
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
                                <BlockPreview block={col.block} onChange={updateBlock} />
                                
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
                      draggable={block.type !== 'floating_text'} // Disable standard dragging when dragging text or when block is floating text
                      onDragStart={e => handleDragStart(e, idx)}
                      onDragOver={e => handleDragOver(e, idx + 1)}
                      onDrop={e => handleDrop(e, idx + 1)}
                      onDragLeave={() => setDragOverIdx(null)}
                      onClick={() => { setSelectedId(block.id); setSelectedRowId(null); }}
                      className="block-hover"
                      style={{
                        position: 'relative',
                        background: block.type === 'floating_text' ? 'transparent' : '#fff',
                        borderRadius: '12px',
                        border: block.type === 'floating_text' ? `2px dashed ${isSelected ? '#EC4899' : 'transparent'}` : `2px solid ${isSelected ? '#FF9F1C' : 'transparent'}`,
                        marginBottom: block.type === 'floating_text' ? '0' : '4px',
                        height: block.type === 'floating_text' ? '0' : 'auto',
                        cursor: 'pointer',
                        overflow: 'visible',
                        boxShadow: block.type === 'floating_text' ? 'none' : (isSelected ? '0 0 0 3px rgba(255,159,28,0.2)' : '0 2px 8px rgba(0,0,0,0.06)'),
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}>
                      {/* Block label bar */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: isSelected ? '#FFF8EE' : '#F9FAFB',
                        borderBottom: '1px solid #F3F4F6',
                        position: block.type === 'floating_text' ? 'absolute' : 'static',
                        top: block.type === 'floating_text' ? '-36px' : 'auto',
                        left: block.type === 'floating_text' ? '0' : 'auto',
                        width: block.type === 'floating_text' ? '280px' : 'auto',
                        zIndex: block.type === 'floating_text' ? 100 : 'auto',
                        borderRadius: block.type === 'floating_text' ? '8px' : '0',
                        boxShadow: block.type === 'floating_text' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                        border: block.type === 'floating_text' ? '1px solid #E5E7EB' : 'none',
                      }}>
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

                      {/* Block preview — content area is the anchor target (matches live site) */}
                      <div data-block-id={block.type !== 'floating_text' ? block.id : undefined} style={{ position: 'relative' }}>
                      {block.type === 'floating_text' ? (
                        <div style={{ padding: '10px 14px', fontSize: '11px', color: '#9CA3AF', fontStyle: 'italic' }}>
                          Pinned to section — Top: {block.props?.topPercent ?? 55}%, Left: {block.props?.leftPercent ?? 58}% (drag box on canvas)
                        </div>
                      ) : (
                        <BlockPreview block={block} onChange={updateBlock} />
                      )}

                      {blocks.filter(f => f.type === 'floating_text' && f.props?.anchorBlockId === block.id).map(f => (
                        <BlockPreview
                          key={f.id}
                          block={f}
                          onChange={updateBlock}
                          canvasRef={canvasContentRef}
                          anchorOverlay
                          isSelected={selectedId === f.id}
                          onSelect={() => { setSelectedId(f.id); setSelectedRowId(null); }}
                        />
                      ))}
                      </div>

                      {/* Vertical padding resize handle */}
                      {block.type !== 'floating_text' && (
                        <div
                          className="resize-handle-paddingY"
                          onMouseDown={e => startPaddingYResize(e, block.id, block.props?.paddingY || 40)}
                          title="Drag vertical size (paddingY)"
                        >
                          ↕ Padding: {block.props?.paddingY || 40}px
                        </div>
                      )}
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
              ? <PropsPanel block={selectedBlock} onChange={updateBlock} onTypeChange={changeBlockType} allBlocks={blocks} />
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

// Premium Animated Text Component for Live Preview
// Premium Animated Text Component for Live Preview
const AnimatedText = ({ text, animation = 'none', trigger }) => {
  const [displayed, setDisplayed] = useState('');
  const [start, setStart] = useState(false);

  useEffect(() => {
    setStart(false);
    const id = requestAnimationFrame(() => setStart(true));
    return () => cancelAnimationFrame(id);
  }, [trigger, text]);

  const hasHtml = /<[a-z/]/i.test(text);

  useEffect(() => {
    if (!start || !text) return;
    if (!hasHtml && (animation === 'typewriter' || animation === 'pencil' || animation === 'quill')) {
      let i = 0;
      setDisplayed('');
      const interval = setInterval(() => {
        setDisplayed(text.substring(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
        }
      }, animation === 'typewriter' ? 35 : 45);
      return () => clearInterval(interval);
    } else {
      setDisplayed(text);
    }
  }, [text, start, animation, trigger, hasHtml]);

  if (!text) return null;

  if (animation === 'none') {
    return hasHtml ? <span dangerouslySetInnerHTML={{ __html: text }} /> : <span>{text}</span>;
  }

  if (hasHtml) {
    if (animation === 'typewriter' || animation === 'pencil' || animation === 'quill') {
      const isHandwritten = animation === 'pencil' || animation === 'quill';
      return (
        <>
          <style>{`
            @keyframes sa-typing-sweep-anim {
              from { clip-path: inset(0 100% 0 0); }
              to { clip-path: inset(0 0 0 0); }
            }
          `}</style>
          <span 
            className={`sa-typing-sweep ${isHandwritten ? 'sa-handwritten-text' : ''}`}
            style={{ 
              display: 'inline-block', 
              animation: start ? 'sa-typing-sweep-anim 1.5s ease-out forwards' : 'none',
              overflow: 'hidden',
              verticalAlign: 'bottom',
              fontStyle: animation === 'quill' ? 'italic' : 'normal'
            }}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </>
      );
    }
    
    let className = "";
    let style = { display: 'inline-block' };
    
    if (animation === 'word-fade' || animation === 'slide-up' || animation === 'clip-slide' || animation === 'fade-up') {
      className = "sa-formatted-slide-up";
      style.animation = start ? "sa-slide-up-anim 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards" : "none";
      style.opacity = start ? 1 : 0;
    } else if (animation === 'focus-blur' || animation === 'blur-in') {
      className = "sa-formatted-blur-in";
      style.animation = start ? "sa-blur-in-anim 0.7s ease-out forwards" : "none";
      style.opacity = start ? 1 : 0;
    } else if (animation === 'scale-pop' || animation === 'bounce-in') {
      className = "sa-formatted-scale-pop";
      style.animation = start ? "sa-scale-pop-anim 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none";
      style.opacity = start ? 1 : 0;
    } else if (animation === 'sparkle') {
      className = "sa-sparkle-text";
    } else if (animation === 'rainbow') {
      className = "sa-rainbow-text";
    } else if (animation === 'neon-flicker') {
      className = "sa-neon-flicker-text";
    } else {
      className = "sa-formatted-fade-in";
      style.animation = start ? "sa-fade-in-anim 0.5s ease-out forwards" : "none";
      style.opacity = start ? 1 : 0;
    }

    return (
      <>
        <style>{`
          @keyframes sa-slide-up-anim {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes sa-blur-in-anim {
            from { opacity: 0; filter: blur(6px); transform: scale(0.96); }
            to { opacity: 1; filter: blur(0); transform: scale(1); }
          }
          @keyframes sa-scale-pop-anim {
            from { opacity: 0; transform: scale(0.3); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes sa-fade-in-anim {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
        <span className={className} style={style} dangerouslySetInnerHTML={{ __html: text }} />
      </>
    );
  }

  if (animation === 'typewriter') {
    return (
      <span>
        {displayed}
        {displayed.length < text.length && <span className="sa-typing-cursor" />}
      </span>
    );
  }

  if (animation === 'pencil') {
    return (
      <span className="sa-handwritten-text">
        {displayed}
        {displayed.length < text.length && (
          <span style={{ display: 'inline-block', animation: 'sa-pencil-write 0.4s infinite alternate', fontSize: '1.2em', verticalAlign: 'middle', marginLeft: '3px' }}>✏️</span>
        )}
      </span>
    );
  }

  if (animation === 'quill') {
    return (
      <span className="sa-handwritten-text" style={{ fontStyle: 'italic' }}>
        {displayed}
        {displayed.length < text.length && (
          <span style={{ display: 'inline-block', animation: 'sa-pencil-write 0.5s infinite alternate-reverse', fontSize: '1.2em', verticalAlign: 'middle', marginLeft: '3px' }}>✒️</span>
        )}
      </span>
    );
  }

  const words = text.split(' ');

  if (animation === 'word-fade') {
    return (
      <span style={{ display: 'inline', flexWrap: 'wrap' }}>
        {words.map((w, idx) => (
          <span
            key={idx}
            style={{
              display: 'inline-block',
              opacity: start ? 1 : 0,
              transform: start ? 'translateY(0)' : 'translateY(8px)',
              transition: `opacity 0.4s ease ${idx * 0.08}s, transform 0.4s ease ${idx * 0.08}s`,
              marginRight: '0.22em'
            }}
          >
            {w}
          </span>
        ))}
      </span>
    );
  }

  if (animation === 'focus-blur') {
    return (
      <span style={{ display: 'inline', flexWrap: 'wrap' }}>
        {words.map((w, idx) => (
          <span
            key={idx}
            style={{
              display: 'inline-block',
              opacity: start ? 1 : 0,
              filter: start ? 'blur(0px)' : 'blur(6px)',
              transform: start ? 'scale(1)' : 'scale(0.96)',
              transition: `opacity 0.5s ease ${idx * 0.08}s, filter 0.5s ease ${idx * 0.08}s, transform 0.5s ease ${idx * 0.08}s`,
              marginRight: '0.22em'
            }}
          >
            {w}
          </span>
        ))}
      </span>
    );
  }

  if (animation === 'sparkle') {
    return (
      <span style={{ display: 'inline', flexWrap: 'wrap' }}>
        {words.map((w, idx) => (
          <span
            key={idx}
            className="sa-sparkle-text"
            style={{
              display: 'inline-block',
              opacity: start ? 1 : 0,
              transition: `opacity 0.4s ease ${idx * 0.08}s`,
              marginRight: '0.22em'
            }}
          >
            {w}
          </span>
        ))}
      </span>
    );
  }

  if (animation === 'rainbow') {
    return (
      <span className="sa-rainbow-text" style={{ display: 'inline', flexWrap: 'wrap' }}>
        {words.map((w, idx) => (
          <span
            key={idx}
            style={{
              display: 'inline-block',
              opacity: start ? 1 : 0,
              transition: `opacity 0.4s ease ${idx * 0.08}s`,
              marginRight: '0.22em'
            }}
          >
            {w}
          </span>
        ))}
      </span>
    );
  }

  if (animation === 'neon-flicker') {
    return (
      <span className={start ? "sa-neon-flicker-text" : ""} style={{ display: 'inline' }}>
        {text}
      </span>
    );
  }

  if (animation === 'clip-slide') {
    return (
      <span style={{ display: 'inline', flexWrap: 'wrap' }}>
        {words.map((w, idx) => (
          <span
            key={idx}
            style={{
              display: 'inline-block',
              overflow: 'hidden',
              verticalAlign: 'bottom',
              marginRight: '0.22em',
              paddingBottom: '2px'
            }}
          >
            <span
              style={{
                display: 'inline-block',
                transform: start ? 'translateY(0)' : 'translateY(105%)',
                transition: `transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${idx * 0.08}s`
              }}
            >
              {w}
            </span>
          </span>
        ))}
      </span>
    );
  }

  if (animation === 'fly-in') {
    return (
      <span style={{ display: 'inline', flexWrap: 'wrap', overflow: 'hidden' }}>
        {words.map((w, idx) => {
          const fromLeft = idx % 2 === 0;
          return (
            <span
              key={idx}
              style={{
                display: 'inline-block',
                opacity: start ? 1 : 0,
                transform: start ? 'translateX(0)' : `translateX(${fromLeft ? '-30px' : '30px'})`,
                transition: `opacity 0.45s ease ${idx * 0.08}s, transform 0.45s ease ${idx * 0.08}s`,
                marginRight: '0.22em'
              }}
            >
              {w}
            </span>
          );
        })}
      </span>
    );
  }

  if (animation === 'scale-pop') {
    return (
      <span style={{ display: 'inline', flexWrap: 'wrap' }}>
        {words.map((w, idx) => (
          <span
            key={idx}
            style={{
              display: 'inline-block',
              opacity: start ? 1 : 0,
              transform: start ? 'scale(1)' : 'scale(0)',
              transition: `opacity 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.08}s, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.08}s`,
              marginRight: '0.22em'
            }}
          >
            {w}
          </span>
        ))}
      </span>
    );
  }

  if (animation === 'letter-merge') {
    return (
      <span style={{ display: 'inline', flexWrap: 'wrap' }}>
        {words.map((w, idx) => (
          <span
            key={idx}
            style={{
              display: 'inline-block',
              opacity: start ? 1 : 0,
              letterSpacing: start ? 'normal' : '6px',
              transition: `opacity 0.45s ease ${idx * 0.08}s, letter-spacing 0.45s ease ${idx * 0.08}s`,
              marginRight: '0.22em'
            }}
          >
            {w}
          </span>
        ))}
      </span>
    );
  }

  const chars = Array.from(text);

  if (animation === 'bounce') {
    return (
      <span style={{ display: 'inline' }}>
        {chars.map((c, idx) => (
          <span
            key={idx}
            style={{
              display: 'inline-block',
              opacity: start ? 1 : 0,
              transform: start ? 'translateY(0)' : 'translateY(12px)',
              transition: `opacity 0.25s ease ${idx * 0.03}s, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.03}s`,
              whiteSpace: c === ' ' ? 'pre' : 'normal'
            }}
          >
            {c}
          </span>
        ))}
      </span>
    );
  }

  if (animation === 'wave-sine') {
    return (
      <span style={{ display: 'inline' }}>
        {chars.map((c, idx) => (
          <span
            key={idx}
            style={{
              display: 'inline-block',
              opacity: start ? 1 : 0,
              animation: start ? `sa-wave-sine-anim 2.5s infinite ease-in-out` : 'none',
              animationDelay: `${idx * 0.05}s`,
              whiteSpace: c === ' ' ? 'pre' : 'normal'
            }}
          >
            {c}
          </span>
        ))}
      </span>
    );
  }

  if (animation === 'flip') {
    return (
      <span style={{ display: 'inline', perspective: '300px' }}>
        {words.map((w, idx) => (
          <span
            key={idx}
            style={{
              display: 'inline-block',
              opacity: start ? 1 : 0,
              transform: start ? 'rotateX(0deg)' : 'rotateX(-90deg)',
              transformOrigin: 'top center',
              transition: `opacity 0.45s ease ${idx * 0.08}s, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.08}s`,
              marginRight: '0.22em'
            }}
          >
            {w}
          </span>
        ))}
      </span>
    );
  }

  return <span>{text}</span>;
};


// ─── Block Preview (simplified canvas render) ────────────────────────
function BlockPreview({ block, onChange, canvasRef, anchorOverlay = false, isSelected = false, onSelect }) {
  const [isFocused, setIsFocused] = useState(false);
  const floatingContentRef = useRef(null);
  const floatingBoxRef = useRef(null);
  const p = block.props || {};

  useEffect(() => {
    const el = floatingContentRef.current;
    if (!el || isFocused || block.type !== 'floating_text') return;
    const html = p.content || '<p>Click to edit text</p>';
    if (el.innerHTML !== html) el.innerHTML = html;
  }, [block.type, p.content, isFocused]);

  const animText = (text) => {
    if (!text) return '';
    const anim = block.props?.textAnimation;
    const trigger = block.props?._previewTrigger;
    if (anim && anim !== 'none') {
      return <AnimatedText key={`${trigger}-${text}`} text={text} animation={anim} trigger={trigger} />;
    }
    const hasHtml = /<[a-z/]/i.test(text);
    if (hasHtml) {
      return <span dangerouslySetInnerHTML={{ __html: text }} />;
    }
    return text;
  };

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
                {block.props?.textAnimation && block.props.textAnimation !== 'none' ? <AnimatedText text={p.title || 'Wisdom Title'} animation={block.props.textAnimation} trigger={block.props?._previewTrigger} /> : (p.title || 'Wisdom Title')}
              </h1>
              {p.subtitle && (
                <p style={{ fontSize: '11px', color: p.subtitleColor || 'rgba(255,255,255,0.8)', marginBottom: '14px', lineHeight: 1.4 }}>
                  {block.props?.textAnimation && block.props.textAnimation !== 'none' ? <AnimatedText text={p.subtitle || ''} animation={block.props.textAnimation} trigger={block.props?._previewTrigger} /> : p.subtitle}
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
        <div style={{ ...previewStyle, background: p.background || '#fff', padding: `${Math.round((p.paddingY || 56) / 2.5)}px 20px` }}>
          <div style={{ textAlign: p.align || 'left' }}>
            {p.eyebrow && <p style={{ fontSize: '9px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{animText(p.eyebrow)}</p>}
            {p.heading && <h2 style={{ fontSize: `${Math.round((p.headingSize || 32) * 0.5)}px`, fontWeight: '800', color: p.headingColor || '#1A1B4B', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>{animText(p.heading)}</h2>}
            {p.content && <div style={{ fontSize: `${Math.round((p.fontSize || 16) * 0.7)}px`, color: p.textColor || '#4B5563', lineHeight: p.lineHeight || 1.6, whiteSpace: 'pre-wrap' }}>{animText(p.content)}</div>}
          </div>
        </div>
      );

    case 'rich_text':
      return (
        <div style={{ ...previewStyle, background: p.background || '#fff', padding: `${(p.paddingY || 48) / 2.5}px 20px` }}>
          <div style={{ textAlign: p.align || 'left', color: p.textColor || '#1f2937', fontSize: `${Math.round((p.fontSize || 16) * 0.7)}px`, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: p.content || '' }} />
        </div>
      );

    case 'floating_text': {
      const handleMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const boxEl = floatingBoxRef.current;
        if (!boxEl) return;

        const boxRect = boxEl.getBoundingClientRect();
        const offsetX = e.clientX - boxRect.left;
        const offsetY = e.clientY - boxRect.top;
        const anchorEl = getAnchorElement(p.anchorBlockId, canvasRef?.current);

        const onMouseMove = (ev) => {
          const boxWidth = p.width !== undefined ? p.width : 280;
          const boxHeight = boxEl.offsetHeight || 120;
          const position = buildAnchorPosition(ev.clientX, ev.clientY, offsetX, offsetY, anchorEl, boxWidth, boxHeight);

          onChange?.({
            ...block,
            props: { ...p, ...position, anchorBlockId: p.anchorBlockId },
          });
        };

        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      };

      const boxWidth = p.width !== undefined ? p.width : 280;
      const pos = resolveAnchorPosition(p);

      const boxStyle = {
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        width: `${boxWidth}px`,
        maxWidth: 'min(90%, calc(100% - 16px))',
        background: p.background || '#ffffff',
        color: p.textColor || '#1f2937',
        padding: `${p.padding !== undefined ? p.padding : 16}px`,
        borderRadius: `${p.borderRadius !== undefined ? p.borderRadius : 12}px`,
        border: p.borderWidth ? `${p.borderWidth}px solid ${p.borderColor || '#e5e7eb'}` : `1.5px solid ${isSelected ? '#EC4899' : '#e5e7eb'}`,
        boxShadow: p.shadow ? '0 10px 30px rgba(0,0,0,0.12)' : 'none',
        fontSize: '13px',
        zIndex: (p.zIndex || 50) + (isSelected ? 10 : 0),
        boxSizing: 'border-box',
        pointerEvents: 'auto',
        cursor: 'default',
      };

      const boxInner = (
        <div ref={floatingBoxRef} style={boxStyle} onClick={e => { e.stopPropagation(); onSelect?.(); }}>
          <div
            onMouseDown={handleMouseDown}
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'move',
              background: '#F3F4F6',
              border: '1.5px solid #EC4899',
              borderRadius: '4px',
              fontSize: '10px',
              userSelect: 'none',
              color: '#EC4899',
              fontWeight: 'bold',
              zIndex: 20,
            }}
            title="Drag to position on page"
          >
            ✥
          </div>
          <div
            ref={floatingContentRef}
            contentEditable
            suppressContentEditableWarning
            onFocus={() => setIsFocused(true)}
            onInput={e => {
              onChange?.({
                ...block,
                props: { ...p, content: e.currentTarget.innerHTML, positionMode: 'anchor' },
              });
            }}
            onBlur={e => {
              setIsFocused(false);
              onChange?.({
                ...block,
                props: { ...p, content: e.currentTarget.innerHTML, positionMode: 'anchor' },
              });
            }}
            style={{ outline: 'none', minHeight: '24px', paddingTop: '4px' }}
          />
        </div>
      );

      if (anchorOverlay) return boxInner;

      return (
        <div style={{ ...previewStyle, position: 'relative', minHeight: '120px', padding: '12px', background: 'transparent', overflow: 'visible' }}>
          {boxInner}
        </div>
      );
    }

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
        <div style={{ ...previewStyle, background: p.background || '#fff', padding: '16px 20px', textAlign: 'center' }}>
          {p.src ? (
            <img src={p.src} alt="" style={{ maxWidth: '100%', maxHeight: '120px', objectFit: p.fit || 'contain', borderRadius: `${p.borderRadius || 12}px` }} />
          ) : (
            <div style={{ width: '100%', height: '80px', background: '#F3F4F6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', border: '1px dashed #D1D5DB' }}>🖼️ Paste Image URL in properties</div>
          )}
          {p.caption && <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '6px', fontStyle: 'italic' }}>{animText(p.caption)}</p>}
        </div>
      );

    case 'features': {
      const cols = p.columns || 3;
      return (
        <div style={{ ...previewStyle, background: p.background || '#F8F9FE', padding: `${(p.paddingY || 60) / 2.5}px 20px` }}>
          {p.heading && (
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              {p.eyebrow && <span style={{ fontSize: '8px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase' }}>{animText(p.eyebrow)}</span>}
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: p.headingColor || '#1A1B4B', margin: '2px 0' }}>{animText(p.heading)}</h3>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '10px' }}>
            {(p.items || []).slice(0, 6).map((item, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '8px', padding: '10px', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: p.iconPosition === 'top' ? 'column' : 'row', gap: '8px' }}>
                {item.icon && <span style={{ fontSize: '16px' }}>{item.icon}</span>}
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: '700', color: '#1A1B4B', margin: '0 0 2px' }}>{animText(item.title)}</h4>
                  <p style={{ fontSize: '9px', color: '#6B7280', margin: 0, lineHeight: 1.3 }}>{animText(item.text)}</p>
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
                <div style={{ fontSize: '20px', fontWeight: '950', color: p.accentColor || '#FF9F1C', fontFamily: 'Outfit, sans-serif' }}>{animText(item.value)}</div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>{animText(item.label)}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'testimonials':
      return (
        <div style={{ ...previewStyle, background: p.background || '#F0F2F5', padding: `${(p.paddingY || 64) / 2.5}px 20px`, textAlign: 'center' }}>
          {p.heading && <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1A1B4B', marginBottom: '12px' }}>{animText(p.heading)}</h3>}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', maxWidth: '480px', margin: '0 auto' }}>
            <p style={{ fontSize: '11px', color: '#374151', fontStyle: 'italic', margin: '0 0 8px' }}>
              "{animText((p.items || [])[0]?.text || 'Feedback goes here.')}"
            </p>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#1A1B4B' }}>- {animText((p.items || [])[0]?.name || 'Student Name')}</div>
          </div>
        </div>
      );

    case 'team_cards':
      return (
        <div style={{ ...previewStyle, background: p.background || '#fff', padding: `${(p.paddingY || 60) / 2.5}px 20px` }}>
          {p.heading && <h3 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '12px', textAlign: 'center' }}>{animText(p.heading)}</h3>}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {(p.items || []).map((item, i) => (
              <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px', width: '120px', textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ccc', margin: '0 auto 6px' }}></div>
                <div style={{ fontSize: '10px', fontWeight: '700' }}>{animText(item.name)}</div>
                <div style={{ fontSize: '8px', color: '#6b7280' }}>{animText(item.title)}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'timeline':
      return (
        <div style={{ ...previewStyle, background: p.background || '#fafafa', padding: `${(p.paddingY || 60) / 2.5}px 20px` }}>
          {p.heading && <h3 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '12px', textAlign: 'center' }}>{animText(p.heading)}</h3>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(p.items || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '10px' }}>
                <div style={{ fontWeight: '700', color: '#FF9F1C' }}>{animText(item.date)}</div>
                <div>
                  <div style={{ fontWeight: '700' }}>{animText(item.title)}</div>
                  <div style={{ fontSize: '9px', color: '#6b7280' }}>{animText(item.text)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'accordion':
      return (
        <div style={{ ...previewStyle, background: p.background || '#fff', padding: `${(p.paddingY || 60) / 2.5}px 20px` }}>
          {p.heading && <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1A1B4B', marginBottom: '12px', textAlign: 'center' }}>{animText(p.heading)}</h3>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '500px', margin: '0 auto' }}>
            {(p.items || []).slice(0, 3).map((item, i) => (
              <div key={i} style={{ border: '1px solid #E5E7EB', borderRadius: '6px', padding: '8px 12px', fontSize: '10px', color: '#374151', display: 'flex', justifyContent: 'space-between' }}>
                <span>❓ {animText(item.q)}</span>
                <span>▼</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'countdown':
      return (
        <div style={{ ...previewStyle, background: p.background || '#1A1B4B', padding: `${(p.paddingY || 48) / 2.5}px 20px`, textAlign: 'center', color: '#fff' }}>
          {p.heading && <h3 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '4px' }}>{animText(p.heading)}</h3>}
          {p.subheading && <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>{animText(p.subheading)}</p>}
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
          {p.heading && <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#fff', marginBottom: '6px', fontFamily: 'Outfit, sans-serif' }}>{animText(p.heading)}</h2>}
          {p.subheading && <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', marginBottom: '14px', maxWidth: '420px', margin: '0 auto 14px' }}>{animText(p.subheading)}</p>}
          <button style={{ background: p.btnColor || '#FF9F1C', color: p.btnTextColor || '#1A1B4B', border: 'none', borderRadius: '8px', padding: '8px 24px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
            {animText(p.btnText || 'Explore Programs')}
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
            {heading && <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#1A1B4B', marginBottom: '4px' }}>{animText(heading)}</h4>}
            {content && <p style={{ fontSize: '9px', color: '#4B5563', lineHeight: 1.4, margin: 0 }}>{animText(content)}</p>}
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
        <div style={{ ...previewStyle, background: p.background || '#fff', padding: '24px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: `${p.gap || 20}px` }}>
            {[1, 2, 3].map(num => {
              const heading = p[`col${num}Heading`] || `Column ${num}`;
              const content = p[`col${num}Content`];
              const img = p[`col${num}Image`];
              return (
                <div key={num} style={{ textAlign: 'left' }}>
                  {img && <img src={img} alt="" style={{ width: '100%', height: '50px', objectFit: 'cover', borderRadius: '4px', marginBottom: '6px' }} />}
                  <h4 style={{ fontSize: '11px', fontWeight: '800', color: p.headingColor || '#1A1B4B', margin: '0 0 4px 0' }}>{animText(heading)}</h4>
                  {content && <p style={{ fontSize: '9px', color: p.textColor || '#4B5563', margin: 0, lineHeight: 1.3 }}>{animText(content)}</p>}
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'four_column':
      return (
        <div style={{ ...previewStyle, background: p.background || '#fafafa', padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: `${p.gap || 16}px` }}>
            {[1, 2, 3, 4].map(num => {
              const title = p[`col${num}Title`] || `Col ${num}`;
              const text = p[`col${num}Text`];
              return (
                <div key={num} style={{ background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.03)', textAlign: 'center' }}>
                  <h5 style={{ fontSize: '10px', fontWeight: '800', color: '#1A1B4B', margin: '0 0 3px 0' }}>{animText(title)}</h5>
                  {text && <p style={{ fontSize: '8px', color: '#6B7280', margin: 0, lineHeight: 1.25 }}>{animText(text)}</p>}
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'gallery':
      return (
        <div style={{ ...previewStyle, background: p.background || '#ffffff', padding: '20px' }}>
          {p.title && <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#1A1B4B', marginBottom: '10px', textAlign: 'center' }}>{animText(p.title)}</h3>}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${p.columns || 3}, 1fr)`, gap: '8px' }}>
            {(p.images && p.images.length > 0 ? p.images : ['', '', '']).slice(0, p.columns || 3).map((img, i) => (
              <div key={i} style={{ height: '70px', background: '#F3F4F6', borderRadius: '6px', overflow: 'hidden', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '14px' }}>📸</span>}
              </div>
            ))}
          </div>
        </div>
      );

    case 'team_cards':
      return (
        <div style={{ ...previewStyle, background: p.background || '#ffffff', padding: '24px 20px' }}>
          {p.heading && <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#1A1B4B', marginBottom: '12px', textAlign: 'center' }}>{animText(p.heading)}</h3>}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {(p.items || []).map((item, i) => (
              <div key={i} style={{ background: '#F9FAFB', borderRadius: '8px', padding: '10px', border: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '120px', maxWidth: '160px', textAlign: 'center' }}>
                {item.avatar ? (
                  <img src={item.avatar} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', marginBottom: '6px' }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: '700', marginBottom: '6px' }}>{item.name ? item.name[0] : '👤'}</div>
                )}
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#1A1B4B' }}>{animText(item.name)}</div>
                <div style={{ fontSize: '8px', color: '#6B7280', marginTop: '2px' }}>{animText(item.title)}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'timeline':
      return (
        <div style={{ ...previewStyle, background: p.background || '#fafafa', padding: '24px 20px' }}>
          {p.heading && <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#1A1B4B', marginBottom: '16px', textAlign: 'center' }}>{animText(p.heading)}</h3>}
          <div style={{ borderLeft: '2px solid #7C3AED', paddingLeft: '14px', marginLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
            {(p.items || []).map((item, i) => (
              <div key={i} style={{ position: 'relative', textAlign: 'left' }}>
                <div style={{ position: 'absolute', left: '-20px', top: '2px', width: '10px', height: '10px', borderRadius: '50%', background: '#7C3AED', border: '2px solid #fff' }} />
                <div style={{ fontSize: '9px', fontWeight: '800', color: '#7C3AED' }}>{animText(item.date)}</div>
                <h5 style={{ fontSize: '11px', fontWeight: '700', color: '#1A1B4B', margin: '2px 0 1px 0' }}>{animText(item.title)}</h5>
                <p style={{ fontSize: '9px', color: '#6B7280', margin: 0, lineHeight: 1.3 }}>{animText(item.text)}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'accordion':
      return (
        <div style={{ ...previewStyle, background: p.background || '#fff', padding: '20px' }}>
          {p.heading && <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#1A1B4B', marginBottom: '10px', textAlign: 'center' }}>{animText(p.heading)}</h3>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(p.items || []).map((item, i) => (
              <div key={i} style={{ border: '1px solid #E5E7EB', borderRadius: '6px', padding: '8px 10px', fontSize: '9.5px', color: '#374151', display: 'flex', justifyContent: 'space-between', background: '#FAFAFA' }}>
                <span style={{ fontWeight: '600' }}>❓ {animText(item.q)}</span>
                <span>➕</span>
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
        <div style={{ ...previewStyle, background: p.background || '#FF9F1C', color: p.textColor || '#1A1B4B', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '10px', fontWeight: '700', textAlign: 'center' }}>
          <span>{animText(p.text)}</span>
          {p.linkText && <span style={{ textDecoration: 'underline', cursor: 'pointer', opacity: 0.8 }}>{animText(p.linkText)} →</span>}
        </div>
      );

    case 'html_embed':
      return (
        <div style={{ ...previewStyle, background: p.background || '#ffffff', padding: '24px 20px', textAlign: 'center' }}>
          <div style={{ border: '2px dashed #C7D2FE', background: '#EEF2FF', padding: '16px', borderRadius: '8px', color: '#4F46E5', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '20px' }}>💻</span>
            <div style={{ fontSize: '11px', fontWeight: '700' }}>Custom HTML/IFrame Embed Block</div>
            <div style={{ fontSize: '9px', color: '#6366F1', wordBreak: 'break-all' }}>{p.html ? (p.html.substring(0, 80) + '...') : 'No HTML content added yet'}</div>
          </div>
        </div>
      );

    case 'slider':
      return (
        <div style={{ ...previewStyle, background: p.background || '#ffffff', padding: '16px 20px', position: 'relative' }}>
          <div style={{ height: '140px', background: '#F3F4F6', borderRadius: '10px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E5E7EB' }}>
            {p.slides && p.slides[0] ? (
              <>
                {p.slides[0].image && <img src={p.slides[0].image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '16px', color: '#fff', textAlign: 'left' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '900', margin: '0 0 4px 0' }}>{animText(p.slides[0].title)}</h4>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>{animText(p.slides[0].subtitle)}</p>
                </div>
              </>
            ) : (
              <span style={{ fontSize: '24px' }}>🎠 Slider Preview</span>
            )}
            <div style={{ position: 'absolute', bottom: '6px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '4px' }}>
              {(p.slides || []).map((_, i) => (
                <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: i === 0 ? '#FF9F1C' : 'rgba(255,255,255,0.5)' }} />
              ))}
            </div>
            <div style={{ position: 'absolute', left: '8px', color: '#fff', fontSize: '14px', fontWeight: '900' }}>‹</div>
            <div style={{ position: 'absolute', right: '8px', color: '#fff', fontSize: '14px', fontWeight: '900' }}>›</div>
          </div>
        </div>
      );

    case 'system_hero_slides':
      return (
        <div style={{ ...previewStyle, background: '#1A1B4B', padding: '16px 20px', position: 'relative' }}>
          <div style={{ height: '140px', background: '#1F1F1F', borderRadius: '10px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
            {p.heroSlides && p.heroSlides[0] ? (
              <img src={p.heroSlides[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
            ) : (
              <span style={{ color: '#fff', fontSize: '12px' }}>System Hero Poster Slider</span>
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '12px', color: '#fff', textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: '900' }}>Radheshyam Das Courses & Books</div>
              <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)' }}>Monk, Author, IIT Alumni</div>
            </div>
            <div style={{ position: 'absolute', bottom: '6px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '4px' }}>
              {(p.heroSlides || []).slice(0, 5).map((_, i) => (
                <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', background: i === 0 ? '#FF9F1C' : 'rgba(255,255,255,0.4)' }} />
              ))}
            </div>
          </div>
        </div>
      );

    case 'system_credentials':
      return (
        <div style={{ ...previewStyle, background: '#fff', padding: '14px 20px', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            {(p.credentials || []).map((cred, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F3F4F6', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {cred.src ? <img src={cred.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '14px' }}>🎓</span>}
                </div>
                <div style={{ fontSize: '8px', color: '#6B7280', fontWeight: '700', textAlign: 'center', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cred.alt}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'system_logos':
      return (
        <div style={{ ...previewStyle, background: '#F9FAFB', padding: '16px 20px' }}>
          {p.title && <div style={{ fontSize: '9px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px', textAlign: 'center' }}>{animText(p.title)}</div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            {(p.logos || []).slice(0, 5).map((logo, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
                {logo.logo ? (
                  <img src={logo.logo} alt="" style={{ height: '16px', maxWidth: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '9px', fontWeight: '700' }}>{logo.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'system_featured':
      return (
        <div style={{ ...previewStyle, background: '#F8F9FE', padding: '24px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {(p.featuredCards || []).map((card, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '8px', padding: '10px', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <span style={{ fontSize: '7px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase' }}>{animText(card.badge)}</span>
                <h4 style={{ fontSize: '10px', fontWeight: '800', color: '#1A1B4B', margin: 0 }}>{animText(card.title)}</h4>
                <p style={{ fontSize: '8px', color: '#6B7280', margin: 0, lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{animText(card.desc)}</p>
                {card.image && <img src={card.image} alt="" style={{ width: '100%', height: '40px', objectFit: 'cover', borderRadius: '4px', marginTop: 'auto' }} />}
              </div>
            ))}
          </div>
        </div>
      );

    case 'system_about':
      return (
        <div style={{ ...previewStyle, background: p.background || '#FAF8F5', padding: '24px 20px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', maxWidth: '540px', margin: '0 auto', textAlign: 'left' }}>
            <img src={p.avatar || 'https://lh3.googleusercontent.com/d/1MN4z91XjyCUFfuOPKDCeBse8TwAfJRVg'} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #FF9F1C' }} />
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#1A1B4B', margin: '0 0 4px 0' }}>{animText(p.heading || 'Biography')}</h3>
              <p style={{ fontSize: '9px', color: '#4B5563', lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{animText(p.bio1)}</p>
            </div>
          </div>
        </div>
      );

    case 'system_books':
      return (
        <div style={{ ...previewStyle, background: '#ffffff', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              {p.subLabel && <span style={{ fontSize: '7.5px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase' }}>{animText(p.subLabel)}</span>}
              <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#1A1B4B', margin: 0 }}>{animText(p.heading || 'Shopify Books')}</h3>
            </div>
            <span style={{ fontSize: '8.5px', color: '#FF9F1C', fontWeight: '700' }}>View All →</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {(p.books || []).slice(0, 4).map((book, i) => (
              <div key={i} style={{ flexShrink: 0, width: '70px', textAlign: 'center' }}>
                <div style={{ height: '85px', background: '#F3F4F6', borderRadius: '6px', overflow: 'hidden', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {book.image ? <img src={book.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '14px' }}>📚</span>}
                </div>
                <div style={{ fontSize: '8px', fontWeight: '700', color: '#1A1B4B', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{animText(book.title)}</div>
                <div style={{ fontSize: '8px', color: '#FF9F1C', fontWeight: '800' }}>{book.price}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'system_youtube':
      return (
        <div style={{ ...previewStyle, background: '#ffffff', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              {p.subLabel && <span style={{ fontSize: '7.5px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase' }}>{animText(p.subLabel)}</span>}
              <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#1A1B4B', margin: 0 }}>{animText(p.heading || 'YouTube Playlist')}</h3>
            </div>
            <span style={{ fontSize: '8.5px', color: '#DC2626', fontWeight: '700' }}>Subscribe Channel</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {(p.customVideos || []).slice(0, 2).map((vid, i) => (
              <div key={i} style={{ background: '#F9FAFB', borderRadius: '6px', border: '1px solid #E5E7EB', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '55px', background: '#111', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {vid.thumbnail ? <img src={vid.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '12px', color: '#fff' }}>📺 Video</span>}
                  <div style={{ position: 'absolute', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(220,38,38,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '9px', fontWeight: '900' }}>▶</div>
                </div>
                <div style={{ fontSize: '8.5px', fontWeight: '700', padding: '4px', color: '#1A1B4B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{animText(vid.title || 'YouTube Lecture')}</div>
              </div>
            ))}
          </div>
        </div>
      );

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
