'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SpecialCourseLanding from '@/components/SpecialCourseLanding';
import { Loader2 } from 'lucide-react';

export default function DynamicSitePage() {
  const params = useParams();
  const router = useRouter();
  
  // Reconstruct path slug (e.g. ['about'] -> '/about', ['events', 'youth'] -> '/events/youth')
  const slugArr = params.slug || [];
  const rawSlug = '/' + slugArr.join('/');
  
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadPage() {
      try {
        const res = await fetch(`/api/site-pages/${encodeURIComponent(rawSlug)}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        if (data && data.page) {
          setPage(data.page);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, [rawSlug]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f3eb' }}>
        <Loader2 size={36} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div style={{ background: '#f5f3eb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '72px', fontWeight: '800', color: '#1A1B4B', margin: '0 0 16px 0' }}>404</h1>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#333', margin: '0 0 12px 0' }}>Page Not Found</h2>
          <p style={{ fontSize: '16px', color: '#666', maxWidth: '460px', margin: '0 0 24px 0' }}>
            The page you are looking for does not exist, has been removed, or is temporarily unavailable.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '12px 24px',
              backgroundColor: '#FF9F1C',
              color: '#ffffff',
              borderRadius: '8px',
              fontWeight: '600',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(255, 159, 28, 0.3)'
            }}
          >
            Back to Home
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f3eb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <SpecialCourseLanding
        course={page}
        isEnrolled={false}
        onEnroll={() => { window.location.href = '/courses'; }}
        slug={rawSlug}
      />
      <Footer />
    </div>
  );
}
