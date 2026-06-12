'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronDown, 
  Play, 
  HelpCircle, 
  BookOpen, 
  Sparkles, 
  Clock, 
  Users, 
  Award, 
  CheckCircle2, 
  MapPin, 
  BookCheck, 
  Mail, 
  Phone, 
  Home
} from 'lucide-react';
import CheckoutModal from '@/components/checkout-modal';

export default function WisdomEyeLandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  
  // Accordion state (keys correspond to lesson numbers 1 to 6)
  const [openLesson, setOpenLesson] = useState(1);

  // Monitor scroll for navbar styles & check user session
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
    };
    checkAuth();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLesson = (num) => {
    setOpenLesson(openLesson === num ? null : num);
  };

  const syllabus = [
    {
      num: 1,
      title: "Lesson 1: Who am I? & Proof of Soul's Existence",
      duration: "61 mins",
      items: [
        { type: "video", title: "Lesson 1 - Part 2 - Who am I?", dur: "21 min" },
        { type: "video", title: "Lesson 1 - Part 3 - Scientific Proof of Soul's Existence", dur: "22 min" },
        { type: "quiz", title: "Quiz - Lesson 1 - Part 1 - Introduction", questions: 6 },
        { type: "quiz", title: "Quiz - Lesson 1 - Part 2 - Who am I?", questions: 6 },
        { type: "quiz", title: "Quiz - Lesson 1 - Part 3 - Scientific Proof of Soul's Existence", questions: 6 }
      ]
    },
    {
      num: 2,
      title: "Lesson 2: Body, Mind & Soul Relationship",
      duration: "69 mins",
      items: [
        { type: "video", title: "Lesson 2 - Part 2 - Understanding the Subtle Body", dur: "21 min" },
        { type: "video", title: "Lesson 2 - Part 3 - The Mechanism of Mind & Senses", dur: "24 min" },
        { type: "quiz", title: "Quiz - Lesson 2 - Part 1", questions: 6 },
        { type: "quiz", title: "Quiz - Lesson 2 - Part 2", questions: 6 },
        { type: "quiz", title: "Quiz - Lesson 2 - Part 3", questions: 6 }
      ]
    },
    {
      num: 3,
      title: "Lesson 3: Laws of Nature & Destiny",
      duration: "68 mins",
      items: [
        { type: "video", title: "Lesson 3 - Part 2 - Action & Reaction (Karma)", dur: "19 min" },
        { type: "video", title: "Lesson 3 - Part 3 - Rising Above Material Conditioning", dur: "21 min" },
        { type: "quiz", title: "Quiz - Lesson 3 - Part 1", questions: 6 },
        { type: "quiz", title: "Quiz - Lesson 3 - Part 2", questions: 6 },
        { type: "quiz", title: "Quiz - Lesson 3 - Part 3", questions: 6 }
      ]
    },
    {
      num: 4,
      title: "Lesson 4: Reincarnation & Life After Death",
      duration: "95 mins",
      items: [
        { type: "video", title: "Lesson 4 - Part 2 - Transmigration of Soul", dur: "20 min" },
        { type: "video", title: "Lesson 4 - Part 3 - The Cycle of Birth and Death", dur: "22 min" },
        { type: "video", title: "Lesson 4 - Part 4 - Preparing for the Ultimate Transition", dur: "25 min" },
        { type: "quiz", title: "Quiz - Lesson 4 - Part 1", questions: 6 },
        { type: "quiz", title: "Quiz - Lesson 4 - Part 2", questions: 6 },
        { type: "quiz", title: "Quiz - Lesson 4 - Part 3", questions: 6 },
        { type: "quiz", title: "Quiz - Lesson 4 - Part 4", questions: 6 }
      ]
    },
    {
      num: 5,
      title: "Lesson 5: Yoga, Meditation & Inner Peace",
      duration: "83 mins",
      items: [
        { type: "video", title: "Lesson 5 - Part 2 - The Power of Mantra Meditation", dur: "21 min" },
        { type: "video", title: "Lesson 5 - Part 3 - Achieving Higher Consciousness", dur: "21 min" },
        { type: "video", title: "Lesson 5 - Part 4 - Practical Devotion in Everyday Life", dur: "21 min" },
        { type: "quiz", title: "Quiz - Lesson 5 - Part 1", questions: 6 },
        { type: "quiz", title: "Quiz - Lesson 5 - Part 2", questions: 6 },
        { type: "quiz", title: "Quiz - Lesson 5 - Part 3", questions: 6 },
        { type: "quiz", title: "Quiz - Lesson 5 - Part 4", questions: 6 }
      ]
    },
    {
      num: 6,
      title: "Lesson 6: Spiritual Vision & Leadership",
      duration: "86 mins",
      items: [
        { type: "video", title: "Lesson 6 - Part 2 - Developing Spiritual Vision (Wisdom Eye)", dur: "21 min" },
        { type: "video", title: "Lesson 6 - Part 3 - Becoming a Self-Controlled Leader", dur: "21 min" },
        { type: "video", title: "Lesson 6 - Part 4 - The Final Goal of Bhagavad Gita", dur: "22 min" },
        { type: "quiz", title: "Quiz - Lesson 6 - Part 1", questions: 6 },
        { type: "quiz", title: "Quiz - Lesson 6 - Part 2", questions: 6 },
        { type: "quiz", title: "Quiz - Lesson 6 - Part 3", questions: 6 },
        { type: "quiz", title: "Quiz - Lesson 6 - Part 4", questions: 6 }
      ]
    }
  ];

  return (
    <div>
      {/* 1. Header / Navbar */}
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Link href="/" className="logo">
            <div className="logo-icon">👁</div>
            <span>Wisdom Eye</span>
          </Link>
          <ul className="nav-links">
            <li className="hide-md"><a href="#about" className="nav-link">About</a></li>
            <li className="hide-md"><a href="#syllabus" className="nav-link">Syllabus</a></li>
            <li className="hide-md"><a href="#materials" className="nav-link">Books Included</a></li>
            <li className="hide-md"><a href="#faq" className="nav-link">FAQs</a></li>
            {user ? (
              <li>
                <Link 
                  href={user.role === 'student' ? '/dashboard' : '/lms-admin'} 
                  className="btn btn-primary" 
                  style={{ padding: '10px 22px', fontSize: '14px' }}
                >
                  Dashboard
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link href="/login" className="nav-link" style={{ fontWeight: '700', color: 'var(--primary)', marginRight: '4px' }}>
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/signup" 
                    className="btn btn-secondary" 
                    style={{ padding: '10px 20px', fontSize: '14px', border: '1.5px solid var(--primary)', marginRight: '4px' }}
                  >
                    Sign Up
                  </Link>
                </li>
                <li>
                  <button onClick={() => setModalOpen(true)} className="btn btn-primary" style={{ padding: '10px 22px', fontSize: '14px' }}>
                    Enroll Now
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="section-tag" style={{ color: 'var(--secondary)', fontWeight: '800' }}>⭐ Spiritual Awakening Course</span>
              <h1 className="hero-title">Open Your <span className="text-gradient">Wisdom Eye</span></h1>
              <p className="hero-subtitle">
                De-stress your mind, clear your intellect, and discover your true potential through a scientific exploration of the Bhagavad Gita. A comprehensive 6-lesson digital course accompanied by physical study books delivered directly to you.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-glow" style={{ padding: '16px 32px' }}>
                  Register for Course @ ₹200
                </button>
                {user ? (
                  <Link href={user.role === 'student' ? '/dashboard' : '/lms-admin'} className="btn btn-secondary" style={{ padding: '16px 32px' }}>
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="btn btn-secondary" style={{ padding: '16px 32px' }}>
                      Sign In
                    </Link>
                    <Link href="/signup" className="btn btn-secondary" style={{ padding: '16px 32px', backgroundColor: 'var(--primary)', color: 'white' }}>
                      Sign Up Free
                    </Link>
                  </>
                )}
                <a href="#syllabus" className="btn btn-secondary" style={{ padding: '16px 32px', border: '1px solid #D1D5DB', background: 'transparent', color: 'var(--text-dark)' }}>
                  View Syllabus
                </a>
              </div>
              <div className="hero-meta">
                <div className="hero-meta-item">
                  <Play size={18} style={{ color: 'var(--secondary)' }} /> 6 Lessons (15+ Videos)
                </div>
                <div className="hero-meta-item">
                  <BookOpen size={18} style={{ color: 'var(--secondary)' }} /> Physical Books Included
                </div>
                <div className="hero-meta-item">
                  <Award size={18} style={{ color: 'var(--secondary)' }} /> MCQ Tests & Certification
                </div>
              </div>
            </div>
            <div className="hero-image-container">
              <img 
                src="/images/1 Preach_Poster_Illustration_018_W.jpg" 
                alt="Wisdom Eye Spiritual Awakening illustration" 
                className="hero-image"
                style={{ height: '450px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Problem & Solution Section (using local photos) */}
      <section id="about" className="section" style={{ backgroundColor: 'var(--bg-white)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">The Challenge & The Solution</span>
            <h2 className="section-title">Why this course is essential today?</h2>
            <p className="section-desc">Life in the modern world presents complex mental challenges. Ancient wisdom provides the ultimate roadmap to peace, clarity, and determination.</p>
          </div>

          <div className="grid-3">
            {/* Card 1: Stress & Anxiety */}
            <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100%', height: '180px', position: 'relative', overflow: 'hidden', borderRadius: '8px', marginBottom: '20px' }}>
                <img src="/images/18 stressed out man 2.jpg" alt="Stressed out man" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h3 className="card-title">Manage Modern Stress</h3>
              <p className="card-desc">Are anxious thoughts and fast-paced lifestyles draining your energy? Learn practical mental de-congestion techniques straight from the Bhagavad Gita.</p>
            </div>

            {/* Card 2: Distractions */}
            <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100%', height: '180px', position: 'relative', overflow: 'hidden', borderRadius: '8px', marginBottom: '20px' }}>
                <img src="/images/9 Distracted student.jpg" alt="Distracted student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h3 className="card-title">Conquer Distractions</h3>
              <p className="card-desc">With endless digital alerts, focus has become a luxury. Train your mind to filter noise, enhance concentration, and align daily actions with your core values.</p>
            </div>

            {/* Card 3: Spiritual Clarity */}
            <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100%', height: '180px', position: 'relative', overflow: 'hidden', borderRadius: '8px', marginBottom: '20px' }}>
                <img src="/images/14 positive thinking.jpg" alt="Positive thinking student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h3 className="card-title">Cultivate Positivity</h3>
              <p className="card-desc">Unlock a state of steady happiness. Empower your intellect to rise above temporary material ups and downs with spiritual wisdom.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Deep-dive Gita Wisdom Section */}
      <section className="section section-bg-primary">
        <div className="container">
          <div className="threefold-grid">
            <div className="hero-image-container">
              <img 
                src="/images/18 Soul Subtle gross body.png" 
                alt="Soul, Subtle body, and Gross body breakdown" 
                style={{ width: '100%', height: '400px', objectFit: 'contain', backgroundColor: '#ffffff', padding: '10px', borderRadius: '16px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span className="section-tag" style={{ color: 'var(--secondary)' }}>Scientific Spiritual Philosophy</span>
              <h2 className="section-title" style={{ color: 'white', fontSize: '36px' }}>Understand Your Threefold Existence</h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '24px', fontSize: '16px' }}>
                Discover the deep Vedic science that defines our existence. Unlike superficial self-help guides, this course breaks down the relationships between:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(255,159,28,0.2)', padding: '8px', borderRadius: '50%', color: 'var(--secondary)' }}><CheckCircle2 size={16} /></div>
                  <div>
                    <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>The Gross Body</h4>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>The physical casing composed of the five material elements, requiring physical care and discipline.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(255,159,28,0.2)', padding: '8px', borderRadius: '50%', color: 'var(--secondary)' }}><CheckCircle2 size={16} /></div>
                  <div>
                    <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>The Subtle Body (Mind, Intellect, Ego)</h4>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>The seat of thoughts, logical decision-making, and self-identity. The interface of our consciousness.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(255,159,28,0.2)', padding: '8px', borderRadius: '50%', color: 'var(--secondary)' }}><CheckCircle2 size={16} /></div>
                  <div>
                    <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>The Soul (Self)</h4>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>The eternal observer and spark of life. Finding connection with the Supreme is the source of all peace.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive Syllabus Section */}
      <section id="syllabus" className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="section-header text-center">
            <span className="section-tag">Interactive Learning Syllabus</span>
            <h2 className="section-title">Explore the Course Modules</h2>
            <p className="section-desc">Click on any module to view the detailed topics, video materials, and tests included.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {syllabus.map((lesson) => {
              const isOpen = openLesson === lesson.num;
              return (
                <div 
                  key={lesson.num} 
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    border: '1.5px solid',
                    borderColor: isOpen ? 'var(--secondary)' : '#E5E7EB',
                    boxShadow: isOpen ? '0 10px 20px rgba(26,27,75,0.04)' : 'none',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <button 
                    onClick={() => toggleLesson(lesson.num)}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      textAlign: 'left'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', background: isOpen ? 'var(--secondary)' : '#E5E7EB', color: isOpen ? 'var(--primary)' : '#4B5563', padding: '3px 8px', borderRadius: '4px' }}>
                          MODULE {lesson.num}
                        </span>
                        <span style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {lesson.duration}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '16px', color: 'var(--primary)', marginTop: '8px', fontWeight: '700' }}>{lesson.title}</h3>
                    </div>
                    <ChevronDown 
                      size={20} 
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                        color: 'var(--primary)'
                      }} 
                    />
                  </button>

                  {isOpen && (
                    <div style={{ borderTop: '1px solid #E5E7EB', padding: '20px 24px', background: '#F9FAFB' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {lesson.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4B5563' }}>
                            <div style={{ width: '6px', height: '6px', background: 'var(--secondary)', borderRadius: '50%' }} />
                            <strong style={{ textTransform: 'capitalize' }}>[{item.type}]:</strong>
                            <span>{item.title}</span>
                            <span style={{ color: '#9CA3AF', fontSize: '11px', marginLeft: 'auto' }}>
                              {item.dur || `${item.questions} Qs`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Video Preview Section (nocookie) */}
      <section className="section" style={{ backgroundColor: 'var(--bg-white)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Video Trailers</span>
            <h2 className="section-title">Get a Glimpse of the Wisdom</h2>
            <p className="section-desc">Watch our course trailers to understand the design, content, and spiritual philosophy behind the Wisdom Eye training program.</p>
          </div>

          <div className="grid-2">
            <div style={{ background: '#000', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', aspectRatio: '16/9' }}>
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube-nocookie.com/embed/jZg0T7dK7Zg" 
                title="Wisdom Eye Trailer 1" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            </div>
            <div style={{ background: '#000', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', aspectRatio: '16/9' }}>
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube-nocookie.com/embed/8yC_bJvX2_Y" 
                title="Wisdom Eye Trailer 2" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. Study Materials Section (with local photos) */}
      <section id="materials" className="section" style={{ background: '#F8FAFC' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Study Materials Included</span>
            <h2 className="section-title">Physical Books Dispatched to Your Doorstep</h2>
            <p className="section-desc">To complement your online lessons, you will receive two print publications printed on high-quality paper, written by experts in Vedic psychology.</p>
          </div>

          <div className="grid-2" style={{ alignItems: 'center', gap: '60px' }}>
            <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <img src="/images/WisdomEye-front.jpeg" alt="Wisdom Eye Front Cover" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', height: '260px', objectFit: 'cover' }} />
              <img src="/images/WisdomEye-cover.jpeg" alt="Wisdom Eye Complete Cover" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', height: '260px', objectFit: 'cover' }} />
            </div>

            <div>
              <h3 style={{ fontSize: '24px', color: 'var(--primary)', marginBottom: '16px', fontFamily: 'Outfit, sans-serif' }}>Comprehensive Literature Set</h3>
              <p style={{ color: '#6B7280', fontSize: '15px', lineHeight: '1.7', marginBottom: '20px' }}>
                Your enrollment includes:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ color: 'var(--secondary)' }}><BookCheck size={18} /></div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)' }}>Wisdom Eye Course Book</h4>
                    <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>A beautifully formatted manual summarizing all 6 lessons, featuring key slokas, diagrams, and self-reflection questions.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ color: 'var(--secondary)' }}><BookCheck size={18} /></div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)' }}>Bhagavad Gita As It Is</h4>
                    <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>The full translation and commentary by A.C. Bhaktivedanta Swami Prabhupada. The definitive authority on spiritual self-realization.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQs Section */}
      <section id="faq" className="section" style={{ backgroundColor: 'var(--bg-white)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="section-header text-center">
            <span className="section-tag">Common Questions</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-desc">Got questions about materials, delivery, or certification? Find quick answers below.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card">
              <h3 style={{ fontSize: '18px', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <HelpCircle size={18} style={{ color: 'var(--secondary)' }} />
                Who is eligible for this course?
              </h3>
              <p className="card-desc">
                Anyone looking to build mental strength, character, and focus can register. There are no prerequisites! Whether you are a student, professional, or seeker, this course translates ancient wisdom into practical modern logic.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '18px', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <HelpCircle size={18} style={{ color: 'var(--secondary)' }} />
                Where do I collect the books if I select Self Pick Up?
              </h3>
              <p className="card-desc">
                You can collect the Bhagavad Gita and Wisdom Eye book from our NVCC temple in Katraj-Kondhwa, Pune. Bring the payment receipt emailed to you. Specific pickup hours are Monday to Sunday between 10:00 AM and 7:00 PM.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '18px', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <HelpCircle size={18} style={{ color: 'var(--secondary)' }} />
                How long will Home Delivery take?
              </h3>
              <p className="card-desc">
                Parcels are dispatched via courier within 2-3 business days. Deliveries inside Pune/Maharashtra take 2-4 days. Other parts of India take between 5 to 8 business days.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '18px', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <HelpCircle size={18} style={{ color: 'var(--secondary)' }} />
                What is the format of the course tests?
              </h3>
              <p className="card-desc">
                Each of the 6 lessons has short MCQ checkpoints. Taking these quizzes checks your conceptual understanding of the lessons and helps you track your progress. On successfully passing all tests, you will qualify for a course completion certificate!
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 9. Final CTA */}
      <section className="section section-bg-primary text-center">
        <div className="container" style={{ maxWidth: '700px' }}>
          <h2 style={{ fontSize: '42px', color: 'white', marginBottom: '20px' }}>Open Your Inner Wisdom Today</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '32px', fontSize: '18px' }}>
            Gain mental clarity, focus, and a deep understanding of self-realization for only ₹200. Physical books included.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-glow" style={{ padding: '16px 48px', fontSize: '16px' }}>
            Register Now & Start Learning
          </button>
        </div>
      </section>

      {/* 10. Footer (with compliance links) */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h3 className="logo" style={{ color: 'white', marginBottom: '16px' }}>
                <div className="logo-icon">👁</div>
                <span>Wisdom Eye</span>
              </h3>
              <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.6)' }}>
                Vedic Character & Leadership Training by VOICE Publication, ISKCON Pune.
              </p>
            </div>
            
            <div>
              <h4 className="footer-title">Course Info</h4>
              <ul className="footer-links">
                <li><a href="#about" className="footer-link">Course Details</a></li>
                <li><a href="#syllabus" className="footer-link">Syllabus Accordion</a></li>
                <li><a href="#materials" className="footer-link">Physical Books</a></li>
                <li><Link href="/track" className="footer-link" style={{ color: 'var(--secondary)', fontWeight: '700' }}>Track Your Order 🚚</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-title">Payment Policies</h4>
              <ul className="footer-links">
                <li><Link href="/terms" className="footer-link">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="footer-link">Privacy Policy</Link></li>
                <li><Link href="/refund-policy" className="footer-link">Refund & Cancellation</Link></li>
                <li><Link href="/shipping-policy" className="footer-link">Shipping & Delivery</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-title">Contact Us</h4>
              <ul className="footer-links">
                <li><Link href="/contact" className="footer-link">Support Contact</Link></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  <Mail size={14} /> manager@voicepune.com
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  <Phone size={14} /> +91 8605036000
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Wisdom Eye / VOICE Publication. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link href="/admin" style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }} className="footer-link">
                Staff Dashboard Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Checkout Modal */}
      <CheckoutModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
