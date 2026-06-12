'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Loader2, ArrowRight, Truck, UserCheck, AlertCircle, Calendar, CreditCard, Library, Mail } from 'lucide-react';

export default function TrackShipmentPage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [results, setResults] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setResults(null);

    if (!identifier.trim()) {
      setErrorMsg('Please enter your email address or mobile number.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to search tracking details.');
      }

      setResults(data.registrations || []);
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during lookup.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCourierDetails = (serializedTrackingId) => {
    if (!serializedTrackingId) return null;

    let courier = 'other';
    let trackId = serializedTrackingId;

    if (serializedTrackingId.includes(':')) {
      const parts = serializedTrackingId.split(':');
      courier = parts[0];
      trackId = parts.slice(1).join(':');
    }

    let courierName = 'Courier Partner';
    let trackUrl = '';

    switch (courier.toLowerCase()) {
      case 'speedpost':
        courierName = 'Indian Post (Speed Post)';
        trackUrl = 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx';
        break;
      case 'dtdc':
        courierName = 'DTDC';
        trackUrl = `https://www.dtdc.in/tracking/tracking-results.xhtml?trackId=${trackId}`;
        break;
      case 'delhivery':
        courierName = 'Delhivery';
        trackUrl = `https://www.delhivery.com/track/share?status=track&id=${trackId}`;
        break;
      case 'bluedart':
        courierName = 'Blue Dart';
        trackUrl = `https://www.bluedart.com/tracking?trackId=${trackId}`;
        break;
      case 'amazon':
        courierName = 'Amazon Shipping';
        trackUrl = `https://track.amazon.in/?trackingId=${trackId}`;
        break;
      case 'other':
      default:
        if (trackId.includes('|')) {
          const parts = trackId.split('|');
          courierName = parts[0] || 'Courier';
          trackId = parts[1] || '';
          trackUrl = parts[2] || '';
        } else {
          courierName = 'Courier';
          if (trackId.startsWith('http://') || trackId.startsWith('https://')) {
            trackUrl = trackId;
          }
        }
        break;
    }

    return { courierName, trackId, trackUrl };
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-light)' }}>
      
      {/* Navbar Minimalist */}
      <header className="navbar scrolled">
        <div className="container">
          <Link href="/" className="logo">
            <div className="logo-icon">👁</div>
            <span>Wisdom Eye</span>
          </Link>
          <Link href="/" className="btn btn-secondary" style={{ padding: '8px 20px' }}>
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ paddingTop: '140px', paddingBottom: '80px', flex: 1, maxWidth: '700px' }}>
        
        <div style={{ textCenter: 'center', marginBottom: '36px', textAlign: 'center' }}>
          <span className="section-tag">Logistics Tracker</span>
          <h1 style={{ fontSize: '32px', color: 'var(--primary)', marginTop: '8px', marginBottom: '12px' }}>Track Your Order</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '500px', margin: '0 auto' }}>
            Enter your registered email address or mobile number to track your book package shipment and Graphy course access status.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Enter email or mobile (e.g. +91...)"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '44px', paddingRight: '14px', height: '48px' }}
                disabled={loading}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '0 24px', height: '48px', display: 'flex', alignItems: 'center', gap: '8px' }}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <>
                  <Search size={18} /> Search Order
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: '12px 16px', borderRadius: '8px', marginTop: '16px', fontSize: '14px', fontWeight: '500', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Tracking Results Area */}
        {results !== null && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              Search Results ({results.length})
            </h2>

            {results.map((reg) => (
              <div key={reg.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', color: 'var(--primary)', fontWeight: '700' }}>{reg.name}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Email: {reg.email}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <Calendar size={14} /> {formatDate(reg.created_at)}
                  </div>
                </div>

                {/* Status Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  
                  {/* Status 1: Payment */}
                  <div style={{ backgroundColor: 'var(--bg-light)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      <CreditCard size={14} /> Payment
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`badge-status badge-status-${reg.payment_status}`} style={{ textTransform: 'uppercase', fontSize: '11px' }}>
                        {reg.payment_status}
                      </span>
                      <strong style={{ fontSize: '15px' }}>₹{reg.delivery_type === 'delivery' ? '250' : '200'}</strong>
                    </div>
                  </div>

                  {/* Status 2: Graphy access */}
                  <div style={{ backgroundColor: 'var(--bg-light)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      <UserCheck size={14} /> Course Access
                    </div>
                    <div>
                      {reg.graphy_status === 'success' ? (
                        <div style={{ color: '#2E7D32', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ✓ Enrolled Successfully
                        </div>
                      ) : reg.graphy_status === 'failed' ? (
                        <div style={{ color: '#C62828', fontWeight: '700', fontSize: '14px' }}>
                          ⚠ Enrollment Failed
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                          ⚙ Processing Access...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status 3: Shipping */}
                  <div style={{ backgroundColor: 'var(--bg-light)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', gridColumn: 'span 1' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      <Truck size={14} /> Package Shipping
                    </div>
                    <div>
                      {reg.delivery_type === 'pickup' ? (
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>
                          🏠 Self Pick Up (NVCC)
                        </div>
                      ) : (
                        <div>
                          <span className={`badge-status badge-status-${reg.shipping_status}`} style={{ textTransform: 'uppercase', fontSize: '11px' }}>
                            {reg.shipping_status === 'pending_shipment' ? 'Pending dispatch' : reg.shipping_status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Tracking / Collection Actions Box */}
                {reg.payment_status === 'paid' && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {reg.delivery_type === 'delivery' ? (
                      <div>
                        {reg.shipping_status === 'shipped' ? (
                          <div style={{ backgroundColor: '#E3F2FD', border: '1px solid #BBDEFB', padding: '14px 16px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1565C0', fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>
                              <Truck size={16} /> Parcel Dispatched!
                            </div>
                            <p style={{ fontSize: '13px', color: '#0D47A1', lineHeight: '1.4' }}>
                              Your books have been shipped.
                              {reg.tracking_id && (
                                <span style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                                  {(() => {
                                    const details = getCourierDetails(reg.tracking_id);
                                    if (!details) return null;
                                    return (
                                      <>
                                        <span>
                                          Courier: <strong>{details.courierName}</strong>
                                          <br />
                                          Tracking ID: <strong style={{ fontFamily: 'monospace' }}>{details.trackId}</strong>
                                        </span>
                                        {details.trackUrl && (
                                          <a
                                            href={details.trackUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-secondary"
                                            style={{
                                              alignSelf: 'flex-start',
                                              padding: '8px 16px',
                                              fontSize: '12px',
                                              marginTop: '6px',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '6px',
                                              borderRadius: '6px',
                                              backgroundColor: '#FFFFFF',
                                              border: '1px solid #1565C0',
                                              color: '#1565C0',
                                              fontWeight: '700',
                                              width: 'fit-content'
                                            }}
                                          >
                                            Track Consignment Online <ArrowRight size={13} />
                                          </a>
                                        )}
                                      </>
                                    );
                                  })()}
                                </span>
                              )}
                            </p>
                          </div>
                        ) : (
                          <div style={{ backgroundColor: '#FFF3E0', border: '1px solid #FFE0B2', padding: '14px 16px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E65100', fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>
                              ⚙ Preparing Shipment
                            </div>
                            <p style={{ fontSize: '13px', color: '#E65100', lineHeight: '1.4' }}>
                              Our admin team is preparing your package (Bhagavad Gita and Wisdom Eye book). It will be handed over to the courier partner shortly. Check back in 24 hours for tracking details.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ backgroundColor: '#F5F5F5', border: '1px solid #E0E0E0', padding: '14px 16px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>
                          <Library size={16} /> Self Pick Up Ready!
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                          Please visit the **VOICE Office** at ISKCON Pune (NVCC) to pick up your printed study books. Simply show your registered email address or payment confirmation at the counter.
                        </p>
                      </div>
                    )}

                    {/* Direct Go to Course Button if registered successfully */}
                    {reg.graphy_status === 'success' && (
                      <a 
                        href="https://coursesradheshyamdas.ongraphy.com/courses/Wisdom-Eye-689c419d8fb8275d3690dac1" 
                        target="_blank" 
                        className="btn btn-primary"
                        style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '10px 20px', marginTop: '4px' }}
                      >
                        Go Directly to Wisdom Eye Course <ArrowRight size={14} />
                      </a>
                    )}

                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="footer" style={{ padding: '24px 0', marginTop: 'auto' }}>
        <div className="container text-center">
          <p>&copy; {new Date().getFullYear()} Wisdom Eye / VOICE Publication. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
