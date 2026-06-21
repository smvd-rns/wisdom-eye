'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Shield, 
  Award, 
  Flame, 
  BookOpen, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  BarChart2, 
  LogOut, 
  KeyRound, 
  Save,
  Clock
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function ProfilePage() {
  const router = useRouter();
  
  // User profile states
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Profile form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // Stats states
  const [enrollmentsCount, setEnrollmentsCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [tenantName, setTenantName] = useState('Wisdom Eye');

  useEffect(() => {
    try {
      const cachedUser = sessionStorage.getItem('dashboard_user');
      const cachedEnrollments = sessionStorage.getItem('dashboard_enrollments');
      const cachedTenant = sessionStorage.getItem('dashboard_tenant_name');

      if (cachedUser) {
        const parsedUser = JSON.parse(cachedUser);
        setUser(parsedUser);
        setName(parsedUser.name || '');
        setPhone(parsedUser.phone || '');
      }
      if (cachedEnrollments) {
        const parsedEnrs = JSON.parse(cachedEnrollments);
        setEnrollmentsCount(parsedEnrs.length);
        const completed = parsedEnrs.filter(e => e.course_progress?.percent_complete >= 100).length;
        setCompletedCount(completed);
      }
      if (cachedTenant) {
        setTenantName(cachedTenant);
      }

      if (cachedUser) {
        setLoading(false);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const initData = async () => {
      try {
        // Fetch tenant details
        const tenantRes = await fetch('/api/tenant/metadata');
        if (tenantRes.ok) {
          const tenantData = await tenantRes.json();
          setTenantName(tenantData.name || '');
          sessionStorage.setItem('dashboard_tenant_name', tenantData.name || '');
        }

        // 1. Fetch current user
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);
        setName(meData.user.name || '');
        setPhone(meData.user.phone || '');
        sessionStorage.setItem('dashboard_user', JSON.stringify(meData.user));

        // 2. Fetch enrollments & progress for stats
        const enrollmentsRes = await fetch('/api/student/enrollments');
        if (enrollmentsRes.ok) {
          const data = await enrollmentsRes.json();
          const activeEnrollments = data.enrollments || [];
          setEnrollmentsCount(activeEnrollments.length);
          sessionStorage.setItem('dashboard_enrollments', JSON.stringify(activeEnrollments));
          
          const completed = activeEnrollments.filter(
            e => e.course_progress?.percent_complete >= 100
          ).length;
          setCompletedCount(completed);
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    initData();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileMessage({ type: 'error', text: data.error || 'Failed to update profile.' });
      } else {
        setProfileMessage({ type: 'success', text: 'Profile details updated successfully!' });
        setUser(data.user);
        // Clean message after 4 seconds
        setTimeout(() => setProfileMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setProfileMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      setPasswordSaving(false);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      setPasswordSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordMessage({ type: 'error', text: data.error || 'Failed to change password.' });
      } else {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // Clean message after 4 seconds
        setTimeout(() => setPasswordMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setPasswordMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <Loader2 size={36} style={{ animation: 'spin 1.2s linear infinite', color: 'var(--secondary)' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Streak logic
  const todayStr = new Date().toISOString().split('T')[0];
  const lastActive = user?.last_active_date;
  const isStreakActive = lastActive === todayStr;
  const currentStreak = user?.current_streak || 0;

  return (
    <div style={styles.page}>
      <Navbar onlyBottom={true} />
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <Link href="/" style={styles.sidebarLogo}>
          <div style={styles.logoIcon}><BookOpen size={18} color="var(--secondary)" /></div>
          <span style={styles.logoText}>{tenantName}</span>
        </Link>

        <nav style={styles.nav}>
          <Link href="/dashboard" style={styles.navItem}>
            <BarChart2 size={18} /> My Courses
          </Link>
          <Link href="/certificates" style={styles.navItem}>
            <Award size={18} /> Certificates
          </Link>
          <Link href="/profile" style={{ ...styles.navItem, ...styles.navItemActive }}>
            <User size={18} /> Profile
          </Link>
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userChip}>
            <div style={styles.userAvatar}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={styles.userName}>{user?.name}</div>
              <div style={styles.userRole}>{user?.role || 'Student'}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle} id="profile-heading">👤 Personal Profile</h1>
            <p style={styles.pageSubtitle}>Manage your account details, security credentials, and view your progress.</p>
          </div>
          {user?.role && user.role !== 'student' && (
            <Link href="/lms-admin/users" style={styles.adminCta}>
              <Shield size={16} style={{ marginRight: '6px' }} /> Go to Admin Panel
            </Link>
          )}
        </div>

        {/* Content Layout Grid */}
        <div className="layout-grid" style={styles.layoutGrid}>
          {/* Left Side: Forms */}
          <div style={styles.leftColumn}>
            
            {/* Profile Info Form */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <User size={20} color="var(--primary)" />
                <h2 style={styles.cardTitle}>Profile Information</h2>
              </div>
              <p style={styles.cardSubtitle}>Update your display name and contact phone number.</p>

              {profileMessage && (
                <div style={{
                  ...styles.alert,
                  backgroundColor: profileMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                  borderColor: profileMessage.type === 'success' ? '#10B981' : '#EF4444',
                  color: profileMessage.type === 'success' ? '#065F46' : '#991B1B',
                }}>
                  {profileMessage.type === 'success' ? (
                    <CheckCircle2 size={16} style={{ marginRight: '8px', flexShrink: 0 }} />
                  ) : (
                    <AlertCircle size={16} style={{ marginRight: '8px', flexShrink: 0 }} />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} style={styles.form}>
                <div style={styles.formGroup}>
                  <label htmlFor="user-email-input" style={styles.label}>Email Address (Read-only)</label>
                  <div style={styles.inputWrapperDisabled}>
                    <Mail size={16} color="#9CA3AF" style={styles.inputIcon} />
                    <input 
                      type="email" 
                      id="user-email-input"
                      value={user?.email || ''} 
                      disabled 
                      style={styles.inputDisabled}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="user-name-input" style={styles.label}>Full Name</label>
                  <div style={styles.inputWrapper}>
                    <User size={16} color="#6B7280" style={styles.inputIcon} />
                    <input 
                      type="text" 
                      id="user-name-input"
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Your name"
                      required
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="user-phone-input" style={styles.label}>Phone Number</label>
                  <div style={styles.inputWrapper}>
                    <Phone size={16} color="#6B7280" style={styles.inputIcon} />
                    <input 
                      type="tel" 
                      id="user-phone-input"
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="e.g. +91 9876543210"
                      style={styles.input}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={profileSaving} 
                  style={{
                    ...styles.btnSubmit,
                    background: profileSaving ? '#6B7280' : 'var(--primary)'
                  }}
                  id="save-profile-btn"
                >
                  {profileSaving ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} style={{ marginRight: '8px' }} />
                      Save Details
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Change Password Form */}
            <div style={{ ...styles.card, marginTop: '24px' }}>
              <div style={styles.cardHeader}>
                <KeyRound size={20} color="var(--secondary)" />
                <h2 style={styles.cardTitle}>Change Password</h2>
              </div>
              <p style={styles.cardSubtitle}>Ensure your account stays secure by using a strong password.</p>

              {passwordMessage && (
                <div style={{
                  ...styles.alert,
                  backgroundColor: passwordMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                  borderColor: passwordMessage.type === 'success' ? '#10B981' : '#EF4444',
                  color: passwordMessage.type === 'success' ? '#065F46' : '#991B1B',
                }}>
                  {passwordMessage.type === 'success' ? (
                    <CheckCircle2 size={16} style={{ marginRight: '8px', flexShrink: 0 }} />
                  ) : (
                    <AlertCircle size={16} style={{ marginRight: '8px', flexShrink: 0 }} />
                  )}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} style={styles.form}>
                <div style={styles.formGroup}>
                  <label htmlFor="current-pwd-input" style={styles.label}>Current Password</label>
                  <div style={styles.inputWrapper}>
                    <Lock size={16} color="#6B7280" style={styles.inputIcon} />
                    <input 
                      type="password" 
                      id="current-pwd-input"
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)} 
                      placeholder="••••••••"
                      required
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="new-pwd-input" style={styles.label}>New Password</label>
                  <div style={styles.inputWrapper}>
                    <Lock size={16} color="#6B7280" style={styles.inputIcon} />
                    <input 
                      type="password" 
                      id="new-pwd-input"
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="Min 8 characters"
                      required
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="confirm-pwd-input" style={styles.label}>Confirm New Password</label>
                  <div style={styles.inputWrapper}>
                    <Lock size={16} color="#6B7280" style={styles.inputIcon} />
                    <input 
                      type="password" 
                      id="confirm-pwd-input"
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="••••••••"
                      required
                      style={styles.input}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={passwordSaving} 
                  style={{
                    ...styles.btnSubmit,
                    background: passwordSaving ? '#6B7280' : 'var(--secondary)',
                    color: 'var(--primary)'
                  }}
                  id="change-pwd-btn"
                >
                  {passwordSaving ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} />
                      Updating...
                    </>
                  ) : (
                    <>
                      <KeyRound size={16} style={{ marginRight: '8px' }} />
                      Change Password
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>

          {/* Right Side: Summary Card & Learning Stats */}
          <div style={styles.rightColumn}>
            
            {/* Profile Overview Card */}
            <div style={styles.summaryCard}>
              <div style={styles.summaryAvatar}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <h3 style={styles.summaryName}>{user?.name}</h3>
              <p style={styles.summaryEmail}>{user?.email}</p>
              
              <div style={styles.badgeWrap}>
                <span style={{
                  ...styles.roleBadge,
                  background: user?.role === 'superadmin' || user?.role === 'admin' 
                    ? '#FEE2E2' : user?.role === 'evaluator' ? '#FEF3C7' : '#DBEAFE',
                  color: user?.role === 'superadmin' || user?.role === 'admin' 
                    ? '#991B1B' : user?.role === 'evaluator' ? '#92400E' : '#1E40AF'
                }}>
                  <Shield size={12} style={{ marginRight: '4px' }} />
                  {user?.role?.toUpperCase() || 'STUDENT'}
                </span>
              </div>
            </div>

            {/* Learning Statistics Recap */}
            <div style={{ ...styles.card, marginTop: '24px' }}>
              <div style={styles.cardHeader}>
                <Award size={20} color="var(--primary)" />
                <h3 style={styles.cardTitle}>Learning Progress</h3>
              </div>
              
              <div style={styles.statsContainer}>
                {/* Streak Item */}
                <div style={styles.statItem}>
                  <div style={{ ...styles.statIconBadge, backgroundColor: isStreakActive ? '#FFFBEB' : '#F3F4F6' }}>
                    <Flame size={20} color={isStreakActive ? '#FF9F1C' : '#9CA3AF'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.statItemTitle}>Active Learning Streak</div>
                    <div style={styles.statItemValue}>
                      {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
                    </div>
                    <div style={styles.statItemSub}>
                      {isStreakActive ? 'Active today 🔥' : 'Idle today'}
                    </div>
                  </div>
                </div>

                {/* Enrolled Courses Item */}
                <div style={styles.statItem}>
                  <div style={{ ...styles.statIconBadge, backgroundColor: '#EFF6FF' }}>
                    <BookOpen size={20} color="#3B82F6" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.statItemTitle}>Enrolled Courses</div>
                    <div style={styles.statItemValue}>{enrollmentsCount}</div>
                    <div style={styles.statItemSub}>Courses in library</div>
                  </div>
                </div>

                {/* Certificates Earned Item */}
                <div style={styles.statItem}>
                  <div style={{ ...styles.statIconBadge, backgroundColor: '#ECFDF5' }}>
                    <Award size={20} color="#10B981" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.statItemTitle}>Certificates Earned</div>
                    <div style={styles.statItemValue}>{completedCount}</div>
                    <div style={styles.statItemSub}>Completed courses</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        
        @media (max-width: 900px) {
          aside { display: none !important; }
          main { margin-left: 0 !important; padding: 24px 24px 100px !important; }
          .layout-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }

        @media (max-width: 600px) {
          main { padding: 16px 16px 100px !important; }
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
    minHeight: '100vh',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '32px', flexWrap: 'wrap', gap: '16px',
  },
  pageTitle: { fontSize: '28px', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif', fontWeight: '800' },
  pageSubtitle: { fontSize: '14px', color: '#6B7280', marginTop: '2px' },
  adminCta: {
    display: 'flex', alignItems: 'center',
    background: '#FFF9DB', border: '1px solid #FFE066',
    color: '#82C91E', color: '#B25E00', padding: '10px 18px',
    borderRadius: '10px', fontSize: '13px', fontWeight: '700', textDecoration: 'none',
    transition: 'background 0.2s',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.1fr',
    gap: '32px',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    background: '#fff',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 2px 12px rgba(26,27,75,0.03)',
    border: '1px solid rgba(26,27,75,0.04)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1A1B4B',
    fontFamily: 'Outfit, sans-serif',
  },
  cardSubtitle: {
    fontSize: '13px',
    color: '#6B7280',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1A1B4B',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputWrapperDisabled: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    opacity: 0.75,
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
  },
  input: {
    width: '100%',
    padding: '12px 16px 12px 48px',
    borderRadius: '12px',
    border: '1px solid #D1D5DB',
    fontSize: '14px',
    fontFamily: 'inherit',
    color: '#1F2937',
    background: '#FFF',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputDisabled: {
    width: '100%',
    padding: '12px 16px 12px 48px',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    fontSize: '14px',
    fontFamily: 'inherit',
    color: '#6B7280',
    background: '#F9FAFB',
    cursor: 'not-allowed',
  },
  btnSubmit: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '14px',
    fontFamily: 'Outfit, sans-serif',
    cursor: 'pointer',
    marginTop: '8px',
    alignSelf: 'flex-start',
    transition: 'opacity 0.2s',
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '20px',
  },
  summaryCard: {
    background: 'linear-gradient(135deg, #1A1B4B 0%, #2D2E6D 100%)',
    borderRadius: '24px',
    padding: '32px',
    textAlign: 'center',
    color: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  summaryAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#FF9F1C',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '800',
    color: '#1A1B4B',
    marginBottom: '16px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
  },
  summaryName: {
    fontSize: '22px',
    fontWeight: '800',
    fontFamily: 'Outfit, sans-serif',
    marginBottom: '4px',
    color: '#FFFFFF',
  },
  summaryEmail: {
    fontSize: '13px',
    opacity: 0.7,
    marginBottom: '16px',
  },
  badgeWrap: {
    display: 'flex',
    justifyContent: 'center',
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '700',
  },
  statsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '14px',
    borderRadius: '16px',
    border: '1px solid #F3F4F6',
  },
  statIconBadge: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItemTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
  },
  statItemValue: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#1A1B4B',
    fontFamily: 'Outfit, sans-serif',
    marginTop: '2px',
  },
  statItemSub: {
    fontSize: '11px',
    color: '#9CA3AF',
    marginTop: '1px',
  },
};
