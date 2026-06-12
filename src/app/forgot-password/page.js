'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, BookOpen, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return; }
      setSent(true);
    } catch {
      setError('An unexpected error occurred.');
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
          <div style={styles.logoIcon}><BookOpen size={20} color="#FF9F1C" /></div>
          <span style={styles.logoText}>Wisdom Eye</span>
        </Link>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle size={56} style={{ color: '#22C55E', marginBottom: '16px' }} />
            <h2 style={styles.title}>Check your inbox</h2>
            <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '28px', lineHeight: 1.6 }}>
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your spam folder if you don't see it.
            </p>
            <Link href="/login" style={styles.submitBtn}>Back to Sign In</Link>
          </div>
        ) : (
          <>
            <h1 style={styles.title}>Forgot your password?</h1>
            <p style={styles.subtitle}>Enter your email and we'll send a reset link</p>

            {error && <div style={styles.errorBox}>⚠️ {error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email Address</label>
                <div style={styles.inputWrap}>
                  <Mail size={16} style={styles.inputIcon} />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required style={styles.input}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} style={styles.submitBtn}>
                {loading
                  ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</>
                  : 'Send Reset Link'}
              </button>
            </form>

            <Link href="/login" style={styles.backLink}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #0F1035 0%, #1A1B4B 50%, #2D1B69 100%)',
    padding: '24px', position: 'relative', overflow: 'hidden',
  },
  blob1: { position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,159,28,0.15) 0%, transparent 70%)', pointerEvents: 'none' },
  blob2: { position: 'absolute', bottom: '-120px', left: '-80px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(224,122,95,0.12) 0%, transparent 70%)', pointerEvents: 'none' },
  card: { background: 'rgba(255,255,255,0.97)', borderRadius: '24px', padding: '48px 40px', width: '100%', maxWidth: '420px', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', position: 'relative', zIndex: 1 },
  logoRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', textDecoration: 'none' },
  logoIcon: { width: '36px', height: '36px', borderRadius: '10px', background: '#1A1B4B', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '800', color: '#1A1B4B' },
  title: { fontSize: '24px', fontWeight: '800', color: '#1A1B4B', marginBottom: '6px', fontFamily: 'Outfit, sans-serif' },
  subtitle: { fontSize: '14px', color: '#6B7280', marginBottom: '28px' },
  errorBox: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 16px', color: '#DC2626', fontSize: '14px', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  inputWrap: { position: 'relative' },
  inputIcon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' },
  input: { width: '100%', padding: '12px 14px 12px 40px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', color: '#1A1B4B', background: '#F9FAFB', boxSizing: 'border-box' },
  submitBtn: { background: 'linear-gradient(135deg, #1A1B4B 0%, #2D1B69 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'Outfit, sans-serif', textDecoration: 'none' },
  backLink: { display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '13px', marginTop: '20px', textDecoration: 'none', justifyContent: 'center' },
};
