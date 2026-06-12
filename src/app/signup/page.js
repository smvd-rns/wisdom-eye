'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, BookOpen } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.card}>
        <Link href="/" style={styles.logoRow}>
          <div style={styles.logoIcon}>
            <BookOpen size={20} color="#FF9F1C" />
          </div>
          <span style={styles.logoText}>Wisdom Eye</span>
        </Link>

        <h1 style={styles.title}>Create your account</h1>
        <p style={styles.subtitle}>Join thousands of learners on their spiritual journey</p>

        {error && (
          <div style={styles.errorBox}>⚠️ {error}</div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Name */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Full Name</label>
            <div style={styles.inputWrap}>
              <User size={16} style={styles.inputIcon} />
              <input
                type="text" name="name" value={form.name}
                onChange={handleChange} placeholder="Your full name"
                required style={styles.input} autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrap}>
              <Mail size={16} style={styles.inputIcon} />
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="you@example.com"
                required style={styles.input} autoComplete="email"
              />
            </div>
          </div>

          {/* Phone */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Mobile Number <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
            <div style={styles.inputWrap}>
              <Phone size={16} style={styles.inputIcon} />
              <input
                type="tel" name="phone" value={form.phone}
                onChange={handleChange} placeholder="+91 9876543210"
                style={styles.input} autoComplete="tel"
              />
            </div>
          </div>

          {/* Two-column password row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <Lock size={16} style={styles.inputIcon} />
                <input
                  type={showPass ? 'text' : 'password'} name="password"
                  value={form.password} onChange={handleChange}
                  placeholder="Min 8 chars" required
                  style={{ ...styles.input, paddingRight: '40px' }}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={styles.eyeBtn} tabIndex={-1}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Confirm</label>
              <div style={styles.inputWrap}>
                <Lock size={16} style={styles.inputIcon} />
                <input
                  type={showPass ? 'text' : 'password'} name="confirmPassword"
                  value={form.confirmPassword} onChange={handleChange}
                  placeholder="Repeat password" required
                  style={styles.input} autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Creating account…</>
            ) : 'Create Account'}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <Link href="/login" style={styles.switchLink}>Sign in</Link>
        </p>

        <p style={styles.terms}>
          By signing up, you agree to our{' '}
          <Link href="/terms" style={styles.termsLink}>Terms of Service</Link> and{' '}
          <Link href="/privacy" style={styles.termsLink}>Privacy Policy</Link>.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0F1035 0%, #1A1B4B 50%, #2D1B69 100%)',
    padding: '24px', position: 'relative', overflow: 'hidden',
  },
  blob1: {
    position: 'absolute', top: '-80px', right: '-80px',
    width: '380px', height: '380px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,159,28,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', bottom: '-100px', left: '-60px',
    width: '320px', height: '320px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(224,122,95,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    background: 'rgba(255,255,255,0.97)', borderRadius: '24px',
    padding: '44px 40px', width: '100%', maxWidth: '500px',
    boxShadow: '0 32px 80px rgba(0,0,0,0.3)', position: 'relative', zIndex: 1,
  },
  logoRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '24px', textDecoration: 'none',
  },
  logoIcon: {
    width: '36px', height: '36px', borderRadius: '10px',
    background: '#1A1B4B', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '800', color: '#1A1B4B' },
  title: { fontSize: '24px', fontWeight: '800', color: '#1A1B4B', marginBottom: '6px', fontFamily: 'Outfit, sans-serif' },
  subtitle: { fontSize: '14px', color: '#6B7280', marginBottom: '24px' },
  errorBox: {
    background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px',
    padding: '12px 16px', color: '#DC2626', fontSize: '14px', marginBottom: '20px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  inputWrap: { position: 'relative' },
  inputIcon: {
    position: 'absolute', left: '14px', top: '50%',
    transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none',
  },
  input: {
    width: '100%', padding: '11px 14px 11px 40px',
    border: '1.5px solid #E5E7EB', borderRadius: '10px',
    fontSize: '14px', color: '#1A1B4B', background: '#F9FAFB',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute', right: '12px', top: '50%',
    transform: 'translateY(-50%)', background: 'none',
    border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #1A1B4B 0%, #2D1B69 100%)',
    color: '#fff', border: 'none', borderRadius: '10px',
    padding: '14px', fontSize: '15px', fontWeight: '700',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '8px', marginTop: '4px',
    fontFamily: 'Outfit, sans-serif',
  },
  switchText: { textAlign: 'center', fontSize: '14px', color: '#6B7280', marginTop: '20px' },
  switchLink: { color: '#1A1B4B', fontWeight: '700', textDecoration: 'none' },
  terms: { textAlign: 'center', fontSize: '12px', color: '#9CA3AF', marginTop: '12px' },
  termsLink: { color: '#6B7280', textDecoration: 'underline' },
};
