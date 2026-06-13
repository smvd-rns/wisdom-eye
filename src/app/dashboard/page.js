'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Play, 
  Award, 
  Clock, 
  ChevronRight, 
  LogOut, 
  User, 
  BarChart2, 
  Loader2, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  CheckCircle2 
} from 'lucide-react';
import { formatImageUrl } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Get current user
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) { 
          router.push('/login'); 
          return; 
        }
        const meData = await meRes.json();
        setUser(meData.user);

        // Get enrollments + progress
        const enrRes = await fetch('/api/student/enrollments');
        if (enrRes.ok) {
          const enrData = await enrRes.json();
          const activeEnrollments = enrData.enrollments || [];
          setEnrollments(activeEnrollments);

          // Get all courses to filter for recommendations
          const coursesRes = await fetch('/api/courses');
          if (coursesRes.ok) {
            const coursesData = await coursesRes.json();
            const enrolledIds = new Set(activeEnrollments.map(e => e.courses?.id));
            const recommendations = (coursesData.courses || []).filter(
              c => !enrolledIds.has(c.id)
            );
            setRecommendedCourses(recommendations);
          }
        }
      } catch (e) {
        console.error('Dashboard init error:', e);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <Loader2 size={36} style={{ animation: 'spin 1.2s linear infinite', color: 'var(--secondary)' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const completedCourses = enrollments.filter(e => e.course_progress?.percent_complete === 100).length;
  const inProgress = enrollments.filter(e => (e.course_progress?.percent_complete || 0) < 100).length;
  const totalLessonsWatched = enrollments.reduce((acc, curr) => acc + (curr.course_progress?.lessons_completed || 0), 0);

  // Streak calculation & status
  const todayStr = new Date().toISOString().split('T')[0];
  const lastActive = user?.last_active_date;
  const isStreakActiveToday = lastActive === todayStr;
  const currentStreak = user?.current_streak || 0;

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <Link href="/" style={styles.sidebarLogo}>
          <div style={styles.logoIcon}><BookOpen size={18} color="var(--secondary)" /></div>
          <span style={styles.logoText}>Radheshyam Das</span>
        </Link>

        <nav style={styles.nav}>
          <a href="/dashboard" style={{ ...styles.navItem, ...styles.navItemActive }}>
            <BarChart2 size={18} /> My Courses
          </a>
          <a href="/certificates" style={styles.navItem}>
            <Award size={18} /> Certificates
          </a>
          <a href="/profile" style={styles.navItem}>
            <User size={18} /> Profile
          </a>
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userChip}>
            <div style={styles.userAvatar}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={styles.userName}>{user?.name}</div>
              <div style={styles.userRole}>Student</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.greeting}>
              👋 Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p style={styles.subGreeting}>Unlock your mind. Knowledge is the ultimate eye.</p>
          </div>
          <Link href="/courses" style={styles.browseCta}>
            Explore All Courses <ChevronRight size={16} />
          </Link>
        </div>

        {/* Highlight Section: Streak + Key Metrics */}
        <div style={styles.topSectionGrid}>
          {/* Streak Widget */}
          <div style={{
            ...styles.streakCard,
            background: isStreakActiveToday 
              ? 'linear-gradient(135deg, #FF9F1C 0%, #E07A5F 100%)' 
              : 'linear-gradient(135deg, #1A1B4B 0%, #2D2E6D 100%)',
            boxShadow: isStreakActiveToday ? '0 10px 30px rgba(255, 159, 28, 0.25)' : 'none',
          }}>
            <div style={styles.streakInfo}>
              <div style={{
                ...styles.streakBadge,
                background: isStreakActiveToday ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 159, 28, 0.15)',
              }}>
                <Flame 
                  size={32} 
                  className={isStreakActiveToday ? 'streak-flame-active' : ''} 
                  color={isStreakActiveToday ? '#FFFFFF' : '#FF9F1C'} 
                  style={{ transition: 'transform 0.3s ease' }}
                />
              </div>
              <div>
                <span style={styles.streakSublabel}>LEARNING STREAK</span>
                <h2 style={{
                  ...styles.streakValue,
                  color: isStreakActiveToday ? '#FFFFFF' : 'var(--secondary)',
                }}>
                  {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
                </h2>
              </div>
            </div>
            
            <p style={{
              ...styles.streakStatusText,
              color: isStreakActiveToday ? 'rgba(255, 255, 255, 0.9)' : 'rgba(244, 244, 249, 0.7)'
            }}>
              {isStreakActiveToday 
                ? 'Streak active today! You are building deep knowledge 🔥' 
                : currentStreak > 0 
                  ? 'Keep it up! Watch a lesson or take a quiz today to extend your streak!' 
                  : 'Start learning today to begin your streak!'}
            </p>

            {/* Streak achievement badge if any */}
            {currentStreak >= 3 && (
              <div style={styles.streakMilestoneBadge}>
                <Sparkles size={12} color="#FFF" />
                <span>Streak Challenger Tier</span>
              </div>
            )}
          </div>

          {/* Quick Learning Stats Grid */}
          <div style={styles.statsRow}>
            {[
              { label: 'Active Courses', value: inProgress, icon: <Play size={20} />, color: '#FF9F1C', desc: 'Currently studying' },
              { label: 'Completed', value: completedCourses, icon: <Award size={20} />, color: '#22C55E', desc: 'Fully finished' },
              { label: 'Lessons Watched', value: totalLessonsWatched, icon: <BookOpen size={20} />, color: '#3B82F6', desc: 'Total topics learned' },
            ].map((stat) => (
              <div key={stat.label} style={styles.statCard}>
                <div style={{ ...styles.statIcon, background: stat.color + '15', color: stat.color }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                  <div style={styles.statDesc}>{stat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Courses Section */}
        <div style={styles.sectionHeader}>
          <div style={styles.sectionTitleWrapper}>
            <TrendingUp size={20} color="var(--primary)" />
            <h2 style={styles.sectionTitle}>My Active Learning</h2>
          </div>
        </div>

        {enrollments.length === 0 ? (
          <div style={styles.emptyState}>
            <BookOpen size={48} style={{ color: '#D1D5DB', marginBottom: '16px' }} />
            <h3 style={styles.emptyTitle}>No enrolled courses yet</h3>
            <p style={styles.emptyText}>Find your next breakthrough among our classes.</p>
            <Link href="/courses" style={styles.emptyBtn}>Browse Courses</Link>
          </div>
        ) : (
          <div style={styles.courseGrid}>
            {enrollments.map((enr) => {
              const pct = enr.course_progress?.percent_complete || 0;
              const lastLesson = enr.course_progress?.last_lesson_id;
              return (
                <div key={enr.id} className="course-card-hover" style={styles.courseCard}>
                  <div style={{ ...styles.courseThumbnail, overflow: 'hidden' }}>
                    {enr.courses?.thumbnail_url ? (
                      <>
                        {/* Ambient background blur */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundImage: `url(${formatImageUrl(enr.courses.thumbnail_url)})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          filter: 'blur(10px) brightness(0.5)',
                          transform: 'scale(1.15)',
                          opacity: 0.8,
                        }} />
                        {/* Crisp contained foreground image */}
                        <img 
                          src={formatImageUrl(enr.courses.thumbnail_url)} 
                          alt={enr.courses.title} 
                          style={{ 
                            position: 'relative',
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain',
                            zIndex: 1
                          }} 
                        />
                      </>
                    ) : (
                      <div style={styles.courseThumbnailPlaceholder}>
                        <BookOpen size={32} color="#6B7280" />
                      </div>
                    )}
                    {pct === 100 && (
                      <div style={styles.completedBadge}>
                        <CheckCircle2 size={12} /> Completed
                      </div>
                    )}
                  </div>
                  <div style={styles.courseCardBody}>
                    <div style={styles.courseCategory}>{enr.courses?.category || 'General'}</div>
                    <h3 style={styles.courseTitle}>{enr.courses?.title}</h3>

                    {/* Progress bar */}
                    <div style={styles.progressSection}>
                      <div style={styles.progressHeader}>
                        <span style={styles.progressLabel}>Course Progress</span>
                        <span style={styles.progressPct}>{Math.round(pct)}%</span>
                      </div>
                      <div style={styles.progressBar}>
                        <div style={{ ...styles.progressFill, width: `${pct}%` }} />
                      </div>
                    </div>

                    <Link
                      href={`/courses/${enr.courses?.slug}/learn${lastLesson ? `/${lastLesson}` : ''}`}
                      style={styles.continueBtn}
                    >
                      {pct === 0 ? 'Start Learning' : pct === 100 ? 'Review Course' : 'Continue Learning'}
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recommended Courses Section */}
        {recommendedCourses.length > 0 && (
          <div style={{ marginTop: '48px' }}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitleWrapper}>
                <Sparkles size={20} color="var(--secondary)" />
                <h2 style={styles.sectionTitle}>Recommended For You</h2>
              </div>
              <p style={styles.sectionSubtitle}>Expand your perspective with these handpicked titles</p>
            </div>

            <div style={styles.recommendationsScrollContainer}>
              {recommendedCourses.map((course) => (
                <div key={course.id} style={styles.recommendationCard}>
                  <div style={{ ...styles.recommendationThumbnail, overflow: 'hidden' }}>
                    {course.thumbnail_url ? (
                      <>
                        {/* Ambient background blur */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundImage: `url(${formatImageUrl(course.thumbnail_url)})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          filter: 'blur(10px) brightness(0.5)',
                          transform: 'scale(1.15)',
                          opacity: 0.8,
                        }} />
                        {/* Crisp contained foreground image */}
                        <img 
                          src={formatImageUrl(course.thumbnail_url)} 
                          alt={course.title} 
                          style={{ 
                            position: 'relative',
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain',
                            zIndex: 1
                          }} 
                        />
                      </>
                    ) : (
                      <div style={styles.courseThumbnailPlaceholder}>
                        <BookOpen size={24} color="#9CA3AF" />
                      </div>
                    )}
                    <span style={{ ...styles.recommendationLevelBadge, zIndex: 2 }}>{course.level || 'Beginner'}</span>
                  </div>
                  
                  <div style={styles.recommendationContent}>
                    <span style={styles.recommendationCategory}>{course.category}</span>
                    <h4 style={styles.recommendationTitle}>{course.title}</h4>
                    <p style={styles.recommendationDesc}>{course.short_description}</p>
                    
                    <div style={styles.recommendationFooter}>
                      <div style={styles.recommendationMeta}>
                        <span style={styles.recommendationPrice}>
                          {course.price === 0 ? 'Free' : `₹${course.price}`}
                        </span>
                        {course.original_price && (
                          <span style={styles.recommendationOriginalPrice}>₹{course.original_price}</span>
                        )}
                      </div>
                      
                      <Link href={`/courses/${course.slug}`} style={styles.recommendationLink}>
                        View Details <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.4)); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.8)); }
        }
        
        .streak-flame-active {
          animation: pulse-glow 2s infinite ease-in-out;
        }

        .course-card-hover {
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease;
        }
        .course-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(26, 27, 75, 0.08) !important;
        }

        @media (max-width: 1024px) {
          .top-section-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
          aside { display: none !important; }
          main { margin-left: 0 !important; padding: 20px !important; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  loadingPage: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#F8F9FA',
  },
  page: {
    display: 'flex', minHeight: '100vh', background: '#F4F6F9',
  },
  sidebar: {
    width: '260px', flexShrink: 0, background: '#1A1B4B',
    display: 'flex', flexDirection: 'column',
    padding: '0', position: 'fixed', top: 0, left: 0,
    height: '100vh', zIndex: 50, overflowY: 'auto',
  },
  sidebarLogo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '24px 20px', textDecoration: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  logoIcon: {
    width: '34px', height: '34px', borderRadius: '8px',
    background: 'rgba(255,159,28,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontFamily: 'Outfit, sans-serif', fontSize: '17px', fontWeight: '800', color: '#fff' },
  nav: { padding: '20px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '11px 16px', borderRadius: '10px', color: 'rgba(255,255,255,0.6)',
    fontSize: '14px', fontWeight: '500', textDecoration: 'none',
    transition: 'background 0.2s, color 0.2s',
  },
  navItemActive: { background: 'rgba(255,255,255,0.1)', color: '#fff' },
  sidebarFooter: {
    padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  userChip: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  userAvatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: '#FF9F1C', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '15px', fontWeight: '700', color: '#1A1B4B',
    flexShrink: 0,
  },
  userName: { fontSize: '13px', fontWeight: '600', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' },
  userRole: { fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.6)', padding: '9px 14px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '13px', width: '100%', fontFamily: 'inherit',
  },
  main: {
    flex: 1, marginLeft: '260px', padding: '40px',
    minHeight: '100vh', animation: 'fadeIn 0.3s ease',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '32px', flexWrap: 'wrap', gap: '16px',
  },
  greeting: { fontSize: '28px', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif', fontWeight: '800' },
  subGreeting: { fontSize: '14px', color: '#6B7280', marginTop: '2px' },
  browseCta: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: '#1A1B4B', color: '#fff', padding: '12px 24px',
    borderRadius: '9999px', fontWeight: '700', fontSize: '14px', textDecoration: 'none',
    fontFamily: 'Outfit, sans-serif', transition: 'background 0.2s',
  },
  topSectionGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 2fr',
    gap: '24px',
    marginBottom: '40px',
  },
  // Streak Card style
  streakCard: {
    borderRadius: '24px',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    color: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  },
  streakInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
  },
  streakBadge: {
    width: '64px',
    height: '64px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakSublabel: {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1px',
    opacity: 0.8,
  },
  streakValue: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '32px',
    fontWeight: '900',
    lineHeight: 1.1,
  },
  streakStatusText: {
    fontSize: '13px',
    lineHeight: 1.5,
    margin: '12px 0',
  },
  streakMilestoneBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '600',
    marginTop: 'auto',
  },
  // Stats row container
  statsRow: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(3, 1fr)', 
    gap: '16px' 
  },
  statCard: {
    background: '#fff', borderRadius: '20px', padding: '24px',
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
    boxShadow: '0 2px 12px rgba(26,27,75,0.03)',
    border: '1px solid rgba(26,27,75,0.04)',
  },
  statIcon: { 
    width: '44px', 
    height: '44px', 
    borderRadius: '12px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: '16px',
    fontWeight: 'bold',
  },
  statValue: { fontSize: '32px', fontWeight: '800', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif', lineHeight: 1 },
  statLabel: { fontSize: '14px', color: '#1A1B4B', fontWeight: '700', marginTop: '6px' },
  statDesc: { fontSize: '11px', color: '#888', marginTop: '2px' },
  sectionHeader: { marginBottom: '24px' },
  sectionTitleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  sectionTitle: { fontSize: '22px', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif', fontWeight: '800' },
  sectionSubtitle: { fontSize: '13px', color: '#6B7280' },
  emptyState: {
    background: '#fff', borderRadius: '24px', padding: '60px 40px',
    textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
    border: '1px solid rgba(26,27,75,0.04)',
  },
  emptyTitle: { fontSize: '20px', color: '#1A1B4B', marginBottom: '8px', fontWeight: '700' },
  emptyText: { fontSize: '14px', color: '#6B7280', marginBottom: '24px' },
  emptyBtn: {
    display: 'inline-block', background: '#FF9F1C', color: '#1A1B4B',
    padding: '12px 28px', borderRadius: '9999px', fontWeight: '700',
    textDecoration: 'none', fontFamily: 'Outfit, sans-serif',
  },
  courseGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' },
  courseCard: {
    background: '#fff', borderRadius: '20px', overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0,0,0,0.02)', border: '1px solid rgba(26,27,75,0.04)',
  },
  courseThumbnail: { height: '180px', background: '#F0F2F5', position: 'relative', overflow: 'hidden' },
  courseThumbnailPlaceholder: {
    width: '100%', height: '100%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', background: '#EAEAEA'
  },
  completedBadge: {
    position: 'absolute', top: '12px', right: '12px',
    background: '#22C55E', color: '#fff', fontSize: '11px',
    fontWeight: '700', padding: '6px 12px', borderRadius: '9999px',
    display: 'flex', alignItems: 'center', gap: '4px',
    boxShadow: '0 4px 8px rgba(34,197,94,0.3)',
  },
  courseCardBody: { padding: '24px' },
  courseCategory: { fontSize: '10px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' },
  courseTitle: { fontSize: '18px', fontWeight: '700', color: '#1A1B4B', marginBottom: '20px', lineHeight: 1.35, height: '48px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  progressSection: { marginBottom: '20px' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  progressLabel: { fontSize: '12px', color: '#888', fontWeight: '500' },
  progressPct: { fontSize: '12px', fontWeight: '700', color: '#1A1B4B' },
  progressBar: { height: '8px', background: '#F0F2F5', borderRadius: '9999px', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #FF9F1C 0%, #E07A5F 100%)', borderRadius: '9999px', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' },
  continueBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    background: '#1A1B4B', color: '#fff', padding: '12px 20px',
    borderRadius: '9999px', fontWeight: '700', fontSize: '13px',
    textDecoration: 'none', fontFamily: 'Outfit, sans-serif', width: '100%',
    transition: 'background 0.2s',
  },

  // Recommended courses scroll container
  recommendationsScrollContainer: {
    display: 'flex',
    gap: '20px',
    overflowX: 'auto',
    paddingBottom: '16px',
    paddingRight: '4px',
    scrollbarWidth: 'thin',
    WebkitOverflowScrolling: 'touch',
  },
  recommendationCard: {
    flex: '0 0 280px',
    background: '#FFFFFF',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
    border: '1px solid rgba(26,27,75,0.04)',
    display: 'flex',
    flexDirection: 'column',
  },
  recommendationThumbnail: {
    height: '140px',
    position: 'relative',
    background: '#F0F2F5',
  },
  recommendationLevelBadge: {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    background: 'rgba(26,27,75,0.8)',
    color: '#FFF',
    fontSize: '9px',
    fontWeight: '700',
    textTransform: 'uppercase',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  recommendationContent: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  recommendationCategory: {
    fontSize: '9px',
    fontWeight: '800',
    color: '#FF9F1C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  recommendationTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1A1B4B',
    marginBottom: '6px',
    lineHeight: 1.3,
    height: '36px',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  recommendationDesc: {
    fontSize: '11px',
    color: '#6B7280',
    lineHeight: 1.4,
    marginBottom: '12px',
    height: '32px',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  recommendationFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    borderTop: '1px solid #F3F4F6',
    paddingTop: '12px',
  },
  recommendationMeta: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },
  recommendationPrice: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#1A1B4B',
  },
  recommendationOriginalPrice: {
    fontSize: '11px',
    textDecoration: 'line-through',
    color: '#9CA3AF',
  },
  recommendationLink: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#FF9F1C',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
};
