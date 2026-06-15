'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Database, AlertTriangle, CheckCircle2, Copy, Check, ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';

export default function DatabaseSetupPage() {
  const [dbStatus, setDbStatus] = useState(null);
  const [migrations, setMigrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statusRes, migrationsRes] = await Promise.all([
        fetch('/api/admin/database-status'),
        fetch('/api/admin/migrations')
      ]);

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setDbStatus(statusData.status);
      } else {
        setError('Failed to fetch database table statuses.');
      }

      if (migrationsRes.ok) {
        const migrationsData = await migrationsRes.json();
        setMigrations(migrationsData.migrations || []);
      }
    } catch (err) {
      setError('An error occurred while communicating with the server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div style={styles.container}>
      {/* Back button */}
      <Link href="/lms-admin" style={styles.backLink}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div style={styles.header}>
        <div style={styles.titleWrapper}>
          <div style={styles.iconContainer}>
            <Database size={28} color="#FF9F1C" />
          </div>
          <div>
            <h1 style={styles.title}>Database Setup & SQL Migrations</h1>
            <p style={styles.subtitle}>Verify database table connections and manage SQL schema migrations.</p>
          </div>
        </div>
        <button onClick={fetchData} style={styles.refreshBtn}>
          <RefreshCw size={16} /> Refresh Status
        </button>
      </div>

      {error && (
        <div style={styles.alertError}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={styles.loadingWrapper}>
          <RefreshCw size={36} style={styles.spinner} />
          <p style={{ marginTop: '12px', color: '#6B7280', fontWeight: '500' }}>Analyzing database schema...</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {/* Left Column: Table Statuses & Guidelines */}
          <div style={styles.leftCol}>
            {/* Table Status Card */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Schema Table Connection Status</h2>
              <p style={styles.cardDesc}>We checked the Supabase database for the presence of the required system tables:</p>
              
              <div style={styles.statusList}>
                {dbStatus && Object.entries(dbStatus).map(([tableName, table]) => (
                  <div key={tableName} style={styles.statusItem}>
                    <span style={styles.tableName}>
                      <code>{tableName}</code>
                    </span>
                    {table.exists ? (
                      <span style={styles.badgeSuccess}>
                        <CheckCircle2 size={14} style={{ marginRight: '4px' }} /> Connected
                      </span>
                    ) : (
                      <span style={styles.badgeDanger}>
                        <AlertTriangle size={14} style={{ marginRight: '4px' }} /> Missing
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Instruction Card */}
            <div style={styles.instructionCard}>
              <h2 style={{ ...styles.cardTitle, color: '#1A1B4B' }}>How to run SQL Migrations</h2>
              <ol style={styles.stepsList}>
                <li>
                  <strong>Open Supabase:</strong> Log in to your project dashboard on{' '}
                  <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" style={styles.inlineLink}>
                    Supabase Dashboard <ExternalLink size={12} style={{ display: 'inline', marginLeft: '2px' }} />
                  </a>.
                </li>
                <li>
                  <strong>Go to SQL Editor:</strong> Click on the <strong>SQL Editor</strong> tab in the left sidebar navigation.
                </li>
                <li>
                  <strong>Create a Query:</strong> Click on <strong>New query</strong> to open a blank SQL input panel.
                </li>
                <li>
                  <strong>Copy & Run:</strong> Copy the migration script from the panels on the right, paste it into the editor, and click the <strong>Run</strong> button at the bottom-right.
                </li>
                <li>
                  <strong>Verify:</strong> Click the "Refresh Status" button above to verify that the status lights turn green.
                </li>
              </ol>
            </div>
          </div>

          {/* Right Column: SQL Scripts */}
          <div style={styles.rightCol}>
            <h2 style={styles.sectionTitle}>SQL Migration Scripts</h2>
            
            {migrations.map((migration, index) => (
              <div key={migration.name} style={styles.migrationCard}>
                <div style={styles.migrationHeader}>
                  <div>
                    <h3 style={styles.migrationTitle}>{migration.title}</h3>
                    <p style={styles.migrationDesc}>{migration.description}</p>
                  </div>
                  <button 
                    onClick={() => handleCopy(migration.sql, index)} 
                    style={{
                      ...styles.copyBtn,
                      background: copiedIndex === index ? '#10B981' : '#1A1B4B',
                      color: '#fff'
                    }}
                  >
                    {copiedIndex === index ? (
                      <><Check size={14} /> Copied!</>
                    ) : (
                      <><Copy size={14} /> Copy SQL</>
                    )}
                  </button>
                </div>
                <div style={styles.codeContainer}>
                  <pre style={styles.preCode}>
                    <code>{migration.sql}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', fontFamily: 'Inter, sans-serif' },
  backLink: { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B7280', textDecoration: 'none', fontWeight: '600', marginBottom: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #E5E7EB', paddingBottom: '24px', marginBottom: '32px' },
  titleWrapper: { display: 'flex', alignItems: 'center', gap: '16px' },
  iconContainer: { width: '54px', height: '54px', borderRadius: '14px', background: 'rgba(255,159,28,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: '26px', fontWeight: '800', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif', margin: 0 },
  subtitle: { fontSize: '14px', color: '#6B7280', marginTop: '4px' },
  refreshBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: '700', color: '#1A1B4B', cursor: 'pointer', transition: 'border-color 0.15s' },
  alertError: { display: 'flex', alignItems: 'center', gap: '10px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '16px 20px', borderRadius: '10px', marginBottom: '24px', fontWeight: '600', fontSize: '14px' },
  loadingWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0' },
  spinner: { color: '#FF9F1C', animation: 'spin 1s linear infinite' },
  
  grid: { display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '32px', alignItems: 'start' },
  
  // Left Column
  leftCol: { display: 'flex', flexDirection: 'column', gap: '24px' },
  card: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: 'Outfit, sans-serif', marginBottom: '8px' },
  cardDesc: { fontSize: '13px', color: '#6B7280', marginBottom: '20px', lineHeight: 1.5 },
  statusList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  statusItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6' },
  tableName: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  badgeSuccess: { display: 'inline-flex', alignItems: 'center', background: '#DEF7EC', color: '#03543F', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '9999px', textTransform: 'uppercase' },
  badgeDanger: { display: 'inline-flex', alignItems: 'center', background: '#FDE8E8', color: '#9B1C1C', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '9999px', textTransform: 'uppercase' },
  
  instructionCard: { background: '#FFFDF9', border: '1.5px dashed #FF9F1C', borderRadius: '16px', padding: '24px' },
  stepsList: { paddingLeft: '20px', margin: '16px 0 0 0', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px', color: '#4B5563', lineHeight: 1.5 },
  inlineLink: { color: '#FF9F1C', fontWeight: '700', textDecoration: 'none' },

  // Right Column
  rightCol: { display: 'flex', flexDirection: 'column', gap: '28px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#111827', fontFamily: 'Outfit, sans-serif', marginBottom: '4px' },
  migrationCard: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' },
  migrationHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' },
  migrationTitle: { fontSize: '15px', fontWeight: '700', color: '#1A1B4B' },
  migrationDesc: { fontSize: '12px', color: '#6B7280', marginTop: '3px' },
  copyBtn: { display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'background-color 0.2s' },
  codeContainer: { background: '#1E1E2F', borderRadius: '8px', padding: '16px', overflowX: 'auto', border: '1px solid #2D2D44', maxHeight: '350px' },
  preCode: { margin: 0, fontSize: '12.5px', color: '#E0E0FF', fontFamily: 'monospace', lineHeight: 1.5 },
};
