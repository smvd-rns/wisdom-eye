'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  Award, 
  Clock, 
  ChevronRight, 
  Mail, 
  Phone, 
  Users, 
  BookCheck, 
  GraduationCap 
} from 'lucide-react';

export default function GeneralHomePage() {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch session
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const data = await meRes.json();
          if (data.authenticated) {
            setUser(data.user);
          }
        }

        // Fetch courses list
        const coursesRes = await fetch('/api/courses');
        if (coursesRes.ok) {
          const data = await coursesRes.json();
          setCourses(data.courses || []);
        }
      } catch (err) {
        console.error('Home initialization failed:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return (
    <div style={styles.page}>
      {/* 1. Header / Navbar */}
      <header style={styles.header}>
        <div style={styles.navContainer}>
          <Link href="/" style={styles.logo}>
            <div style={styles.logoIcon}>👁</div>
            <span style={styles.logoText}>Radheshyam Das</span>
          </Link>
          
          <nav style={styles.navLinks}>
            <a href="#about" style={styles.navLink}>Why Us</a>
            <a href="#courses" style={styles.navLink}>Courses</a>
            {user ? (
              <Link 
                href={user.role === 'student' ? '/dashboard' : '/lms-admin'} 
                style={styles.navBtnPrimary}
              >
                Go to Dashboard
              </Link>
            ) : (
              <div style={styles.authGroup}>
                <Link href="/login" style={styles.navLink}>
                  Sign In
                </Link>
                <Link href="/signup" style={styles.navBtnSecondary}>
                  Sign Up Free
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroContainer}>
          <div style={styles.heroTagBlock}>
            <Sparkles size={14} color="var(--secondary)" />
            <span>Spiritual Wisdom & Vedic Science Platform</span>
          </div>
          <h1 style={styles.heroTitle}>
            Expand Your Mind with <span style={styles.heroGradient}>Transformative Wisdom</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Unlock character, determination, and spiritual growth. Access timed quizzes, certifications, physical books, and interactive discussion panels for a comprehensive learning experience.
          </p>
          <div style={styles.heroCtaRow}>
            <a href="#courses" style={styles.heroBtnPrimary}>
              Explore Courses <ArrowRight size={16} />
            </a>
            {!user && (
              <Link href="/signup" style={styles.heroBtnSecondary}>
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 3. Core Features / Why Us */}
      <section id="about" style={styles.featuresSection}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag}>FEATURES</span>
            <h2 style={styles.sectionTitle}>Built for Deep Spiritual Progress</h2>
            <p style={styles.sectionSubtitle}>Combining modern learning features with timeless Vedic intelligence.</p>
          </div>

          <div style={styles.featuresGrid}>
            {[
              { title: 'Physical Books Dispatched', desc: 'Complement your online classes with premium print manuals and scriptures delivered directly to your doorstep.', icon: <BookCheck size={24} /> },
              { title: 'Interactive Quizzes', desc: 'Auto-graded multiple choice assessments and personalized evaluator grading for subjective questions.', icon: <Award size={24} /> },
              { title: 'Discussion Boards', desc: 'Connect with evaluators and peers. Ask doubts and get logical answers directly under each lesson topic.', icon: <Users size={24} /> },
            ].map((f, i) => (
              <div key={i} style={styles.featureCard}>
                <div style={styles.featureIcon}>{f.icon}</div>
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Course Catalog Section */}
      <section id="courses" style={styles.coursesSection}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag}>OUR ACADEMY</span>
            <h2 style={styles.sectionTitle}>Available Courses</h2>
            <p style={styles.sectionSubtitle}>Enroll in specific programs to activate certificates and receive reading materials.</p>
          </div>

          {loading ? (
            <div style={styles.loadingContainer}>
              <div className="spinner" style={styles.spinner} />
            </div>
          ) : courses.length === 0 ? (
            <div style={styles.emptyContainer}>
              <BookOpen size={48} style={{ color: '#9CA3AF', marginBottom: '16px' }} />
              <h3 style={{ color: '#1A1B4B' }}>No courses published yet</h3>
              <p style={{ color: '#6B7280' }}>Check back later or register an account to receive alerts.</p>
            </div>
          ) : (
            <div style={styles.coursesGrid}>
              {courses.map((course) => {
                // Wisdom Eye gets its own dedicated layout override page
                const detailsLink = course.slug === 'wisdom-eye' 
                  ? '/courses/wisdom-eye' 
                  : `/courses/${course.slug}`;

                return (
                  <div key={course.id} style={styles.courseCard}>
                    <div style={styles.courseThumbnail}>
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={styles.thumbnailPlaceholder}>
                          <BookOpen size={36} color="#9CA3AF" />
                        </div>
                      )}
                      <span style={styles.levelBadge}>{course.level}</span>
                    </div>

                    <div style={styles.courseCardBody}>
                      <span style={styles.courseCategory}>{course.category}</span>
                      <h3 style={styles.courseTitle}>{course.title}</h3>
                      <p style={styles.courseDesc}>{course.short_description}</p>

                      <div style={styles.courseMeta}>
                        {course.total_lessons > 0 && (
                          <span style={styles.metaItem}><BookOpen size={12} /> {course.total_lessons} lessons</span>
                        )}
                        {course.has_certificate && (
                          <span style={styles.metaItem}><GraduationCap size={12} /> Certificate</span>
                        )}
                      </div>

                      <div style={styles.courseFooter}>
                        <div style={styles.priceContainer}>
                          <span style={styles.price}>{course.price === 0 ? 'Free' : `₹${course.price}`}</span>
                          {course.original_price && course.original_price > course.price && (
                            <span style={styles.originalPrice}>₹{course.original_price}</span>
                          )}
                        </div>
                        <Link href={detailsLink} style={styles.courseLink}>
                          View Course <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 5. Footer */}
      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={styles.footerGrid}>
            <div>
              <h3 style={styles.footerLogo}>👁 Radheshyam Das</h3>
              <p style={styles.footerDesc}>
                Vedic Character & Leadership Training by VOICE Publication, ISKCON Pune.
              </p>
            </div>
            <div>
              <h4 style={styles.footerSectionTitle}>Quick Links</h4>
              <ul style={styles.footerLinks}>
                <li><Link href="/login" style={styles.footerLink}>Login / Sign In</Link></li>
                <li><Link href="/signup" style={styles.footerLink}>Sign Up Free</Link></li>
                <li><Link href="/track" style={styles.footerLink}>Track Order 🚚</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={styles.footerSectionTitle}>Policies</h4>
              <ul style={styles.footerLinks}>
                <li><Link href="/terms" style={styles.footerLink}>Terms & Conditions</Link></li>
                <li><Link href="/privacy" style={styles.footerLink}>Privacy Policy</Link></li>
                <li><Link href="/refund-policy" style={styles.footerLink}>Refund Policy</Link></li>
                <li><Link href="/shipping-policy" style={styles.footerLink}>Shipping Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={styles.footerSectionTitle}>Support</h4>
              <ul style={styles.footerLinks}>
                <li><Link href="/contact" style={styles.footerLink}>Contact Support</Link></li>
                <li style={styles.footerInfo}><Mail size={12} /> manager@voicepune.com</li>
                <li style={styles.footerInfo}><Phone size={12} /> +91 8605036000</li>
              </ul>
            </div>
          </div>
          <div style={styles.footerBottom}>
            <p>&copy; {new Date().getFullYear()} Radheshyam Das / VOICE Publication. All rights reserved.</p>
            <Link href="/admin" style={styles.staffPortalLink}>Staff Dashboard</Link>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 32px;
          height: 32px;
          border: 4px solid #E5E7EB;
          border-top-color: var(--secondary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    background: '#F9FAFB',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Inter, sans-serif',
  },
  header: {
    background: '#FFFFFF',
    borderBottom: '1px solid #E5E7EB',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: '16px 24px',
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    background: '#1A1B4B',
    color: 'var(--secondary)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  logoText: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '18px',
    fontWeight: '800',
    color: '#1A1B4B',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  navLink: {
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4B5563',
    transition: 'color 0.2s',
  },
  authGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },
  navBtnPrimary: {
    background: '#1A1B4B',
    color: '#FFFFFF',
    textDecoration: 'none',
    padding: '8px 20px',
    borderRadius: '9999px',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: 'Outfit, sans-serif',
  },
  navBtnSecondary: {
    background: 'transparent',
    color: '#1A1B4B',
    border: '1.5px solid #1A1B4B',
    textDecoration: 'none',
    padding: '8px 20px',
    borderRadius: '9999px',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: 'Outfit, sans-serif',
  },
  heroSection: {
    background: 'radial-gradient(circle at 80% 20%, rgba(255, 159, 28, 0.08) 0%, rgba(26, 27, 75, 0.01) 60%), #1A1B4B',
    color: '#FFFFFF',
    padding: '120px 24px 100px',
    textAlign: 'center',
  },
  heroContainer: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  heroTagBlock: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,159,28,0.15)',
    color: 'var(--secondary)',
    padding: '6px 16px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: '24px',
  },
  heroTitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '48px',
    fontWeight: '900',
    lineHeight: 1.2,
    marginBottom: '20px',
  },
  heroGradient: {
    background: 'linear-gradient(135deg, #FFE066 0%, var(--secondary) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.6,
    marginBottom: '40px',
  },
  heroCtaRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  heroBtnPrimary: {
    background: 'var(--secondary)',
    color: '#1A1B4B',
    textDecoration: 'none',
    padding: '14px 32px',
    borderRadius: '9999px',
    fontWeight: '700',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'Outfit, sans-serif',
  },
  heroBtnSecondary: {
    background: 'rgba(255,255,255,0.08)',
    color: '#FFFFFF',
    border: '1px solid rgba(255,255,255,0.2)',
    textDecoration: 'none',
    padding: '14px 32px',
    borderRadius: '9999px',
    fontWeight: '700',
    fontSize: '15px',
    fontFamily: 'Outfit, sans-serif',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  featuresSection: {
    padding: '80px 24px',
    background: '#FFFFFF',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '48px',
  },
  sectionTag: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#FF9F1C',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '32px',
    fontWeight: '800',
    color: '#1A1B4B',
    marginTop: '8px',
  },
  sectionSubtitle: {
    fontSize: '15px',
    color: '#6B7280',
    marginTop: '6px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  featureCard: {
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    padding: '32px 24px',
    transition: 'transform 0.2s',
  },
  featureIcon: {
    width: '48px',
    height: '48px',
    background: 'rgba(26,27,75,0.05)',
    color: '#1A1B4B',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1A1B4B',
    marginBottom: '10px',
  },
  featureDesc: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: 1.5,
  },
  coursesSection: {
    padding: '80px 24px',
    background: '#F4F6F9',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '80px 0',
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '60px 0',
  },
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '28px',
  },
  courseCard: {
    background: '#FFFFFF',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
    border: '1px solid rgba(26,27,75,0.04)',
    display: 'flex',
    flexDirection: 'column',
  },
  courseThumbnail: {
    height: '180px',
    position: 'relative',
    background: '#EAEAEA',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    background: 'rgba(26,27,75,0.85)',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  courseCardBody: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  courseCategory: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#FF9F1C',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '8px',
  },
  courseTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1A1B4B',
    marginBottom: '10px',
    lineHeight: 1.3,
  },
  courseDesc: {
    fontSize: '13px',
    color: '#6B7280',
    lineHeight: 1.5,
    marginBottom: '16px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  courseMeta: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#888',
    fontWeight: '500',
  },
  courseFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid #F3F4F6',
    paddingTop: '16px',
    marginTop: 'auto',
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },
  price: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1A1B4B',
    fontFamily: 'Outfit, sans-serif',
  },
  originalPrice: {
    fontSize: '12px',
    textDecoration: 'line-through',
    color: '#9CA3AF',
  },
  courseLink: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#FF9F1C',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  footer: {
    background: '#1A1B4B',
    color: '#FFFFFF',
    padding: '60px 24px 30px',
    marginTop: 'auto',
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '32px',
    marginBottom: '40px',
  },
  footerLogo: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '20px',
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: '16px',
  },
  footerDesc: {
    fontSize: '13px',
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.6)',
  },
  footerSectionTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--secondary)',
    marginBottom: '16px',
  },
  footerLinks: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  footerLink: {
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    fontSize: '13px',
    transition: 'color 0.2s',
  },
  footerInfo: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  footerBottom: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
  },
  staffPortalLink: {
    color: 'rgba(255,255,255,0.4)',
    textDecoration: 'none',
  },
};
