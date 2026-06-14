'use client';

import { useState } from 'react';
import { BookOpen, Calendar, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const DAILY_READINGS = [
  {
    day: 1,
    title: 'Discovering Your Divine Spark',
    verse: 'dehino ’smin yathā dehe kaumāraṁ yauvanaṁ jarā | tathā dehāntara-prāptir dhīras tatra na muhyati',
    translation: 'As the embodied soul continuously passes, in this body, from boyhood to youth to old age, the soul similarly passes into another body at death. A sober person is not bewildered by such a change.',
    reference: 'Bhagavad Gita 2.13',
    reflection: 'Just as we do not lament the loss of childhood features as we grow into youth, we should realize that the soul inside remains unaffected by the changes of the biological frame. Realizing our spiritual identity beyond the temporary physical form is the first step toward true fearlessness and peace.'
  },
  {
    day: 2,
    title: 'The Art of Mind Control',
    verse: 'bandhur ātmātmanas tasya yenātmaivātmanā jitaḥ | anātmanas tu śatrutve vartetātmaiva śatru-vat',
    translation: 'For him who has conquered the mind, the mind is the best of friends; but for one who has failed to do so, his mind will remain the greatest enemy.',
    reference: 'Bhagavad Gita 6.6',
    reflection: 'The mind is the instrument of our perception. If trained with logic, self-discipline, and wisdom, it guides us to elevate ourselves. If left unchecked and uncontrolled, it becomes our worst internal adversary, creating anxiety and chaos. Conquering the mind is the ultimate internal victory.'
  },
  {
    day: 3,
    title: 'Detached Actions for True Freedom',
    verse: 'karmaṇy evādhikāras te mā phaleṣu kadācana | mā karma-phala-hetur bhūr mā te saṅgo ’stv akarmaṇi',
    translation: 'You have a right to perform your prescribed duty, but you are not entitled to the fruits of action. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.',
    reference: 'Bhagavad Gita 2.47',
    reflection: 'Concentrate on the quality of your effort rather than being overwhelmed by anxiety over the outcome. True dedication means offering your best work without emotional dependency on immediate rewards or fame.'
  }
];

export default function DailyReadingPage() {
  const [currentDayIdx, setCurrentDayIdx] = useState(0);
  const currentReading = DAILY_READINGS[currentDayIdx];

  const handleNext = () => {
    setCurrentDayIdx((prev) => (prev + 1) % DAILY_READINGS.length);
  };

  const handlePrev = () => {
    setCurrentDayIdx((prev) => (prev - 1 + DAILY_READINGS.length) % DAILY_READINGS.length);
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <span style={styles.heroTag}>📖 Daily Reading</span>
          <h1 style={styles.heroTitle}>Scriptural Wisdom for the Day</h1>
          <p style={styles.heroSubtitle}>Start your day with spiritual inspiration and logical insights from timeless scriptures.</p>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.breadcrumbRow}>
          <Link href="/" style={styles.backLink}>
            <Home size={14} /> Back to Home
          </Link>
          <div style={styles.navButtons}>
            <button onClick={handlePrev} style={styles.navBtn}>
              <ChevronLeft size={16} /> Prev Day
            </button>
            <button onClick={handleNext} style={styles.navBtn}>
              Next Day <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div style={styles.readingCard}>
          <div style={styles.cardHeader}>
            <div style={styles.headerTitleBlock}>
              <Calendar size={18} color="#FF9F1C" />
              <span style={styles.dayText}>Day {currentReading.day} of {DAILY_READINGS.length}</span>
            </div>
            <span style={styles.refText}>{currentReading.reference}</span>
          </div>

          <h2 style={styles.readingTitle}>{currentReading.title}</h2>
          
          <div style={styles.verseBox}>
            <p style={styles.verseSanskrit}>“ {currentReading.verse} ”</p>
          </div>

          <div style={styles.sectionBlock}>
            <h4 style={styles.blockLabel}>Translation</h4>
            <p style={styles.blockText}>{currentReading.translation}</p>
          </div>

          <div style={styles.sectionBlock}>
            <h4 style={styles.blockLabel}>Practical Reflection</h4>
            <p style={styles.blockTextReflection}>{currentReading.reflection}</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

const styles = {
  page: {
    background: '#f5f3eb',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Inter, sans-serif',
  },
  hero: {
    background: 'linear-gradient(135deg, #1A1B4B 0%, #0F1035 60%, #2D1B69 100%)',
    padding: '80px 24px 60px',
    textAlign: 'center',
    color: '#FFF',
  },
  heroContent: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  heroTag: {
    display: 'inline-block',
    background: 'rgba(255,159,28,0.15)',
    color: '#FF9F1C',
    padding: '6px 16px',
    borderRadius: '9999px',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '16px',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: '36px',
    fontWeight: '800',
    marginBottom: '12px',
    fontFamily: 'Outfit, sans-serif',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.7)',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '32px 24px',
    width: '100%',
    flex: 1,
  },
  breadcrumbRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  backLink: {
    color: '#1A1B4B',
    fontWeight: '700',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    textDecoration: 'none',
  },
  navButtons: {
    display: 'flex',
    gap: '12px',
  },
  navBtn: {
    background: '#FFF',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#1A1B4B',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  readingCard: {
    background: '#FFF',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    border: '1px solid rgba(26,27,75,0.04)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #F3F4F6',
    paddingBottom: '16px',
    marginBottom: '24px',
  },
  headerTitleBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dayText: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1A1B4B',
  },
  refText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#FF9F1C',
  },
  readingTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1A1B4B',
    fontFamily: 'Outfit, sans-serif',
    marginBottom: '20px',
  },
  verseBox: {
    background: '#FAF8F5',
    padding: '24px',
    borderRadius: '12px',
    borderLeft: '4px solid #FF9F1C',
    marginBottom: '24px',
  },
  verseSanskrit: {
    fontStyle: 'italic',
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#1A1B4B',
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionBlock: {
    marginBottom: '24px',
  },
  blockLabel: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
  },
  blockText: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#4B5563',
  },
  blockTextReflection: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#1A1B4B',
    fontWeight: '500',
  },
};
