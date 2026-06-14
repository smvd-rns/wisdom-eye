'use client';

import { useState } from 'react';
import { Home, Play, Search, Volume2, X } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const VIDEOS_COLLECTION = [
  {
    id: 'vid1',
    title: 'Discover Your Self - Session 1: Can a Scientist Believe in God?',
    youtubeId: '3H2h-q1X8Z4',
    thumbnail: 'https://img.youtube.com/vi/3H2h-q1X8Z4/hqdefault.jpg',
    category: 'Discover Your Self'
  },
  {
    id: 'vid2',
    title: 'Art of Mind Control - How to Deal with Stress logically',
    youtubeId: 'E_n562sN5aI',
    thumbnail: 'https://img.youtube.com/vi/E_n562sN5aI/hqdefault.jpg',
    category: 'Mind Control'
  },
  {
    id: 'vid3',
    title: 'Leadership Lessons from Mahabharata for Modern Youth',
    youtubeId: 'p6C4Yl5K0X8',
    thumbnail: 'https://img.youtube.com/vi/p6C4Yl5K0X8/hqdefault.jpg',
    category: 'Mahabharata Leadership'
  },
  {
    id: 'vid4',
    title: 'Understanding the Confluence of Science and Spirituality',
    youtubeId: 'p6C4Yl5K0X8', // Placeholder YouTube ID
    thumbnail: 'https://img.youtube.com/vi/p6C4Yl5K0X8/hqdefault.jpg',
    category: 'Vedic Science'
  },
  {
    id: 'vid5',
    title: 'Essence of Gita Series - Introduction to Chapter 1',
    youtubeId: '3H2h-q1X8Z4', // Placeholder YouTube ID
    thumbnail: 'https://img.youtube.com/vi/3H2h-q1X8Z4/hqdefault.jpg',
    category: 'Bhagavad Gita'
  }
];

export default function MediaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);

  const filteredVideos = VIDEOS_COLLECTION.filter(vid =>
    vid.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <span style={styles.heroTag}>🎥 Lectures & Talks</span>
          <h1 style={styles.heroTitle}>Media Library</h1>
          <p style={styles.heroSubtitle}>Explore logic-based audio-visual content delivered by Radheshyam Das.</p>
          
          <div style={styles.searchBox}>
            <Search size={18} color="#9CA3AF" />
            <input 
              type="text" 
              placeholder="Search lectures..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.breadcrumbRow}>
          <Link href="/" style={styles.backLink}>
            <Home size={14} /> Back to Home
          </Link>
          <span style={styles.countText}>{filteredVideos.length} Lectures found</span>
        </div>

        <div style={styles.videoGrid}>
          {filteredVideos.map((vid) => (
            <div key={vid.id} style={styles.videoCard}>
              <div style={styles.videoCover}>
                <img src={vid.thumbnail} alt={vid.title} style={styles.videoImg} />
                <button onClick={() => setActiveVideo(vid.youtubeId)} style={styles.playBtnCircle}>
                  <Play size={20} fill="#FFF" color="#FFF" />
                </button>
              </div>
              <div style={styles.videoCardBody}>
                <span style={styles.categoryBadge}>{vid.category}</span>
                <h3 style={styles.videoTitle}>{vid.title}</h3>
                <button onClick={() => setActiveVideo(vid.youtubeId)} style={styles.watchLink}>
                  Play Video <Volume2 size={12} style={{ marginLeft: '4px' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeVideo && (
        <div style={styles.modalOverlay} onClick={() => setActiveVideo(null)}>
          <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setActiveVideo(null)} style={styles.modalCloseBtn}>
              <X size={20} />
            </button>
            <div style={styles.iframeWrapper}>
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                title="YouTube Video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={styles.iframe}
              />
            </div>
          </div>
        </div>
      )}

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
    marginBottom: '28px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    background: '#FFF',
    borderRadius: '12px',
    padding: '12px 18px',
    maxWidth: '400px',
    margin: '0 auto',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  searchInput: {
    border: 'none',
    width: '100%',
    marginLeft: '10px',
    fontSize: '14px',
    outline: 'none',
  },
  container: {
    maxWidth: '1200px',
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
  countText: {
    fontSize: '13px',
    color: '#6B7280',
  },
  videoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '28px',
  },
  videoCard: {
    background: '#FFF',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(26,27,75,0.06)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
  },
  videoCover: {
    position: 'relative',
    height: '190px',
    background: '#000',
  },
  videoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: '0.85',
  },
  playBtnCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '54px',
    height: '54px',
    borderRadius: '50%',
    background: '#FF9F1C',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  videoCardBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  categoryBadge: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#FF9F1C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  videoTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1A1B4B',
    lineHeight: '1.4',
    marginBottom: '12px',
    flex: 1,
  },
  watchLink: {
    background: 'none',
    border: 'none',
    color: '#FF9F1C',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'inline-flex',
    alignItems: 'center',
  },

  // Modal Video Lightbox
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px',
  },
  modalContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '800px',
    background: '#000',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: '-40px',
    right: '0',
    background: 'none',
    border: 'none',
    color: '#FFF',
    cursor: 'pointer',
    fontSize: '16px',
  },
  iframeWrapper: {
    position: 'relative',
    paddingBottom: '56.25%',
    height: 0,
  },
  iframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  }
};
