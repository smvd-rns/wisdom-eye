'use client';

import { Award, BookCheck, Home, Users } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div style={styles.page}>
      <Navbar />

      <div className="bio-hero-responsive" style={styles.hero}>
        <div style={styles.heroContent}>
          <span style={styles.heroTag}>Biography</span>
          <h1 className="bio-hero-title" style={styles.heroTitle}>Radheshyam Das</h1>
          <p style={styles.heroSubtitle}>IIT Mumbai Topper • Celibate Monk • Global Duty Officer</p>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.breadcrumbRow}>
          <Link href="/" style={styles.backLink}>
            <Home size={14} /> Back to Home
          </Link>
        </div>

        <div className="bio-grid-responsive" style={styles.bioGrid}>
          <div style={styles.bioTextContent}>
            <section className="bio-section-responsive" style={styles.section}>
              <h2 style={styles.sectionHeader}>Early Life and Education</h2>
              <div style={styles.divider} />
              <p style={styles.text}>
                Radheshyam das was born near Madurai, Tamil Nadu, South India, in a devout family where he got regular exposure to Vedic chants. His father was a Professor and Head of the Department of English, who inspired him early on with books by classics such as Shakespeare, Henry David Thoreau, and Charles Dickens, as well as philosophical scriptures like the Bhagavad Gita and Mahabharata.
              </p>
              <p style={styles.text}>
                In high school, his quest for the Absolute Truth led him to study several Bible correspondence courses and explore various spiritual organizations. His search brought him to ISKCON in 1991, where he found ultimate spiritual shelter in the teachings of Srila Prabhupada.
              </p>
              <p style={styles.text}>
                He is an **IIT Mumbai Topper**. After working as a Senior Research Fellow at CECRI and as a Mechanical Engineer at top firms like Thermax and Mather & Platt, he chose to dedicate his life as a celibate monk and youth trainer.
              </p>
            </section>

            <section className="bio-section-responsive" style={styles.section}>
              <h2 style={styles.sectionHeader}>Dedication to ISKCON & Youth Outreach</h2>
              <div style={styles.divider} />
              <p style={styles.text}>
                In 1994, he dedicated his life as a full-time brahmacari at Sri Sri Radha Gopinath Mandir, ISKCON Chowpatty, and was sent to ISKCON Pune in 1995 to start youth preaching under his master, HH Radhanath Swami Maharaja.
              </p>
              <p style={styles.text}>
                In 1997, he was appointed Temple President of ISKCON Pune. In 2000, he started the youth organization BACE, which was later renamed **VOICE (Vedic Oasis for Inspiration Culture and Education)** in 2003. Today, VOICE spans over 150 centers across India and Bangladesh, offering leadership courses based on spiritual intelligence (SQ). He has spent the last 25 years training college students in all leading IITs, NITs, and major universities.
              </p>
            </section>

            <section className="bio-section-responsive" style={styles.section}>
              <h2 style={styles.sectionHeader}>Temple Development & NVCC</h2>
              <div style={styles.divider} />
              <p style={styles.text}>
                In 2012, Radheshyam das embarked on the development of the **New Vedic Cultural Center (NVCC)**, Sri Sri Radha Vrindavanchandra Mandir, and Sri Balaji Mandir on a six-acre land at Katraj Kondhwa, Pune. The landmark center features a guest house, Govindas cafeteria, Bhaktivedanta Model School (BMS), and prasad halls feeding thousands daily.
              </p>
            </section>

            <section className="bio-section-responsive" style={styles.section}>
              <h2 style={styles.sectionHeader}>Global Roles & Training Programs</h2>
              <div style={styles.divider} />
              <p style={styles.text}>
                Radheshyam das serves as Co-President of ISKCON Hyderabad and has graduated from the GBC College, subsequently serving as a **Global Duty Officer (GDO)** for youth outreach. He regularly travels to the USA to visit top universities (including Harvard, MIT, Stanford, and University of Washington) and support mentors.
              </p>
              <p style={styles.text}>
                He has designed the famous **Discover Your Self (DYS)** book, the **GAME (Gita for All Made Easy)** course series, and has conducted corporate seminars at top institutions including Infosys, Deutsche Bank, Cognizant, and Bank of America.
              </p>
            </section>
          </div>

          <div className="bio-visual-responsive" style={styles.bioVisualContent}>
            <div className="bio-card-dec-responsive" style={styles.cardDecoration} />
            <img 
              src="https://gdo.radheshyamdas.com/favicon.png" 
              alt="Radheshyam Das Portrait" 
              style={styles.photo}
            />
            <div style={styles.credentialsBlock}>
              <div style={styles.credItem}>
                <Award size={20} color="#FF9F1C" />
                <div>
                  <h4 style={styles.credTitle}>IIT Bombay</h4>
                  <p style={styles.credDesc}>Distinguished Alumnus & Topper</p>
                </div>
              </div>
              <div style={styles.credItem}>
                <BookCheck size={20} color="#FF9F1C" />
                <div>
                  <h4 style={styles.credTitle}>Creator & Author</h4>
                  <p style={styles.credDesc}>DYS & GAME study models</p>
                </div>
              </div>
              <div style={styles.credItem}>
                <Users size={20} color="#FF9F1C" />
                <div>
                  <h4 style={styles.credTitle}>VOICE Wing</h4>
                  <p style={styles.credDesc}>150+ Spiritual Training Centers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .bio-grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .bio-visual-responsive {
            position: relative !important;
            top: 0 !important;
            margin-bottom: 24px !important;
            order: -1 !important;
            width: 100% !important;
            max-width: 320px !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .bio-card-dec-responsive {
            display: none !important;
          }
        }
        @media (max-width: 600px) {
          .bio-hero-responsive {
            padding: 50px 16px 36px !important;
          }
          .bio-hero-title {
            font-size: 26px !important;
          }
          .bio-section-responsive {
            padding: 20px !important;
          }
        }
      `}</style>
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
    marginBottom: '32px',
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
  bioGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '48px',
    alignItems: 'start',
  },
  bioTextContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  section: {
    background: '#FFF',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
    border: '1px solid rgba(26,27,75,0.04)',
  },
  sectionHeader: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1A1B4B',
    fontFamily: 'Outfit, sans-serif',
  },
  divider: {
    height: '3px',
    width: '50px',
    background: '#FF9F1C',
    margin: '12px 0 20px',
    borderRadius: '2px',
  },
  text: {
    fontSize: '15px',
    lineHeight: '1.65',
    color: '#4B5563',
    marginBottom: '16px',
  },
  bioVisualContent: {
    position: 'sticky',
    top: '120px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cardDecoration: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    right: '20px',
    height: '320px',
    background: '#DA9B5B',
    borderRadius: '16px',
    zIndex: 1,
  },
  photo: {
    position: 'relative',
    width: '100%',
    maxWidth: '280px',
    borderRadius: '16px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
    zIndex: 2,
    marginBottom: '32px',
  },
  credentialsBlock: {
    width: '100%',
    background: '#FFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
    border: '1px solid rgba(26,27,75,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    zIndex: 2,
  },
  credItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  credTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1A1B4B',
  },
  credDesc: {
    fontSize: '12px',
    color: '#6B7280',
  },
};
