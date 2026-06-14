'use client';

import { useState } from 'react';
import { ExternalLink, Home, Search, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const VOICE_BOOKS = [
  {
    id: 1,
    title: 'The Happiness Paradox (SS Series - Book 1)',
    price: '₹170.00',
    url: 'https://voicepublication.in/products/the-happiness-paradox',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/TheHappinessParadox-cover.jpg?v=1780304890'
  },
  {
    id: 2,
    title: 'GAME (Course 4) - Rekindle Wisdom Revive Love',
    price: '₹250.00',
    url: 'https://voicepublication.in/products/new-launch-offer',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/Game-PT-4-front.jpg?v=1772457645'
  },
  {
    id: 3,
    title: 'Decoding the Self (CC Series - Book 1)',
    price: '₹200.00',
    url: 'https://voicepublication.in/products/decoding-the-self',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/TCCDecodingtheself-cover.jpg?v=1780305591'
  },
  {
    id: 4,
    title: 'Your Secret Journey',
    price: '₹200.00',
    url: 'https://voicepublication.in/products/your-secret-journey',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/YSJ-front.jpg?v=1764746566'
  },
  {
    id: 5,
    title: 'Your Best Friend',
    price: '₹280.00',
    url: 'https://voicepublication.in/products/your-best-friend',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/YourBestFriend-front.jpg?v=1764746523'
  },
  {
    id: 6,
    title: 'Wisdom Eye (Course 1) - Laying the Foundation for Success',
    price: '₹150.00',
    originalPrice: '₹200.00',
    url: 'https://voicepublication.in/products/wisdom-eye',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/WisdomEye-cover.jpg?v=1780304483'
  },
  {
    id: 7,
    title: 'Victory Over Death',
    price: '₹220.00',
    url: 'https://voicepublication.in/products/victory-over-death',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/VOD-front.jpg?v=1764745699'
  },
  {
    id: 8,
    title: 'Stress Management',
    price: '₹70.00',
    url: 'https://voicepublication.in/products/stress-management',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/StressManagement-front.jpg?v=1764743972'
  },
  {
    id: 9,
    title: 'Practical Tips to Mind Control',
    price: '₹30.00',
    url: 'https://voicepublication.in/products/practical-tips-to-mind-control',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/PTMC-front.jpg?v=1764743194'
  },
  {
    id: 10,
    title: 'Misdirected Love',
    price: '₹30.00',
    url: 'https://voicepublication.in/products/misdirected-love',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/MisdirectedLove-front_09d3c501-35e2-4823-8431-876cd7d69d87.jpg?v=1768414853'
  },
  {
    id: 11,
    title: 'How to Harness Mind Power',
    price: '₹30.00',
    url: 'https://voicepublication.in/products/how-to-harness-mind-power',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/HHMP-front.jpg?v=1764742364'
  },
  {
    id: 12,
    title: 'GAME Positive Thinker (Course 1, 2, 4 & 6)',
    price: '₹120.00 - ₹280.00',
    url: 'https://voicepublication.in/products/game-positive-thinker-course-1-2-6',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/GAME-PT-12.png?v=1764741397'
  },
  {
    id: 13,
    title: 'Essence of Bhagavad Gita (Hindi/Marathi)',
    price: '₹450.00',
    url: 'https://voicepublication.in/products/essence-of-bhagavad-gita',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/EBG_Hindi-front.jpg?v=1768401999'
  },
  {
    id: 14,
    title: 'Discover Yourself',
    price: '₹160.00',
    url: 'https://voicepublication.in/products/discover-yourself',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/DYS-front.jpg?v=1764332893'
  },
  {
    id: 15,
    title: 'Can I Live Forever',
    price: '₹30.00',
    url: 'https://voicepublication.in/products/can-i-live-forever',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/CILF-front.jpg?v=1764332114'
  },
  {
    id: 16,
    title: 'Art of Smart Work',
    price: '₹70.00',
    url: 'https://voicepublication.in/products/art-of-smart-work',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/ArtofSmartWork-Front.jpg?v=1756533599'
  },
  {
    id: 17,
    title: '12 Tips to Convert Stress Into Smile',
    price: '₹70.00',
    url: 'https://voicepublication.in/products/12-tips-to-convert-stress-into-smile',
    image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/12Tips-Front.jpg?v=1756532498'
  }
];

export default function BooksPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = VOICE_BOOKS.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <span style={styles.heroTag}>📚 Books Store</span>
          <h1 style={styles.heroTitle}>VOICE Publications</h1>
          <p style={styles.heroSubtitle}>Explore transformative literature authored by Radheshyam Das.</p>
          
          <div style={styles.searchBox}>
            <Search size={18} color="#9CA3AF" />
            <input 
              type="text" 
              placeholder="Search books..." 
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
          <span style={styles.countText}>{filteredBooks.length} Books found</span>
        </div>

        {filteredBooks.length === 0 ? (
          <div style={styles.emptyState}>
            <BookOpen size={48} color="#9CA3AF" style={{ marginBottom: '16px' }} />
            <h3>No books found matching "{searchQuery}"</h3>
            <p>Try searching for other keywords.</p>
          </div>
        ) : (
          <div style={styles.booksGrid}>
            {filteredBooks.map((book) => (
              <div key={book.id} style={styles.bookCard}>
                <div style={styles.bookImgWrapper}>
                  <img src={book.image} alt={book.title} style={styles.bookImage} />
                  {book.originalPrice && (
                    <span style={styles.saleBadge}>Discount</span>
                  )}
                </div>
                <div style={styles.bookDetails}>
                  <h3 style={styles.bookTitle}>{book.title}</h3>
                  <div style={styles.bookPriceBlock}>
                    <span style={styles.bookPrice}>{book.price}</span>
                    {book.originalPrice && (
                      <span style={styles.bookOrigPrice}>{book.originalPrice}</span>
                    )}
                  </div>
                  <a 
                    href={book.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={styles.buyBtn}
                  >
                    Buy on Store <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
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
  emptyState: {
    textAlign: 'center',
    padding: '80px 0',
  },
  booksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '24px',
  },
  bookCard: {
    background: '#FFF',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid rgba(26,27,75,0.06)',
  },
  bookImgWrapper: {
    position: 'relative',
    height: '220px',
    background: '#FAF8F5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  bookImage: {
    maxHeight: '100%',
    maxWidth: '100%',
    objectFit: 'contain',
  },
  saleBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: '#FF9F1C',
    color: '#FFF',
    fontSize: '10px',
    fontWeight: '800',
    padding: '4px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  bookDetails: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  bookTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1A1B4B',
    marginBottom: '8px',
    lineHeight: '1.35',
    height: '38px',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  bookPriceBlock: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '16px',
  },
  bookPrice: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#1A1B4B',
  },
  bookOrigPrice: {
    fontSize: '12px',
    textDecoration: 'line-through',
    color: '#9CA3AF',
  },
  buyBtn: {
    background: '#FF9F1C',
    color: '#1A1B4B',
    textDecoration: 'none',
    textAlign: 'center',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: 'auto',
  },
};
