'use client';

import { useState, useEffect } from 'react';
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
  Briefcase
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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

  // Auto-scroll Hero Poster Slider
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % POSTER_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % POSTER_IMAGES.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + POSTER_IMAGES.length) % POSTER_IMAGES.length);

  return (
    <div style={styles.page}>
      
      {/* Shared Header & Navbar */}
      <Navbar />

      {/* Premium Hero Image Slider Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroSliderContainer}>
          <button onClick={prevSlide} style={styles.sliderArrowLeft}>
            <ChevronLeft size={24} />
          </button>
          
          <div style={styles.slideImageWrapper}>
            <img 
              src={formatImageUrl(POSTER_IMAGES[activeSlide])} 
              alt={`Wisdom Poster ${activeSlide + 1}`} 
              style={styles.heroPosterImage}
            />
          </div>

          <button onClick={nextSlide} style={styles.sliderArrowRight}>
            <ChevronRight size={24} />
          </button>
        </div>
        
        {/* Slide Indicator Dots */}
        <div style={styles.dotsContainer}>
          {POSTER_IMAGES.map((_, idx) => (
            <span 
              key={idx} 
              onClick={() => setActiveSlide(idx)}
              style={{
                ...styles.dot,
                background: activeSlide === idx ? '#FF9F1C' : 'rgba(255,255,255,0.4)',
                width: activeSlide === idx ? '16px' : '8px',
              }}
            />
          ))}
        </div>
      </section>

      {/* 4 Separate Sections Segment (IIT, ISKCON Pune, Abids, Global Duty Officer) */}
      <section style={styles.credentialsSection}>
        <div style={styles.container}>
          <div style={styles.credentialsGrid}>
            <div style={styles.credCard}>
              <img 
                src={formatImageUrl("https://lh3.googleusercontent.com/d/19yYbEATwSgrOVfuKk339h6j6qVNY48Nw")} 
                alt="IIT Mumbai Topper" 
                style={styles.credImage}
              />
            </div>

            <div style={styles.credCard}>
              <img 
                src={formatImageUrl("https://lh3.googleusercontent.com/d/1zHSviGsVWpcjqEEcDClEht0qNihIQ8qp")} 
                alt="Temple President ISKCON Pune" 
                style={styles.credImage}
              />
            </div>

            <div style={styles.credCard}>
              <img 
                src={formatImageUrl("https://lh3.googleusercontent.com/d/1etXzaXu2p4rmW81PrMW6T-bHRfKIZzSQ")} 
                alt="Temple Management Council Member ISKCON Abids" 
                style={styles.credImage}
              />
            </div>

            <div style={styles.credCard}>
              <img 
                src={formatImageUrl("https://lh3.googleusercontent.com/d/1vu3f15JL_oJ8LAiYq4WItoVSH4Of5uEz")} 
                alt="Global Duty Officer Youth Training ISKCON" 
                style={styles.credImage}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Company Visited Slider Segment */}
      <section style={styles.logoSliderSection}>
        <div style={styles.container}>
          <h4 style={styles.visitedTitle}>Corporate Trainer</h4>
          <div style={styles.sliderContainer}>
            <div style={styles.sliderTrack}>
              {COMPANIES.concat(COMPANIES).map((comp, idx) => (
                <div key={idx} style={styles.logoItem}>
                  <img 
                    src={comp.logo} 
                    alt={comp.name} 
                    style={styles.logoImage}
                    onError={(e) => {
                      e.target.style.display = 'none'; // Fallback if logo fails
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section style={styles.featuredSection}>
        <div style={styles.container}>
          <div style={styles.featuredGrid}>
            <div style={styles.featuredCard}>
              <span style={styles.featuredTag}>Featured Book</span>
              <img 
                src="https://cdn.shopify.com/s/files/1/0614/8639/9543/files/WisdomEye-cover.jpg?v=1780304483" 
                alt="Wisdom Eye" 
                style={styles.featuredImage}
              />
              <h3 style={styles.featuredCardTitle}>Wisdom Eye</h3>
              <p style={styles.featuredCardDesc}>Laying the foundation for character and personal leadership success.</p>
              <Link href="/books" style={styles.featuredCta}>
                View All Books <ExternalLink size={14} />
              </Link>
            </div>

            <div style={styles.featuredCard}>
              <span style={styles.featuredTag}>Scripture Academy</span>
              <img 
                src="https://gaurangadarshandas.com/images/courses/8aab8f0c77c546568fd0c9c430ef6547_dw6z4v.png" 
                alt="Wisdom Eye Course" 
                style={styles.featuredImage}
              />
              <h3 style={styles.featuredCardTitle}>Certified Courses</h3>
              <p style={styles.featuredCardDesc}>Auto-graded quizzes, certification, and discussions under the guidance of Radheshyam Das.</p>
              <Link href="/courses" style={styles.featuredCta}>
                Explore Academy <ChevronRight size={14} />
              </Link>
            </div>

            <div style={styles.featuredCard}>
              <span style={styles.featuredTag}>Daily Reading</span>
              <div style={{ ...styles.featuredImage, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eadecd', borderRadius: '8px' }}>
                <BookOpenCheck size={48} color="#1A1B4B" />
              </div>
              <h3 style={styles.featuredCardTitle}>Daily Reading Wisdom</h3>
              <p style={styles.featuredCardDesc}>Start your day with spiritual inspiration and logical insights from timeless scriptures.</p>
              <Link href="/daily-reading" style={styles.featuredCta}>
                Read Daily Verse <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Author Intro Teaser */}
      <section style={styles.aboutSection}>
        <div style={styles.container}>
          <div style={styles.aboutWrapper}>
            <div style={styles.aboutTextContent}>
              <span style={styles.sectionLabel}>Biography</span>
              <h2 style={styles.aboutHeader}>Radheshyam Das</h2>
              <div style={styles.divider} />
              
              <p style={styles.aboutText}>
                <strong>Radheshyam Das</strong> is an IIT Mumbai Topper who dedicated his life as a full-time monk, youth educator, and author. Born in a devout family near Madurai, his childhood was fascinated by Vedic chants and philosophical classics.
              </p>
              
              <p style={styles.aboutText}>
                After top ranking at IIT Mumbai, working as a Senior Research Fellow and mechanical engineer at top companies, he took up the role of a celibate monk. He designed the DYS (Discover Your Self) and GAME (Gita for All Made Easy) course structures which are taught across leading universities.
              </p>

              <Link href="/about" style={styles.heroBtnPrimary}>
                Read Full Biography <ArrowRight size={16} />
              </Link>
            </div>

            <div style={styles.aboutVisualContent}>
              <div style={styles.imageCardDecoration} />
              <img 
                src="https://gdo.radheshyamdas.com/favicon.png" 
                alt="Radheshyam Das" 
                style={styles.aboutPhoto}
              />
            </div>
          </div>
        </div>
      </section>

      {/* VOICE Publication Books Teaser */}
      <section style={styles.booksSection}>
        <div style={styles.container}>
          <div style={styles.sectionHeaderRow}>
            <div>
              <span style={styles.sectionLabelLight}>Featured Literature</span>
              <h2 style={styles.sectionTitleLight}>Radheshyam Das Books</h2>
            </div>
            <Link href="/books" style={styles.viewAllBtn}>
              View All Books <ChevronRight size={16} />
            </Link>
          </div>

          <div style={styles.booksGrid}>
            {FEATURED_BOOKS.map((book) => (
              <div key={book.id} style={styles.bookCard}>
                <div style={styles.bookImgWrapper}>
                  <img src={book.image} alt={book.title} style={styles.bookImage} />
                </div>
                <div style={styles.bookDetails}>
                  <h3 style={styles.bookTitle}>{book.title}</h3>
                  <div style={styles.bookPriceBlock}>
                    <span style={styles.bookPrice}>{book.price}</span>
                  </div>
                  <a href={book.url} target="_blank" rel="noopener noreferrer" style={styles.buyBtn}>
                    Buy on Store <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shared Footer */}
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
    padding: '40px 24px 40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heroSliderContainer: {
    maxWidth: '850px',
    width: '100%',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '20px',
  },
  slideImageWrapper: {
    width: '100%',
    height: '420px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
    background: '#000',
  },
  heroPosterImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  sliderArrowLeft: {
    position: 'absolute',
    left: '-24px',
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
    right: '-24px',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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
};
