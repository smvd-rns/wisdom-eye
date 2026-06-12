'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, Loader2, BookOpen } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.');
        return;
      }

      // Redirect based on role
      const role = data.user?.role;
      if (role === 'superadmin' || role === 'admin' || role === 'course_builder' || role === 'evaluator') {
        router.push('/lms-admin');
      } else {
        router.push(redirect);
      }
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
        {/* Logo */}
        <Link href="/" style={styles.logoRow}>
          <div style={styles.logoIcon}>
            <BookOpen size={20} color="#FF9F1C" />
          </div>
          <span style={styles.logoText}>Radheshyam Das</span>
        </Link>

        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to continue your learning journey</p>

        {error && (
          <div style={styles.errorBox}>
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrap}>
              <Mail size={16} style={styles.inputIcon} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                style={styles.input}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.fieldGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={styles.label}>Password</label>
              <Link href="/forgot-password" style={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>
            <div style={styles.inputWrap}>
              <Lock size={16} style={styles.inputIcon} />
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                style={{ ...styles.input, paddingRight: '44px' }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                style={styles.eyeBtn}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p style={styles.switchText}>
          Don't have an account?{' '}
          <Link href="/signup" style={styles.switchLink}>
            Create one free
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F1035 0%, #1A1B4B 100%)' }} />}>
      <LoginForm />
    </Suspense>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0F1035 0%, #1A1B4B 50%, #2D1B69 100%)',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute', top: '-100px', right: '-100px',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,159,28,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', bottom: '-120px', left: '-80px',
    width: '350px', height: '350px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(224,122,95,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    background: 'rgba(255,255,255,0.97)',
    borderRadius: '24px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
    position: 'relative',
    zIndex: 1,
    animation: 'fadeIn 0.4s ease',
  },
  logoRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '28px', textDecoration: 'none',
  },
  logoIcon: {
    width: '36px', height: '36px', borderRadius: '10px',
    background: '#1A1B4B', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'Outfit, sans-serif', fontSize: '18px',
    fontWeight: '800', color: '#1A1B4B',
  },
  title: {
    fontSize: '26px', fontWeight: '800', color: '#1A1B4B',
    marginBottom: '6px', fontFamily: 'Outfit, sans-serif',
  },
  subtitle: {
    fontSize: '14px', color: '#6B7280', marginBottom: '28px',
  },
  errorBox: {
    background: '#FEF2F2', border: '1px solid #FECACA',
    borderRadius: '10px', padding: '12px 16px',
    color: '#DC2626', fontSize: '14px', marginBottom: '20px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  inputWrap: { position: 'relative' },
  inputIcon: {
    position: 'absolute', left: '14px', top: '50%',
    transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none',
  },
  input: {
    width: '100%', padding: '12px 14px 12px 40px',
    border: '1.5px solid #E5E7EB', borderRadius: '10px',
    fontSize: '14px', color: '#1A1B4B', background: '#F9FAFB',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute', right: '14px', top: '50%',
    transform: 'translateY(-50%)', background: 'none',
    border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px',
  },
  forgotLink: {
    fontSize: '12px', color: '#FF9F1C', fontWeight: '600', textDecoration: 'none',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #1A1B4B 0%, #2D1B69 100%)',
    color: '#fff', border: 'none', borderRadius: '10px',
    padding: '14px', fontSize: '15px', fontWeight: '700',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '8px', marginTop: '4px',
    transition: 'opacity 0.2s, transform 0.2s',
    fontFamily: 'Outfit, sans-serif',
  },
  switchText: {
    textAlign: 'center', fontSize: '14px', color: '#6B7280', marginTop: '24px',
  },
  switchLink: {
    color: '#1A1B4B', fontWeight: '700', textDecoration: 'none',
  },
};
