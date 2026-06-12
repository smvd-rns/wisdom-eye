'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

export default function LandingPage() {
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
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', color: 'rgba(255, 255, 255, 0.9)' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle2 size={20} style={{ color: 'var(--secondary)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>The Gross Body:</strong> The physical frame composed of earth, water, fire, air, and ether.
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle2 size={20} style={{ color: 'var(--secondary)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>The Subtle Body (Mind, Intellect, Ego):</strong> The psychic system that processes desires, emotions, intelligence, and self-identity.
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle2 size={20} style={{ color: 'var(--secondary)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>The Soul (Atma):</strong> The eternal, conscious spark of life that experiences all sensations through these bodies.
                  </div>
                </li>
              </ul>
              <button onClick={() => setModalOpen(true)} className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '32px' }}>
                Start Your Journey Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Detailed Curriculum Accordion */}
      <section id="syllabus" className="section" style={{ backgroundColor: 'var(--bg-light)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Course Curriculum</span>
            <h2 className="section-title">6 Structured Lessons</h2>
            <p className="section-desc">Explore the detailed curriculum structure. Each lesson contains comprehensive lectures and dedicated MCQ tests to cement your understanding.</p>
          </div>

          <div className="accordion">
            {syllabus.map((lesson) => (
              <div 
                key={lesson.num} 
                className={`accordion-item ${openLesson === lesson.num ? 'open' : ''}`}
              >
                <div className="accordion-header" onClick={() => toggleLesson(lesson.num)}>
                  <h3>
                    <span style={{ color: 'var(--secondary)', fontWeight: '800' }}>0{lesson.num}.</span>
                    {lesson.title}
                  </h3>
                  <div className="accordion-header-info">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {lesson.duration}</span>
                    <ChevronDown size={18} className="accordion-icon" />
                  </div>
                </div>

                <div className="accordion-content">
                  <div className="accordion-inner" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Lesson Contents:</p>
                    <div className="lesson-part">
                      
                      {lesson.items.map((item, idx) => (
                        <div key={idx} className="lecture-row">
                          <div className="lecture-info">
                            {item.type === 'video' ? (
                              <>
                                <span className="badge badge-video">Video</span>
                                <span>{item.title}</span>
                              </>
                            ) : (
                              <>
                                <span className="badge badge-quiz">Quiz</span>
                                <span>{item.title}</span>
                              </>
                            )}
                          </div>
                          <div className="lecture-meta">
                            {item.type === 'video' ? (
                              <span>{item.dur}</span>
                            ) : (
                              <span>{item.questions} Questions</span>
                            )}
                          </div>
                        </div>
                      ))}

                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Physical Books Included section */}
      <section id="materials" className="section" style={{ backgroundColor: 'var(--bg-white)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Course Books Material</span>
            <h2 className="section-title">Physical Study Guides Included</h2>
            <p className="section-desc">Your registration includes physical literature to guide your studies alongside the digital video lessons.</p>
          </div>

          <div className="grid-2">
            
            {/* Book Cover and visual */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#FDFBF7' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ width: '100px', height: '140px', position: 'relative', overflow: 'hidden', borderRadius: '4px', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
                  <img src="/images/WisdomEye-front.jpeg" alt="Wisdom Eye Study Book Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '20px', color: 'var(--primary)', marginBottom: '6px' }}>1. Wisdom Eye Study Book</h4>
                  <p className="card-desc">The official companion textbook containing lesson digests, illustrations, and space for quiz reviews.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '100px', height: '140px', position: 'relative', overflow: 'hidden', borderRadius: '4px', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
                  <img src="/images/WisdomEye-cover.jpeg" alt="Bhagavad Gita As It Is Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '20px', color: 'var(--primary)', marginBottom: '6px' }}>2. Bhagavad Gita As It Is</h4>
                  <p className="card-desc">The timeless text containing 700 verses of Sanskrit philosophy and dynamic translation commentaries.</p>
                </div>
              </div>
            </div>

            {/* Distribution logistics card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="section-tag" style={{ color: 'var(--accent)' }}>Collection & Shipping</span>
                <h3 style={{ fontSize: '28px', marginBottom: '16px' }}>How to get your books?</h3>
                <p className="card-desc" style={{ marginBottom: '24px' }}>
                  We support two pickup and shipping options during the registration checkout process:
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <MapPin size={24} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
                    <div>
                      <strong>Self Pick Up (Price: ₹200)</strong>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Collect directly from ISKCON Pune (NVCC Temple, Katraj-Kondhwa road) with no extra shipping fees.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Home size={24} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
                    <div>
                      <strong>Home Delivery Parcel (Price: ₹250)</strong>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Include ₹50 postage, and we will package and mail the books directly to your doorstep anywhere in India.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '32px' }}>
                <button onClick={() => setModalOpen(true)} className="btn btn-primary" style={{ width: '100%' }}>
                  Register and Choose Option
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Image gallery using provided photos */}
      <section className="section" style={{ backgroundColor: 'var(--bg-light)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Vedic Education in Action</span>
            <h2 className="section-title">Promoting Integrity & Values</h2>
            <p className="section-desc">Glimpses from VOICE Publication's book distributions and character building workshops.</p>
          </div>

          <div className="gallery-grid">
            <div className="gallery-item">
              <img src="/images/21 Book-Distributors.jpg" alt="Vedic Book Distribution" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="gallery-item">
              <img src="/images/12 two student study 2.jpg" alt="Students studying Bhagavad Gita" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="gallery-item">
              <img src="/images/23 Ethical Work Practices.png" alt="Ethical Work Practices Seminar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="gallery-item">
              <img src="/images/7 Good Habits.png" alt="Good Habits workshop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* 7.5. Introductory Video Embeds Section */}
      <section className="section" style={{ backgroundColor: 'var(--bg-white)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div className="section-header text-center" style={{ marginBottom: '40px' }}>
            <span className="section-tag">Introductory Media</span>
            <h2 className="section-title">Course Launch & Youth Seminars</h2>
            <p className="section-desc">Watch the official book launch and universal human value course introduction videos.</p>
          </div>

          <div className="grid-2" style={{ marginTop: '30px' }}>
            <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
                <iframe
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  src="https://www.youtube-nocookie.com/embed/PffcZw-N4as"
                  title="Wisdom Eye Book Launch Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <h3 style={{ fontSize: '18px', marginTop: '16px', marginBottom: '8px' }}>Wisdom Eye Book Launch</h3>
              <p className="card-desc" style={{ fontSize: '14px' }}>The official launch of the Wisdom Eye handbook by ISKCON VOICE Publication.</p>
            </div>

            <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
                <iframe
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  src="https://www.youtube-nocookie.com/embed/YTG5352xCTk"
                  title="Value Education Course UHV Introduction Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <h3 style={{ fontSize: '18px', marginTop: '16px', marginBottom: '8px' }}>Value Education for College Youths</h3>
              <p className="card-desc" style={{ fontSize: '14px' }}>Universal Human Values (UHV) character coaching curriculum for colleges.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ Section */}
      <section id="faq" className="section" style={{ backgroundColor: 'var(--bg-white)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="section-header text-center">
            <span className="section-tag">Common Questions</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px' }}>
            
            <div className="card">
              <h3 style={{ fontSize: '18px', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <HelpCircle size={18} style={{ color: 'var(--secondary)' }} />
                How do I access the course video lessons?
              </h3>
              <p className="card-desc">
                After successful checkout on this page, our backend automatically enrolls your email address into the course on the Graphy platform. You will immediately receive a welcome email with login details to access the videos and MCQ tests.
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
