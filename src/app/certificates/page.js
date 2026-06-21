'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, BookOpen, Clock, Loader2, ArrowLeft, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function CertificatesPage() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('certificates_list');
      if (cached) {
        setCerts(JSON.parse(cached));
        setLoading(false);
      }
    } catch (e) {}

    const fetchCertificates = async () => {
      try {
        const res = await fetch('/api/student/enrollments');
        if (res.ok) {
          const data = await res.json();
          // Filter enrolled courses that are 100% complete and offer certificates
          const completedCerts = data.enrollments
            ?.filter(e => e.course_progress?.percent_complete >= 100 && e.courses?.has_certificate !== false)
            .map(e => ({
              id: e.courses.id,
              title: e.courses.title,
              slug: e.courses.slug,
              completedAt: e.course_progress.completed_at
            })) || [];
          setCerts(completedCerts);
          sessionStorage.setItem('certificates_list', JSON.stringify(completedCerts));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F2F5' }}>
      <Loader2 size={32} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="certs-page-wrapper" style={{ minHeight: '100vh', background: '#F0F2F5' }}>
      <Navbar />
      <div style={styles.container}>
        {/* Back link */}
        <Link href="/dashboard" style={styles.back}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
 
        <h1 style={styles.title}>🏆 Your Certificates</h1>
        <p style={styles.subtitle}>Download credentials for courses you have successfully finished.</p>
 
        {certs.length === 0 ? (
          <div style={styles.emptyState}>
            <Award size={48} style={{ color: '#D1D5DB', marginBottom: '16px' }} />
            <h3>No Certificates Available</h3>
            <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '6px' }}>
              Complete 100% of any certificate-granting course to claim your reward.
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {certs.map(c => (
              <div key={c.id} style={styles.card}>
                <div style={styles.iconWrap}>
                  <Award size={28} color="#FF9F1C" />
                </div>
                <div style={styles.body}>
                  <h3 style={styles.cardTitle}>{c.title}</h3>
                  <p style={styles.cardDate}>Completed: {new Date(c.completedAt).toLocaleDateString()}</p>
                  <div style={styles.actions}>
                    <Link href={`/certificates/${c.id}`} target="_blank" style={styles.downloadBtn}>
                      View Certificate <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        .certs-page-wrapper {
          padding: 100px 20px 40px !important;
        }
        @media (max-width: 900px) {
          .certs-page-wrapper {
            padding: 40px 16px 100px !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '0 auto' },
  back: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '13px', textDecoration: 'none', marginBottom: '20px' },
  title: { fontSize: '28px', fontWeight: '850', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif' },
  subtitle: { fontSize: '14px', color: '#6B7280', marginTop: '4px', marginBottom: '32px' },
  emptyState: { textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: '16px', border: '1.5px dashed #D1D5DB', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' },
  grid: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { display: 'flex', gap: '20px', background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', alignItems: 'center', border: '1px solid #E5E7EB' },
  iconWrap: { width: '48px', height: '48px', borderRadius: '12px', background: '#FFF9DB', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: '#1A1B4B' },
  cardDate: { fontSize: '12px', color: '#9CA3AF', marginTop: '2px' },
  actions: {},
  downloadBtn: { display: 'inline-flex', alignItems: 'center', background: '#FF9F1C', color: '#1A1B4B', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }
};
