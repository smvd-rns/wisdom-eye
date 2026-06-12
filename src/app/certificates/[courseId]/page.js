'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';

export default function CertificatePrintPage() {
  const { courseId } = useParams();
  const router = useRouter();

  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCertData = async () => {
      try {
        const res = await fetch(`/api/certificates/${courseId}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to verify certificate');
          return;
        }
        const data = await res.json();
        setCertData(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch certificate details');
      } finally {
        setLoading(false);
      }
    };
    fetchCertData();
  }, [courseId]);

  if (loading) return (
    <div style={styles.loadingWrap}>
      <Loader2 size={36} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
      <span>Verifying Certificate...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={styles.errorContainer}>
      <div style={styles.errorCard}>
        <h2>Verification Failed</h2>
        <p>{error}</p>
        <button onClick={() => router.push('/certificates')} style={styles.backBtn}>
          Back to Certificates
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.pageWrap}>
      {/* Control bar (hidden when printing) */}
      <div className="no-print" style={styles.controlBar}>
        <button onClick={() => router.push('/certificates')} style={styles.controlBackBtn}>
          <ArrowLeft size={14} /> Back
        </button>
        <button onClick={() => window.print()} style={styles.printBtn}>
          <Printer size={15} /> Print / Save as PDF
        </button>
      </div>

      {/* Certificate Frame */}
      <div style={styles.certificateOuter}>
        <div style={{
          ...styles.certificateCanvas,
          backgroundImage: `url(${certData.certificate_image_url})`
        }}>
          {/* Text Overlays */}
          <div style={styles.canvasContent}>
            <div style={styles.headerText}>CERTIFICATE OF COMPLETION</div>
            <div style={styles.subtext}>THIS IS PROUDLY PRESENTED TO</div>
            <div style={styles.studentName}>{certData.student_name}</div>
            <div style={styles.reasonText}>
              for successfully completing all requirements and assessments for the course
            </div>
            <div style={styles.courseTitle}>{certData.course_title}</div>
            
            <div style={styles.footerRow}>
              <div style={styles.signatureBlock}>
                <div style={styles.signatureLine} />
                <div style={styles.signatureTitle}>Program Director</div>
              </div>
              <div style={styles.dateBlock}>
                <div style={styles.dateVal}>
                  {new Date(certData.completed_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </div>
                <div style={styles.dateLine} />
                <div style={styles.dateTitle}>Completion Date</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          html, body {
            width: 297mm;
            height: 210mm;
          }
        }
        @page {
          size: landscape;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

const styles = {
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F0F2F5', gap: '12px' },
  errorContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F0F2F5', padding: '20px' },
  errorCard: { background: '#fff', padding: '30px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%' },
  backBtn: { background: '#FF9F1C', color: '#1A1B4B', border: 'none', borderRadius: '6px', padding: '8px 20px', fontWeight: '700', cursor: 'pointer', marginTop: '16px' },
  pageWrap: { minHeight: '100vh', background: '#374151', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', boxSizing: 'border-box' },
  controlBar: { display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '842px', marginBottom: '20px', gap: '12px' },
  controlBackBtn: { background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  printBtn: { background: '#FF9F1C', color: '#1A1B4B', border: 'none', borderRadius: '6px', padding: '8px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  
  certificateOuter: {
    width: '100%',
    maxWidth: '842px', // Standard landscape ratio A4 width/height
    aspectRatio: '1.414',
    background: '#fff',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    borderRadius: '4px',
    overflow: 'hidden',
    position: 'relative'
  },
  certificateCanvas: {
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: '40px 60px',
    boxSizing: 'border-box'
  },
  canvasContent: {
    width: '100%',
    height: '100%',
    border: '4px double #C5A880',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    padding: '20px 40px',
    background: 'rgba(255, 255, 255, 0.94)' // Adds soft overlay to keep text highly legible over backgrounds
  },
  headerText: { fontSize: '24px', fontWeight: '900', color: '#1A1B4B', letterSpacing: '2px', fontFamily: 'Cinzel, Georgia, serif', marginBottom: '14px' },
  subtext: { fontSize: '11px', color: '#777', letterSpacing: '1.5px', marginBottom: '12px' },
  studentName: { fontSize: '32px', fontWeight: '800', color: '#997300', fontFamily: 'Outfit, cinzel, sans-serif', textTransform: 'capitalize', marginBottom: '16px', borderBottom: '1px solid #E5E7EB', paddingBottom: '6px', width: '80%', textAlign: 'center' },
  reasonText: { fontSize: '12px', color: '#555', fontStyle: 'italic', marginBottom: '14px', textAlign: 'center', maxWidth: '480px' },
  courseTitle: { fontSize: '22px', fontWeight: '800', color: '#1A1B4B', textAlign: 'center', marginBottom: '40px' },
  footerRow: { display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 'auto', padding: '0 40px' },
  signatureBlock: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '160px' },
  signatureLine: { width: '100%', borderBottom: '1px solid #777', marginBottom: '6px' },
  signatureTitle: { fontSize: '10px', color: '#777', fontWeight: '600' },
  dateBlock: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '160px' },
  dateVal: { fontSize: '12px', color: '#333', fontWeight: '600', marginBottom: '4px' },
  dateLine: { width: '100%', borderBottom: '1px solid #777', marginBottom: '6px' },
  dateTitle: { fontSize: '10px', color: '#777', fontWeight: '600' }
};
