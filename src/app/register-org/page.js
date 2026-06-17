'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Layers, ChevronRight, Loader2, CheckCircle, ShieldCheck, Mail, User, Phone, BookOpen, Globe } from 'lucide-react';

export default function RegisterOrgPage() {
  const [form, setForm] = useState({
    orgName: '',
    subdomainSlug: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    orgType: 'school',
    estimatedStudents: '1-50'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [domainSuffix, setDomainSuffix] = useState('.wisdom-eye.in');

  useState(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      if (host.includes('localhost') || host.includes('127.0.0.1')) {
        setDomainSuffix('.localhost:3000');
      } else {
        // Find clean base domain from hostname
        const parts = window.location.hostname.split('.');
        const baseDomain = parts.slice(-2).join('.');
        setDomainSuffix(`.${baseDomain}`);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'subdomainSlug') {
      // Clean slug format to allow only alphanumeric and hyphens
      const cleanVal = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setForm(prev => ({ ...prev, [name]: cleanVal }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/onboard-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit application.');
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle size={56} color="#22c55e" style={{ margin: '0 auto 20px auto' }} />
            <h1 style={{ ...styles.title, fontSize: '22px' }}>Application Submitted!</h1>
            <p style={{ ...styles.subtitle, margin: '12px 0 24px 0', lineHeight: '1.6' }}>
              Thank you for applying to create your custom LMS. Your request for <strong>{form.orgName}</strong> ({form.subdomainSlug}{domainSuffix}) has been sent to our Superadmins for approval.
            </p>
            <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 24px 0' }}>
              You will receive an email at <strong>{form.adminEmail}</strong> once your portal is approved and activated.
            </p>
            <Link href="/" style={styles.submitBtn}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.card}>
        <Link href="/" style={styles.logoRow}>
          <div style={styles.logoIcon}>
            <BookOpen size={20} color="#FF9F1C" />
          </div>
          <span style={styles.logoText}>Wisdom Eye SaaS</span>
        </Link>

        <h1 style={styles.title}>Register Your Organization</h1>
        <p style={styles.subtitle}>Apply to spin up your own custom-branded LMS portal</p>

        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          
          <h3 style={styles.sectionDivider}>1. Organization Details</h3>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Organization Name</label>
            <div style={styles.inputWrap}>
              <Layers size={16} style={styles.inputIcon} />
              <input
                type="text" name="orgName" value={form.orgName}
                onChange={handleChange} placeholder="e.g. Vedic Academy"
                required style={styles.input}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Desired Subdomain URL</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ ...styles.inputWrap, flex: 1 }}>
                <Globe size={16} style={styles.inputIcon} />
                <input
                  type="text" name="subdomainSlug" value={form.subdomainSlug}
                  onChange={handleChange} placeholder="vedic-academy"
                  required style={styles.input}
                />
              </div>
              <span style={{ fontSize: '13px', color: '#4B5563', fontWeight: '600' }}>{domainSuffix}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Organization Type</label>
              <select 
                name="orgType" value={form.orgType} onChange={handleChange}
                style={styles.select}
              >
                <option value="school">School / College</option>
                <option value="spiritual_center">Spiritual Center</option>
                <option value="corporate">Corporate Office</option>
                <option value="individual">Individual Teacher</option>
              </select>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Estimated Students</label>
              <select 
                name="estimatedStudents" value={form.estimatedStudents} onChange={handleChange}
                style={styles.select}
              >
                <option value="1-50">1 - 50</option>
                <option value="51-200">51 - 200</option>
                <option value="201-500">201 - 500</option>
                <option value="500+">500+</option>
              </select>
            </div>
          </div>

          <h3 style={{ ...styles.sectionDivider, marginTop: '10px' }}>2. Admin Contact Info</h3>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Administrator Name</label>
            <div style={styles.inputWrap}>
              <User size={16} style={styles.inputIcon} />
              <input
                type="text" name="adminName" value={form.adminName}
                onChange={handleChange} placeholder="Full name of admin"
                required style={styles.input}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Admin Email Address</label>
            <div style={styles.inputWrap}>
              <Mail size={16} style={styles.inputIcon} />
              <input
                type="email" name="adminEmail" value={form.adminEmail}
                onChange={handleChange} placeholder="admin@organization.com"
                required style={styles.input}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Admin Mobile Number</label>
            <div style={styles.inputWrap}>
              <Phone size={16} style={styles.inputIcon} />
              <input
                type="tel" name="adminPhone" value={form.adminPhone}
                onChange={handleChange} placeholder="+91 XXXXX XXXXX"
                required style={styles.input}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Submitting Application…</>
            ) : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0F1035 0%, #1A1B4B 50%, #2D1B69 100%)',
    padding: '32px 16px', position: 'relative', overflowY: 'auto',
    boxSizing: 'border-box'
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
    background: 'rgba(255,255,255,0.97)', borderRadius: '24px',
    padding: '36px 32px', width: '100%', maxWidth: '520px',
    boxShadow: '0 32px 80px rgba(0,0,0,0.3)', position: 'relative', zIndex: 1,
  },
  logoRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '20px', textDecoration: 'none',
  },
  logoIcon: {
    width: '36px', height: '36px', borderRadius: '10px',
    background: '#1A1B4B', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '800', color: '#1A1B4B' },
  title: { fontSize: '22px', fontWeight: '800', color: '#1A1B4B', marginBottom: '6px', fontFamily: 'Outfit, sans-serif', margin: 0 },
  subtitle: { fontSize: '13.5px', color: '#6B7280', marginBottom: '24px', margin: 0 },
  errorBox: {
    background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px',
    padding: '12px 16px', color: '#DC2626', fontSize: '13.5px', marginBottom: '20px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  sectionDivider: { fontSize: '12.5px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '14px 0 4px 0', borderBottom: '1.5px solid #F3F4F6', paddingBottom: '6px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '12.5px', fontWeight: '600', color: '#374151' },
  inputWrap: { position: 'relative' },
  inputIcon: {
    position: 'absolute', left: '14px', top: '50%',
    transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none',
  },
  input: {
    width: '100%', padding: '10px 14px 10px 40px',
    border: '1.5px solid #E5E7EB', borderRadius: '10px',
    fontSize: '13.5px', color: '#1A1B4B', background: '#F9FAFB',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #E5E7EB', borderRadius: '10px',
    fontSize: '13.5px', color: '#1A1B4B', background: '#F9FAFB',
    boxSizing: 'border-box',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #1A1B4B 0%, #2D1B69 100%)',
    color: '#fff', border: 'none', borderRadius: '10px',
    padding: '12px', fontSize: '14px', fontWeight: '700',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '8px', marginTop: '16px',
    fontFamily: 'Outfit, sans-serif',
    textDecoration: 'none'
  },
};
