'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  Award, 
  Users, 
  BookCheck, 
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  Play,
  ExternalLink,
  BookOpenCheck,
  Building,
  CheckCircle,
  Briefcase,
  Loader2
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SpecialCourseLanding from '@/components/SpecialCourseLanding';
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
    price: 'â‚¹170.00',
    url: 'https://voicepublication.in/products/the-happiness-paradox',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/TheHappinessParadox-cover.jpg?v=1780304890'
  },
  {
    id: 3,
    title: 'Decoding the Self (CC Series - Book 1)',
    price: 'â‚¹200.00',
    url: 'https://voicepublication.in/products/decoding-the-self',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/TCCDecodingtheself-cover.jpg?v=1780305591'
  },
  {
    id: 5,
    title: 'Your Best Friend',
    price: 'â‚¹280.00',
    url: 'https://voicepublication.in/products/your-best-friend',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/YourBestFriend-front.jpg?v=1764746523'
  },
  {
    id: 6,
    title: 'Wisdom Eye (Course 1) - Laying the Foundation for Success',
    price: 'â‚¹150.00',
    originalPrice: 'â‚¹200.00',
    url: 'https://voicepublication.in/products/wisdom-eye',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/WisdomEye-cover.jpg?v=1780304483'
  },
  {
    id: 12,
    title: 'GAME Positive Thinker (Course 1, 2, 4 & 6)',
    price: 'â‚¹120.00 - â‚¹280.00',
    url: 'https://voicepublication.in/products/game-positive-thinker-course-1-2-6',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/GAME-PT-12.png?v=1764741397'
  },
  {
    id: 14,
    title: 'Discover Yourself',
    price: 'â‚¹160.00',
    url: 'https://voicepublication.in/products/discover-yourself',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/DYS-front.jpg?v=1764332893'
  },
  {
    id: 16,
    title: 'Art of Smart Work',
    price: 'â‚¹70.00',
    url: 'https://voicepublication.in/products/art-of-smart-work',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/ArtofSmartWork-Front.jpg?v=1756533599'
  },
  {
    id: 4,
    title: 'Your Secret Journey',
    price: 'â‚¹200.00',
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

export default function GeneralHomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [ytLoading, setYtLoading] = useState(true);
  const [homeConfig, setHomeConfig] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  
  // Custom visual page builder homepage support
  const [sitePage, setSitePage] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

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

  // Load home config or site builder homepage
  useEffect(() => {
    async function loadHomepage() {
      try {
        const pageRes = await fetch('/api/site-pages/%2F'); // slug: '/'
        if (pageRes.ok) {
          const pageData = await pageRes.json();
          if (pageData.page && pageData.page.is_published) {
            setSitePage(pageData.page);
            setPageLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error(err);
      }

      // Fallback to config-driven homepage
      fetch('/api/home-config').then(r => r.ok ? r.json() : null).then(data => {
        if (data) setHomeConfig(data);
      }).catch(() => {});
      setPageLoading(false);
    }
    loadHomepage();
  }, []);

  // Helper: get section config
  const getSection = (id) => homeConfig?.sections?.find(s => s.id === id);
  const isSectionVisible = (id) => {
    if (!homeConfig) return true; // fallback: show all while loading
    const sec = getSection(id);
    return sec ? sec.visible !== false : true;
  };
  const sortedSectionIds = homeConfig?.sections
    ? [...homeConfig.sections].sort((a, b) => a.order - b.order).map(s => s.id)
    : ['hero', 'credentials', 'logos', 'featured', 'about', 'books', 'youtube'];

  // Data driven from config or defaults
  const POSTER_IMAGES_LIVE = homeConfig?.heroSlides?.length > 0 ? homeConfig.heroSlides : POSTER_IMAGES;
  const FEATURED_BOOKS_LIVE = homeConfig?.featuredBooks?.length > 0 ? homeConfig.featuredBooks : FEATURED_BOOKS;
  const credentialsData = homeConfig?.credentials?.length > 0 ? homeConfig.credentials : [
    { src: "https://lh3.googleusercontent.com/d/19yYbEATwSgrOVfuKk339h6j6qVNY48Nw", alt: "IIT Mumbai Topper" },
    { src: "https://lh3.googleusercontent.com/d/1zHSviGsVWpcjqEEcDClEht0qNihIQ8qp", alt: "Temple President ISKCON Pune" },
    { src: "https://lh3.googleusercontent.com/d/1etXzaXu2p4rmW81PrMW6T-bHRfKIZzSQ", alt: "Temple Management Council Member ISKCON Abids" },
    { src: "https://lh3.googleusercontent.com/d/1vu3f15JL_oJ8LAiYq4WItoVSH4Of5uEz", alt: "Global Duty Officer Youth Training ISKCON" },
  ];

  // Fetch YouTube Videos and respect pinned videos order
  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch('/api/youtube');
        if (res.ok) {
          const data = await res.json();
          const pinned = homeConfig?.pinnedVideos || [];
          const pinnedList = pinned.map(id => data.find(v => v.id === id) || { id, title: id, thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg`, publishedAt: new Date().toISOString() });
          const rest = data.filter(v => !pinned.includes(v.id));
          const ordered = [...pinnedList, ...rest];
          setYoutubeVideos(ordered);
          if (ordered.length > 0) setActiveVideo(ordered[0]);
        }
      } catch (err) {
        console.error('Failed to load YouTube videos', err);
      } finally {
        setYtLoading(false);
      }
    }
    fetchVideos();
  }, [homeConfig]);

  // Auto-scroll Hero Poster Slider
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % POSTER_IMAGES_LIVE.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [POSTER_IMAGES_LIVE.length]);

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % POSTER_IMAGES_LIVE.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + POSTER_IMAGES_LIVE.length) % POSTER_IMAGES_LIVE.length);

  // Active announcements (not expired, visible)
  const activeAnnouncements = (homeConfig?.announcements || []).filter(a => {
    if (!a.visible) return false;
    if (a.expiresAt && new Date(a.expiresAt) < new Date()) return false;
    return true;
  });

  const banner = homeConfig?.notificationBanner;
  const showBanner = banner?.enabled && banner?.text && !bannerDismissed;

  const ANNOUNCE_COLORS = {
    info: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' },
    success: { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534' },
    warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
    promo: { bg: '#FDF2F8', border: '#F9A8D4', text: '#9D174D' },
  };

  // Render section by id
  const renderSection = (id) => {
    if (!isSectionVisible(id)) return null;

    switch (id) {
      case 'hero': return renderHeroSection();
      case 'credentials': return renderCredentialsSection();
      case 'logos': return renderLogosSection();
      case 'featured': return renderFeaturedSection();
      case 'about': return renderAboutSection();
      case 'books': return renderBooksSection();
      case 'youtube': return renderYoutubeSection();
      default: return null;
    }
  };

  function renderHeroSection() {
    return (
      <section key="hero" style={styles.heroSection}>
        <div style={styles.heroSliderContainer}>
          <button onClick={prevSlide} style={styles.sliderArrowLeft}>
            <ChevronLeft size={24} />
          </button>
          <div style={styles.slideImageWrapper}>
            <img src={formatImageUrl(POSTER_IMAGES_LIVE[activeSlide])} alt="" style={styles.heroPosterBlurredBg} />
            <img src={formatImageUrl(POSTER_IMAGES_LIVE[activeSlide])} alt={`Wisdom Poster ${activeSlide + 1}`} style={styles.heroPosterImage} />
          </div>
          <button onClick={nextSlide} style={styles.sliderArrowRight}>
            <ChevronRight size={24} />
          </button>
        </div>
        <div style={styles.dotsContainer}>
          {POSTER_IMAGES_LIVE.map((_, idx) => (
            <span key={idx} onClick={() => setActiveSlide(idx)}
              style={{ ...styles.dot, background: activeSlide === idx ? '#FF9F1C' : 'rgba(255,255,255,0.4)', width: activeSlide === idx ? '16px' : '8px' }}
            />
          ))}
        </div>
      </section>
    );
  }

  function renderCredentialsSection() {
    return (
      <section key="credentials" style={styles.credentialsSection}>
        <div style={styles.container}>
          <div ref={credsScrollRef} className="credentials-scroll-container" style={styles.credentialsGrid}>
            {credentialsData.concat(credentialsData).map((cred, idx) => (
              <div key={idx} className={`cred-slide-card ${idx >= credentialsData.length ? 'duplicate' : ''}`} style={styles.credCard}>
                <img src={formatImageUrl(cred.src)} alt={cred.alt} style={styles.credImage} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function renderLogosSection() {
    return (
      <section key="logos" style={styles.logoSliderSection}>
        <div style={styles.container}>
          <h4 style={styles.visitedTitle}>Corporate Trainer</h4>
          <div style={styles.sliderContainer}>
            <div style={styles.sliderTrack}>
              {COMPANIES.concat(COMPANIES).map((comp, idx) => (
                <div key={idx} style={styles.logoItem}>
                  <img src={comp.logo} alt={comp.name} style={styles.logoImage} onError={e => { e.target.style.display = 'none'; }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderFeaturedSection() {
    return (
      <section key="featured" style={styles.featuredSection}>
        <div style={styles.container}>
          <div style={styles.featuredGrid}>
            <div style={styles.featuredCard}>
              <span style={styles.featuredTag}>Featured Book</span>
              <img src="https://cdn.shopify.com/s/files/1/0614/8639/9543/files/WisdomEye-cover.jpg?v=1780304483" alt="Wisdom Eye" style={styles.featuredImage} />
              <h3 style={styles.featuredCardTitle}>Wisdom Eye</h3>
              <p style={styles.featuredCardDesc}>Laying the foundation for character and personal leadership success.</p>
              <Link href="/books" style={styles.featuredCta}>View All Books <ExternalLink size={14} /></Link>
            </div>
            <div style={styles.featuredCard}>
              <span style={styles.featuredTag}>Scripture Academy</span>
              <img src="https://gaurangadarshandas.com/images/courses/8aab8f0c77c546568fd0c9c430ef6547_dw6z4v.png" alt="Wisdom Eye Course" style={styles.featuredImage} />
              <h3 style={styles.featuredCardTitle}>Certified Courses</h3>
              <p style={styles.featuredCardDesc}>Auto-graded quizzes, certification, and discussions under the guidance of Radheshyam Das.</p>
              <Link href="/courses" style={styles.featuredCta}>Explore Academy <ChevronRight size={14} /></Link>
            </div>
            <div style={styles.featuredCard}>
              <span style={styles.featuredTag}>Daily Reading</span>
              <div style={{ ...styles.featuredImage, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eadecd', borderRadius: '8px' }}>
                <BookOpenCheck size={48} color="#1A1B4B" />
              </div>
              <h3 style={styles.featuredCardTitle}>Daily Reading Wisdom</h3>
              <p style={styles.featuredCardDesc}>Start your day with spiritual inspiration and logical insights from timeless scriptures.</p>
              <Link href="/daily-reading" style={styles.featuredCta}>Read Daily Verse <ChevronRight size={14} /></Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderAboutSection() {
    return (
      <section key="about" style={styles.aboutSection}>
        <div style={styles.container}>
          <div className="about-biography-grid" style={styles.aboutWrapper}>
            <div style={styles.aboutTextContent}>
              <span style={styles.sectionLabel}>Biography</span>
              <h2 style={styles.aboutHeader}>Radheshyam Das</h2>
              <div style={styles.divider} />
              <p style={styles.aboutText}><strong>Radheshyam Das</strong> is an IIT Mumbai Topper who dedicated his life as a full-time monk, youth educator, and author. Born in a devout family near Madurai, his childhood was fascinated by Vedic chants and philosophical classics.</p>
              <p style={styles.aboutText}>After top ranking at IIT Mumbai, working as a Senior Research Fellow and mechanical engineer at top companies, he took up the role of a celibate monk. He designed the DYS (Discover Your Self) and GAME (Gita for All Made Easy) course structures which are taught across leading universities.</p>
              <Link href="/about" style={styles.heroBtnPrimary}>Read Full Biography <ArrowRight size={16} /></Link>
            </div>
            <div style={styles.aboutVisualContent}>
              <div style={styles.imageCardDecoration} />
              <img src="https://gdo.radheshyamdas.com/favicon.png" alt="Radheshyam Das" style={styles.aboutPhoto} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderBooksSection() {
    return (
      <section key="books" style={styles.booksSection}>
        <div style={styles.container}>
          <div style={{ ...styles.sectionHeaderRow, flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={styles.sectionLabelLight}>Featured Literature</span>
              <h2 style={styles.sectionTitleLight}>Radheshyam Das Books</h2>
            </div>
            <Link href="/books" style={{ ...styles.viewAllBtn, whiteSpace: 'nowrap' }}>View All Books <ChevronRight size={16} /></Link>
          </div>
          <div ref={booksScrollRef} className="books-scroll-container" style={styles.booksGrid}>
            {FEATURED_BOOKS_LIVE.concat(FEATURED_BOOKS_LIVE).map((book, idx) => (
              <div key={idx} style={styles.bookCard}>
                <div style={styles.bookImgWrapper}>
                  <img src={book.image} alt={book.title} style={styles.bookImage} />
                </div>
                <div style={styles.bookDetails}>
                  <h3 style={styles.bookTitle}>{book.title}</h3>
                  <div style={styles.bookPriceBlock}><span style={styles.bookPrice}>{book.price}</span></div>
                  <a href={book.url} target="_blank" rel="noopener noreferrer" style={styles.buyBtn}>Buy on Store <ExternalLink size={12} /></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function renderYoutubeSection() {
    return (
      <section key="youtube" style={styles.youtubeSection}>
        <div style={styles.container}>
          <div style={styles.sectionHeaderRow}>
            <div>
              <span style={styles.sectionLabel}>Video Channel</span>
              <h2 style={styles.sectionTitle}>Radheshyam Das YouTube Lectures</h2>
            </div>
            <a href="https://www.youtube.com/channel/UC9Pap1xwEQAo7X1tKqpcpWg" target="_blank" rel="noopener noreferrer" style={styles.youtubeChannelBtn}>
              Subscribe on YouTube <Play size={14} fill="#FFF" style={{ marginLeft: '4px' }} />
            </a>
          </div>
          {ytLoading ? (
            <div style={styles.youtubeLoading}><div>Loading latest lectures...</div></div>
          ) : youtubeVideos.length > 0 ? (
            <div className="youtube-layout">
              <div style={styles.youtubePlayerContainer}>
                {activeVideo && (<>
                  <div style={styles.iframeWrapper}>
                    <iframe src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}`} title={activeVideo.title}
                      frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen style={styles.youtubeIframe} />
                  </div>
                  <h3 style={styles.activeVideoTitle}>{activeVideo.title}</h3>
                  <p style={styles.activeVideoMeta}>Published: {new Date(activeVideo.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </>)}
              </div>
              <div style={styles.youtubePlaylistContainer}>
                <h4 style={styles.playlistHeader}>Recent Lectures ({youtubeVideos.length})</h4>
                <div style={styles.playlistScroll}>
                  {youtubeVideos.map((video) => (
                    <div key={video.id} onClick={() => setActiveVideo(video)}
                      style={{ ...styles.playlistItem, background: activeVideo?.id === video.id ? 'rgba(255, 159, 28, 0.15)' : 'transparent', borderColor: activeVideo?.id === video.id ? '#FF9F1C' : 'rgba(26, 27, 75, 0.08)' }}
                      className="playlist-item-card">
                      <img src={video.thumbnail} alt={video.title} style={styles.playlistThumb} />
                      <div style={styles.playlistItemDetails}>
                        <h5 style={{ ...styles.playlistItemTitle, color: activeVideo?.id === video.id ? '#FF9F1C' : '#1A1B4B' }}>{video.title}</h5>
                        <p style={styles.playlistItemDate}>{new Date(video.publishedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.youtubeLoading}><p>No videos available. Visit the YouTube channel to watch more.</p></div>
          )}
        </div>
      </section>
    );
  }



  if (pageLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f3eb' }}>
        <Loader2 size={36} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (sitePage) {
    return (
      <div style={styles.page}>
        <Navbar />
        <SpecialCourseLanding
          course={sitePage}
          isEnrolled={false}
          onEnroll={() => {}}
          slug="/"
        />
        <Footer />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Navbar />

      {/* Notification Banner */}
      {showBanner && (
        <div style={{
          background: banner.bgColor || '#1A1B4B',
          color: banner.textColor || '#FF9F1C',
          padding: '10px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
          fontSize: '14px', fontWeight: '600', position: 'relative', zIndex: 50,
        }}>
          {banner.link ? (
            <a href={banner.link} style={{ color: 'inherit', textDecoration: 'underline' }}>{banner.text}</a>
          ) : (
            <span>{banner.text}</span>
          )}
          {banner.dismissable && (
            <button onClick={() => setBannerDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', marginLeft: '8px', opacity: 0.7, fontSize: '18px', lineHeight: 1 }}>×</button>
          )}
        </div>
      )}

      {/* Announcements */}
      {activeAnnouncements.length > 0 && (
        <div style={{ padding: '8px 24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {activeAnnouncements.map(a => {
            const colors = ANNOUNCE_COLORS[a.type] || ANNOUNCE_COLORS.info;
            return (
              <div key={a.id} style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text, padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                {a.text}
              </div>
            );
          })}
        </div>
      )}

      {/* Dynamic Sections */}
      {sortedSectionIds.map(id => renderSection(id))}

      <Footer />
    </div>
  );
}

const styles = {
  page: {
    background: '#f5f3eb',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Inter, sans-serif',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },

  // Hero Section with Image Slider
  heroSection: {
    position: 'relative',
    background: 'linear-gradient(135deg, #1A1B4B 0%, #0F1035 60%, #2D1B69 100%)',
    padding: '0 0 40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  heroSliderContainer: {
    width: '100%',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideImageWrapper: {
    width: '100%',
    height: '500px',
    overflow: 'hidden',
    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
    background: '#1A1B4B',
    position: 'relative',
  },
  heroPosterBlurredBg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'blur(15px) brightness(0.6)',
    transform: 'scale(1.1)', // Prevents blurred white edges
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  heroPosterImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    position: 'relative',
    zIndex: 2,
  },
  sliderArrowLeft: {
    position: 'absolute',
    left: '24px',
    background: 'rgba(26, 27, 75, 0.85)',
    border: 'none',
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    color: '#FFF',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  sliderArrowRight: {
    position: 'absolute',
    right: '24px',
    background: 'rgba(26, 27, 75, 0.85)',
    border: 'none',
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    color: '#FFF',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  dotsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '20px',
  },
  dot: {
    height: '8px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  // Credentials Segment
  credentialsSection: {
    padding: '60px 24px',
    background: '#FFF',
    borderBottom: '1px solid #E5E7EB',
  },
  credentialsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '32px',
  },
  credCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '16px',
  },
  credImage: {
    maxHeight: '260px',
    width: 'auto',
    maxWidth: '100%',
    objectFit: 'contain',
    borderRadius: '8px',
  },

  // Logo Ticker/Slider
  logoSliderSection: {
    padding: '40px 24px',
    background: '#FAF8F5',
    borderBottom: '1px solid #E5E7EB',
  },
  visitedTitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1A1B4B',
    textAlign: 'center',
    marginBottom: '24px',
  },
  sliderContainer: {
    overflow: 'hidden',
    width: '100%',
    position: 'relative',
  },
  sliderTrack: {
    display: 'flex',
    gap: '40px',
    width: 'max-content',
    animation: 'marquee 25s linear infinite',
  },
  logoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#FFF',
    padding: '12px 24px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
  },
  logoImage: {
    height: '36px',
    maxWidth: '120px',
    objectFit: 'contain',
  },

  // Featured Section
  featuredSection: {
    padding: '60px 24px',
    background: '#FFF',
    borderBottom: '1px solid #E5E7EB',
  },
  featuredGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '32px',
  },
  featuredCard: {
    background: '#FAF8F5',
    borderRadius: '16px',
    padding: '32px 24px',
    textAlign: 'center',
    border: '1px solid rgba(26,27,75,0.06)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
    transition: 'transform 0.2s',
  },
  featuredTag: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#FF9F1C',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '16px',
    display: 'block',
  },
  featuredImage: {
    width: '100%',
    height: '180px',
    objectFit: 'contain',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  featuredCardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1A1B4B',
    marginBottom: '8px',
  },
  featuredCardDesc: {
    fontSize: '13px',
    color: '#6B7280',
    lineHeight: '1.5',
    marginBottom: '16px',
  },
  featuredCta: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#FF9F1C',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },

  // About Biography Section
  aboutSection: {
    padding: '80px 24px',
    background: '#FAF8F5',
  },
  aboutWrapper: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '48px',
    alignItems: 'center',
  },
  aboutTextContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#FF9F1C',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  aboutHeader: {
    fontSize: '36px',
    fontWeight: '900',
    color: '#1A1B4B',
    fontFamily: 'Outfit, sans-serif',
  },
  divider: {
    height: '4px',
    width: '60px',
    background: '#FF9F1C',
    margin: '16px 0 24px',
    borderRadius: '2px',
  },
  aboutText: {
    fontSize: '15px',
    lineHeight: '1.65',
    color: '#4B5563',
    marginBottom: '20px',
    textAlign: 'left',
  },
  heroBtnPrimary: {
    background: '#FF9F1C',
    color: '#1A1B4B',
    textDecoration: 'none',
    padding: '12px 28px',
    borderRadius: '9999px',
    fontWeight: '700',
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  aboutVisualContent: {
    position: 'relative',
    textAlign: 'center',
  },
  imageCardDecoration: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    right: '20px',
    bottom: '-20px',
    background: '#DA9B5B',
    borderRadius: '16px',
    zIndex: 1,
  },
  aboutPhoto: {
    position: 'relative',
    width: '100%',
    maxWidth: '320px',
    borderRadius: '16px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
    zIndex: 2,
    margin: '0 auto',
  },

  // Books Section
  booksSection: {
    padding: '80px 24px',
    background: '#DA9B5B',
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'end',
    marginBottom: '40px',
    borderBottom: '2px solid rgba(255,255,255,0.2)',
    paddingBottom: '20px',
  },
  sectionLabelLight: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#FFF8E2',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '8px',
    display: 'block',
  },
  sectionTitleLight: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Outfit, sans-serif',
  },
  viewAllBtn: {
    background: 'rgba(255,255,255,0.2)',
    color: '#FFF',
    border: 'none',
    borderRadius: '9999px',
    padding: '10px 24px',
    fontWeight: '700',
    fontSize: '13px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  booksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
  },
  bookCard: {
    background: '#FFF',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
  },
  bookImgWrapper: {
    position: 'relative',
    height: '220px',
    background: '#FAF8F5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  bookImage: {
    maxHeight: '100%',
    maxWidth: '100%',
    objectFit: 'contain',
  },
  bookDetails: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  bookTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1A1B4B',
    marginBottom: '8px',
    lineHeight: '1.35',
    height: '38px',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  bookPriceBlock: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '16px',
  },
  bookPrice: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#1A1B4B',
  },
  buyBtn: {
    background: '#FF9F1C',
    color: '#1A1B4B',
    textDecoration: 'none',
    textAlign: 'center',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: 'auto',
  },
  youtubeSection: {
    padding: '80px 24px',
    background: '#FAF8F5',
    borderBottom: '1px solid #E5E7EB',
  },
  youtubeChannelBtn: {
    background: '#FF0000',
    color: '#FFF',
    borderRadius: '9999px',
    padding: '10px 24px',
    fontWeight: '700',
    fontSize: '13px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(255,0,0,0.2)',
  },
  youtubePlayerContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  iframeWrapper: {
    position: 'relative',
    width: '100%',
    paddingBottom: '56.25%',
    height: 0,
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    background: '#000',
  },
  youtubeIframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  activeVideoTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#1A1B4B',
    marginTop: '16px',
    marginBottom: '8px',
    lineHeight: 1.4,
  },
  activeVideoMeta: {
    fontSize: '12px',
    color: '#6B7280',
  },
  youtubePlaylistContainer: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '450px',
  },
  playlistHeader: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#1A1B4B',
    marginBottom: '16px',
  },
  playlistScroll: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflowY: 'auto',
    flex: 1,
    paddingRight: '8px',
  },
  playlistItem: {
    display: 'flex',
    gap: '12px',
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid rgba(26, 27, 75, 0.08)',
    cursor: 'pointer',
  },
  playlistThumb: {
    width: '100px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '6px',
  },
  playlistItemDetails: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
  },
  playlistItemTitle: {
    fontSize: '13px',
    fontWeight: '700',
    lineHeight: 1.35,
    marginBottom: '4px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  playlistItemDate: {
    fontSize: '11px',
    color: '#6B7280',
  },
  youtubeLoading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    fontSize: '15px',
    color: '#6B7280',
  },
};
