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

  useEffect(() => {
    async function loadPage() {
      try {
        const res = await fetch(`/api/site-pages/${encodeURIComponent(rawSlug)}`);
        if (!res.ok) {
          // If page not found, redirect to home or 404
          router.push('/');
          return;
        }
        const data = await res.json();
        setPage(data.page);
      } catch (err) {
        console.error(err);
        router.push('/');
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

  if (!page) return null;

  return (
    <div style={{ background: '#f5f3eb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <SpecialCourseLanding
        course={page}
        isEnrolled={false}
        onEnroll={() => {}}
        slug={rawSlug}
      />
      <Footer />
    </div>
  );
}
