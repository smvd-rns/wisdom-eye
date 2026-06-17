'use client';

import { useState, useEffect } from 'react';
import { Layers, CheckCircle, XCircle, Clock, AlertTriangle, ShieldCheck, Loader2, Trash2 } from 'lucide-react';

export default function SuperadminPage() {
  const [requests, setRequests] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successCreds, setSuccessCreds] = useState(null);
  const [deleteOrg, setDeleteOrg] = useState(null); // stores { id, name } or null
  const [routingMode, setRoutingMode] = useState('simulation');

  const fetchTab = async (type) => {
    try {
      const res = await fetch(`/api/admin/organizations?type=${type}`);
      if (res.ok) {
        const data = await res.json();
        if (data.routingMode) {
          setRoutingMode(data.routingMode);
        }
        if (type === 'requests') {
          setRequests(data.requests || []);
        } else {
          setOrganizations(data.organizations || []);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRoutingMode = async (mode) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_routing_mode', routingMode: mode })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to update routing mode.');
      } else {
        setRoutingMode(mode);
        await Promise.all([
          fetchTab('requests'),
          fetchTab('active')
        ]);
      }
    } catch (err) {
      setErrorMessage('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchTab('requests'),
        fetchTab('active')
      ]);
      setLoading(false);
    };
    init();
  }, []);

  const handleAction = async (requestId, action) => {
    setProcessingId(requestId);
    setErrorMessage('');
    setSuccessCreds(null);
    try {
      const res = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to complete action');
      } else {
        if (action === 'approve') {
          setSuccessCreds(data.credentials);
        }
        await Promise.all([
          fetchTab('requests'),
          fetchTab('active')
        ]);
      }
    } catch (err) {
      setErrorMessage('Network error occurred.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteClick = (orgId, orgName) => {
    setDeleteOrg({ id: orgId, name: orgName });
  };

  const confirmDelete = async () => {
    if (!deleteOrg) return;
    const { id: orgId } = deleteOrg;
    setDeleteOrg(null);
    setProcessingId(orgId);
    setErrorMessage('');
    setSuccessCreds(null);
    try {
      const res = await fetch(`/api/admin/organizations?id=${orgId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to delete organization');
      } else {
        await Promise.all([
          fetchTab('requests'),
          fetchTab('active')
        ]);
      }
    } catch (err) {
      setErrorMessage('Network error occurred.');
    } finally {
      setProcessingId(null);
    }
  };

  const getOrgUrl = (org) => {
    if (routingMode === 'simulation') {
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const base = isLocal ? `http://${window.location.host}` : 'https://wisdom-eye.vercel.app';
      return `${base}/login?tenant=${org.slug}`;
    } else {
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      if (isLocal) {
        return `http://${org.slug}.localhost:3000/login`;
      }
      return `https://${org.custom_domain || `${org.slug}.wisdom-eye.in`}/login`;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', flexDirection: 'column', gap: '12px' }}>
        <Loader2 size={36} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
        <span style={{ color: '#6B7280', fontSize: '14px' }}>Loading requests & tenants...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <ShieldCheck size={28} color="#FF9F1C" />
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: 0, fontFamily: 'Outfit, sans-serif' }}>Superadmin Settings</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0 0' }}>Manage registered organizations and pending signups.</p>
        </div>
      </div>

      {/* Routing Mode Settings Card */}
      <div style={{
        background: '#FAF9F6',
        borderRadius: '16px',
        border: '1.5px solid #FF9F1C',
        padding: '20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1A1B4B', margin: 0, fontFamily: 'Outfit, sans-serif' }}>Tenant Routing Mode</h3>
          <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Toggle between Vercel Simulation (custom query parameter overrides) and Custom Subdomains.
          </p>
        </div>
        <div style={{ display: 'inline-flex', background: '#E5E7EB', borderRadius: '8px', padding: '4px' }}>
          <button
            onClick={() => handleToggleRoutingMode('simulation')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '12px',
              fontFamily: 'Outfit, sans-serif',
              background: routingMode === 'simulation' ? '#FF9F1C' : 'transparent',
              color: routingMode === 'simulation' ? '#1A1B4B' : '#4B5563',
              transition: 'all 0.15s'
            }}
          >
            Free Vercel Simulation
          </button>
          <button
            onClick={() => handleToggleRoutingMode('custom_domain')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '12px',
              fontFamily: 'Outfit, sans-serif',
              background: routingMode === 'custom_domain' ? '#FF9F1C' : 'transparent',
              color: routingMode === 'custom_domain' ? '#1A1B4B' : '#4B5563',
              transition: 'all 0.15s'
            }}
          >
            Custom Subdomain
          </button>
        </div>
      </div>

      {errorMessage && (
        <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', color: '#B91C1C', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
          {errorMessage}
        </div>
      )}

      {successCreds && (
        <div style={{ background: '#ECFDF5', border: '1px solid #10B981', color: '#065F46', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 8px 0' }}>Tenant Created & Activated Successfully!</h3>
          <p style={{ fontSize: '13px', margin: '0 0 12px 0' }}>The login details have been automatically emailed to the new organization admin (<strong>{successCreds.email}</strong>).</p>
          <div style={{ background: 'rgba(255,255,255,0.7)', padding: '10px', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace' }}>
            <div><strong>Login URL:</strong> <a href={successCreds.loginUrl} target="_blank" style={{ color: '#FF9F1C', fontWeight: 'bold', textDecoration: 'underline' }}>{successCreds.loginUrl}</a></div>
            <div><strong>Admin Email:</strong> {successCreds.email}</div>
            <div><strong>Temporary Password:</strong> {successCreds.password} (Emailed)</div>
          </div>
        </div>
      )}

      {/* Grid: Left - Requests, Right - Orgs */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '28px' }}>
        
        {/* Pending Requests */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 20px 0', fontFamily: 'Outfit, sans-serif', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
            Pending Tenant Requests ({requests.filter(r => r.status === 'pending').length})
          </h2>

          {requests.filter(r => r.status === 'pending').length === 0 ? (
            <p style={{ color: '#9CA3AF', fontSize: '14px', textAlign: 'center', margin: '40px 0' }}>No pending tenant signup requests found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {requests.filter(r => r.status === 'pending').map(req => (
                <div key={req.id} style={{ border: '1.5px solid #F3F4F6', borderRadius: '12px', padding: '16px', background: req.status === 'pending' ? '#FAF8F5' : '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1A1B4B', margin: 0 }}>{req.org_name}</h3>
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>Desired Subdomain: <strong>{req.subdomain_slug}.wisdom-eye.in</strong></span>
                    </div>
                    <span style={{
                      fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                      background: req.status === 'pending' ? '#FEF3C7' : req.status === 'approved' ? '#D1FAE5' : '#FEE2E2',
                      color: req.status === 'pending' ? '#D97706' : req.status === 'approved' ? '#065F46' : '#B91C1C'
                    }}>
                      {req.status === 'pending' ? <Clock size={11} /> : req.status === 'approved' ? <CheckCircle size={11} /> : <XCircle size={11} />}
                      {req.status}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#4B5563', marginBottom: '12px' }}>
                    <div><strong>Admin:</strong> {req.admin_name}</div>
                    <div><strong>Email:</strong> {req.admin_email}</div>
                    <div><strong>Phone:</strong> {req.admin_phone || '—'}</div>
                    <div><strong>Size:</strong> {req.estimated_students || '—'} students</div>
                  </div>

                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                      <button 
                        onClick={() => handleAction(req.id, 'approve')}
                        disabled={processingId === req.id}
                        style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {processingId === req.id ? 'Approving...' : 'Approve & Activate'}
                      </button>
                      <button 
                        onClick={() => handleAction(req.id, 'reject')}
                        disabled={processingId === req.id}
                        style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Existing Organizations */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 20px 0', fontFamily: 'Outfit, sans-serif', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
            Active Organizations ({organizations.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {organizations.map(org => (
              <div key={org.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(26,27,75,0.05)', display: 'flex', alignItems: 'center', justifyContents: 'center', flexShrink: 0, fontWeight: '800', color: '#1A1B4B', fontSize: '14px', justifyContent: 'center' }}>
                  {org.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{org.name}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                    Link: <a href={getOrgUrl(org)} target="_blank" style={{ color: '#FF9F1C', textDecoration: 'underline', fontWeight: '600' }}>{getOrgUrl(org)}</a>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: org.primary_color }} title="Primary Theme Color" />
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: org.secondary_color }} title="Secondary Theme Color" />
                  </div>
                  <button
                    onClick={() => handleDeleteClick(org.id, org.name)}
                    disabled={processingId === org.id}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#EF4444', transition: 'color 0.2s' }}
                    title="Delete Organization"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteOrg && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.3)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '440px',
            padding: '32px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #E2E8F0',
            textAlign: 'center',
            animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              color: '#EF4444'
            }}>
              <AlertTriangle size={28} />
            </div>

            <h3 style={{
              fontSize: '20px',
              fontWeight: '800',
              color: '#1E293B',
              margin: '0 0 12px 0',
              fontFamily: 'Outfit, sans-serif'
            }}>
              Delete Organization?
            </h3>

            <p style={{
              fontSize: '14px',
              color: '#64748B',
              lineHeight: '1.6',
              margin: '0 0 28px 0'
            }}>
              Are you sure you want to delete <strong style={{ color: '#0F172A' }}>"{deleteOrg.name}"</strong>? 
              This will permanently delete the organization and all its user accounts. This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteOrg(null)}
                style={{
                  flex: 1,
                  background: '#F1F5F9',
                  color: '#475569',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  background: '#EF4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                }}
              >
                Delete Permanently
              </button>
            </div>
          </div>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleIn {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
