'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LearnIndexPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkEnrollmentAndRedirect = async () => {
      try {
        // 1. Fetch course details by slug
        const courseRes = await fetch(`/api/courses/by-slug/${slug}`);
        if (!courseRes.ok) {
          setError('Course not found');
          return;
        }
        const { course } = await courseRes.json();
        if (!course) {
          setError('Course not found');
          return;
        }

        // 2. Check enrollment
        const enrollRes = await fetch(`/api/courses/${course.id}/enrollment-check`);
        if (!enrollRes.ok) {
          // If unauthorized, go to login
          if (enrollRes.status === 401) {
            router.push(`/login?redirect=/courses/${slug}/learn`);
            return;
          }
          setError('Failed to check enrollment');
          return;
        }
        
        const { enrolled, progress } = await enrollRes.json();
        if (!enrolled) {
          // Redirect to landing page if not enrolled
          router.push(`/courses/${slug}`);
          return;
        }

        // 3. Determine redirect lesson
        if (progress?.last_lesson_id) {
          router.replace(`/courses/${slug}/learn/${progress.last_lesson_id}`);
          return;
        }

        // 4. Find the first lesson
        const sortedModules = [...(course.modules || [])].sort((a, b) => a.order_index - b.order_index);
        let firstLessonId = null;

        for (const mod of sortedModules) {
          if (mod.lessons && mod.lessons.length > 0) {
            const sortedLessons = [...mod.lessons].sort((a, b) => a.order_index - b.order_index);
            firstLessonId = sortedLessons[0].id;
            break;
          }
        }

        if (firstLessonId) {
          router.replace(`/courses/${slug}/learn/${firstLessonId}`);
        } else {
          setError('This course has no lessons yet.');
        }
      } catch (err) {
        console.error(err);
        setError('An unexpected error occurred');
      }
    };

    checkEnrollmentAndRedirect();
  }, [slug, router]);

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <h2 style={styles.errorTitle}>Oops!</h2>
          <p style={styles.errorText}>{error}</p>
          <button onClick={() => router.push(`/courses/${slug}`)} style={styles.backBtn}>
            Back to Course Landing Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.loadingWrap}>
      <Loader2 size={36} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
      <span style={styles.loadingText}>Opening Course Player...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#1A1B4B',
    color: '#fff',
    gap: '16px',
  },
  loadingText: {
    fontSize: '15px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    opacity: 0.8,
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#F0F2F5',
    padding: '24px',
  },
  errorCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1A1B4B',
    marginBottom: '12px',
  },
  errorText: {
    color: '#6B7280',
    fontSize: '14px',
    lineHeight: 1.6,
    marginBottom: '24px',
  },
  backBtn: {
    background: '#FF9F1C',
    color: '#1A1B4B',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '13px',
  },
};
