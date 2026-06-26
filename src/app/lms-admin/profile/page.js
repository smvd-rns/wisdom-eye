'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  Save,
  ShieldCheck
} from 'lucide-react';

export default function AdminProfilePage() {
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

  useEffect(() => {
    const initData = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);
        setName(meData.user.name || '');
        setPhone(meData.user.phone || '');
      } catch (err) {
        console.error('Failed to load profile data:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    initData();
  }, [router]);

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
        // Update cached session info
        try {
          sessionStorage.setItem('cached_admin_user', JSON.stringify(data.user));
        } catch (e) {}
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', flexDirection: 'column', gap: '12px' }}>
        <Loader2 size={36} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
        <span style={{ color: '#6B7280', fontSize: '14px' }}>Loading profile details...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <ShieldCheck size={28} color="#FF9F1C" />
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: 0, fontFamily: 'Outfit, sans-serif' }}>My Profile</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0 0' }}>Manage your account details and password security.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
        
        {/* Profile Info Form */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1A1B4B', margin: '0 0 8px 0', fontFamily: 'Outfit, sans-serif' }}>
            Profile Information
          </h2>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>Update your administrator details.</p>

          {profileMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '20px',
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

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#1A1B4B' }}>Email Address (Read-only)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', opacity: 0.7 }}>
                <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled 
                  style={{ width: '100%', padding: '10px 14px 10px 40px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '13.5px', color: '#6B7280', background: '#F9FAFB', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#1A1B4B' }}>Full Name</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={16} color="#6B7280" style={{ position: 'absolute', left: '14px' }} />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your name"
                  required
                  style={{ width: '100%', padding: '10px 14px 10px 40px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '13.5px', color: '#1A1B4B', background: '#FFF', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#1A1B4B' }}>Phone Number</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Phone size={16} color="#6B7280" style={{ position: 'absolute', left: '14px' }} />
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="e.g. +91 9876543210"
                  style={{ width: '100%', padding: '10px 14px 10px 40px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '13.5px', color: '#1A1B4B', background: '#FFF', outline: 'none' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={profileSaving} 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                color: '#1A1B4B',
                background: '#FF9F1C',
                fontWeight: '700',
                fontSize: '13.5px',
                fontFamily: 'Outfit, sans-serif',
                cursor: 'pointer',
                marginTop: '8px',
                alignSelf: 'flex-start',
                transition: 'all 0.15s'
              }}
            >
              {profileSaving ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} style={{ marginRight: '6px' }} />
                  Save Details
                </>
              )}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0', fontFamily: 'Outfit, sans-serif' }}>
            Change Password
          </h2>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>Keep your account secure with a strong password.</p>

          {passwordMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '20px',
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

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#1A1B4B' }}>Current Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} color="#6B7280" style={{ position: 'absolute', left: '14px' }} />
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '10px 14px 10px 40px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '13.5px', color: '#1A1B4B', background: '#FFF', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#1A1B4B' }}>New Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} color="#6B7280" style={{ position: 'absolute', left: '14px' }} />
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Min 8 characters"
                  required
                  style={{ width: '100%', padding: '10px 14px 10px 40px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '13.5px', color: '#1A1B4B', background: '#FFF', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#1A1B4B' }}>Confirm New Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} color="#6B7280" style={{ position: 'absolute', left: '14px' }} />
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '10px 14px 10px 40px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '13.5px', color: '#1A1B4B', background: '#FFF', outline: 'none' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={passwordSaving} 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                color: '#FF9F1C',
                background: '#1A1B4B',
                fontWeight: '700',
                fontSize: '13.5px',
                fontFamily: 'Outfit, sans-serif',
                cursor: 'pointer',
                marginTop: '8px',
                alignSelf: 'flex-start',
                transition: 'all 0.15s'
              }}
            >
              {passwordSaving ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} />
                  Updating...
                </>
              ) : (
                <>
                  <KeyRound size={16} style={{ marginRight: '6px' }} />
                  Change Password
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
