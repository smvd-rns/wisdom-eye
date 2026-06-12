'use client';

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Search, 
  Download, 
  RefreshCw, 
  Truck, 
  Check, 
  X, 
  LogOut, 
  Filter, 
  UserCheck, 
  Loader2, 
  AlertCircle,
  Key,
  ShieldCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(null); // 'admin' or 'viewer'
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard Data State
  const [registrations, setRegistrations] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [shippingFilter, setShippingFilter] = useState('all');

  // Navigation tab state ('registrations' or 'settings')
  const [activeTab, setActiveTab] = useState('registrations');

  // Credentials Setting Form State
  const [passwordForm, setPasswordForm] = useState({
    adminPassword: '',
    viewerPassword: '',
  });
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Shipping Modal State
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);
  const [shippingForm, setShippingForm] = useState({
    shippingStatus: 'pending_shipment',
    courierName: 'speedpost',
    trackingNumber: '',
    customCourierName: '',
    customTrackingUrl: '',
  });
  const [isUpdatingShipping, setIsUpdatingShipping] = useState(false);

  // Graphy Action States
  const [retryingId, setRetryingId] = useState(null);

  // Check session cookie on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/auth');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setRole(data.role);
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setIsCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  // Fetch registrations once logged in
  useEffect(() => {
    if (role) {
      fetchRegistrations();
    }
  }, [role]);

  const fetchRegistrations = async () => {
    setIsLoadingData(true);
    setDataError('');
    try {
      const res = await fetch('/api/admin/registrations');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch registrations.');
      }
      setRegistrations(data.registrations || []);
    } catch (err) {
      setDataError(err.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      setRole(data.role);
      setPassword('');
      setActiveTab('registrations');
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      setRole(null);
      setRegistrations([]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSettingsSuccess('');
    setSettingsError('');
    setIsUpdatingSettings(true);

    // Validate at least one password is being modified
    if (!passwordForm.adminPassword.trim() && !passwordForm.viewerPassword.trim()) {
      setSettingsError('Please fill in at least one password field.');
      setIsUpdatingSettings(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword: passwordForm.adminPassword || null,
          viewerPassword: passwordForm.viewerPassword || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update settings.');
      }

      setSettingsSuccess(data.message);
      setPasswordForm({ adminPassword: '', viewerPassword: '' });
    } catch (err) {
      setSettingsError(err.message);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleRetryGraphy = async (reg) => {
    if (role !== 'admin') return;
    setRetryingId(reg.id);
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'retry_graphy',
          registrationId: reg.id,
        }),
      });
      const data = await res.json();
      
      alert(data.message);
      if (res.ok) {
        setRegistrations(prev => prev.map(item => item.id === reg.id ? data.registration : item));
      }
    } catch (err) {
      alert('Error retrying Graphy enrollment: ' + err.message);
    } finally {
      setRetryingId(null);
    }
  };

  const openShippingModal = (reg) => {
    if (role !== 'admin') return;
    setSelectedReg(reg);

    let courier = 'speedpost';
    let trackNum = '';
    let customCourier = '';
    let customUrl = '';

    if (reg.tracking_id) {
      if (reg.tracking_id.includes(':')) {
        const parts = reg.tracking_id.split(':');
        courier = parts[0];
        const rest = parts.slice(1).join(':');
        if (courier === 'other') {
          if (rest.includes('|')) {
            const p = rest.split('|');
            customCourier = p[0] || '';
            trackNum = p[1] || '';
            customUrl = p[2] || '';
          } else {
            trackNum = rest;
          }
        } else {
          trackNum = rest;
        }
      } else {
        const oldId = reg.tracking_id.toLowerCase();
        if (oldId.includes('dtdc')) courier = 'dtdc';
        else if (oldId.includes('delhivery')) courier = 'delhivery';
        else if (oldId.includes('bluedart')) courier = 'bluedart';
        else if (oldId.includes('amazon')) courier = 'amazon';
        else courier = 'other';
        trackNum = reg.tracking_id;
      }
    }

    setShippingForm({
      shippingStatus: reg.shipping_status || 'pending_shipment',
      courierName: courier,
      trackingNumber: trackNum,
      customCourierName: customCourier,
      customTrackingUrl: customUrl,
    });
    setShippingModalOpen(true);
  };

  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    if (role !== 'admin' || !selectedReg) return;
    setIsUpdatingShipping(true);

    let serializedId = '';
    if (shippingForm.courierName === 'other') {
      serializedId = `other:${(shippingForm.customCourierName || '').trim()}|${(shippingForm.trackingNumber || '').trim()}|${(shippingForm.customTrackingUrl || '').trim()}`;
    } else {
      serializedId = `${shippingForm.courierName}:${shippingForm.trackingNumber.trim()}`;
    }

    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_shipping',
          registrationId: selectedReg.id,
          shippingStatus: shippingForm.shippingStatus,
          trackingId: serializedId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update shipping details.');
      }

      setRegistrations(prev => prev.map(item => item.id === selectedReg.id ? data.registration : item));
      setShippingModalOpen(false);
      setSelectedReg(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUpdatingShipping(false);
    }
  };

  // Export registrations data to CSV
  const handleExportCSV = () => {
    if (registrations.length === 0) return;
    
    const headers = ['ID', 'Date', 'Name', 'Email', 'Mobile', 'Delivery Type', 'Address', 'City', 'State', 'Pincode', 'Paid (₹)', 'Payment Status', 'Graphy Status', 'Shipping Status', 'Tracking ID'];
    const rows = registrations.map(reg => [
      reg.id,
      new Date(reg.created_at).toLocaleString(),
      `"${reg.name.replace(/"/g, '""')}"`,
      reg.email,
      reg.mobile,
      reg.delivery_type,
      `"${(reg.address || '').replace(/"/g, '""')}"`,
      `"${(reg.city || '').replace(/"/g, '""')}"`,
      `"${(reg.state || '').replace(/"/g, '""')}"`,
      reg.pincode || '',
      reg.amount_paid,
      reg.payment_status,
      reg.graphy_status,
      reg.shipping_status,
      reg.tracking_id || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `wisdom_eye_registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats Computations
  const totalCollections = registrations
    .filter(r => r.payment_status === 'paid')
    .reduce((sum, r) => sum + Number(r.amount_paid), 0);
  
  const paidRegistrations = registrations.filter(r => r.payment_status === 'paid');
  const countPickup = paidRegistrations.filter(r => r.delivery_type === 'pickup').length;
  const countDelivery = paidRegistrations.filter(r => r.delivery_type === 'delivery').length;
  const countPendingShip = paidRegistrations.filter(r => r.shipping_status === 'pending_shipment').length;

  // Search and Filtering
  const filteredRegs = registrations.filter(reg => {
    const matchesSearch = 
      reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.mobile.includes(searchQuery);

    const matchesDelivery = 
      deliveryFilter === 'all' || reg.delivery_type === deliveryFilter;

    const matchesShipping = 
      shippingFilter === 'all' || reg.shipping_status === shippingFilter;

    return matchesSearch && matchesDelivery && matchesShipping;
  });

  if (isCheckingSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={40} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // LOGIN SCREEN
  if (!role) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div className="logo-icon" style={{ margin: '0 auto 16px auto', width: '56px', height: '56px', fontSize: '24px' }}>👁</div>
            <h2 style={{ fontSize: '24px', color: 'var(--primary)' }}>Staff Dashboard</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Enter password to access student registers</p>
          </div>

          {loginError && (
            <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: '500' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                placeholder="••••••••"
                required
                disabled={isLoggingIn}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={isLoggingIn}>
              {isLoggingIn ? 'Verifying...' : 'Access Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD SCREEN
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F4F5F8' }}>
      
      {/* Admin Navbar */}
      <header className="admin-header">
        <div className="container admin-navbar" style={{ flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div className="admin-logo">
              <span style={{ fontSize: '24px' }}>👁</span>
              <span>Radheshyam Das - Wisdom Eye Registrations</span>
              <span style={{ fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px', marginLeft: '10px' }}>
                {role === 'admin' ? 'Admin Mode' : 'View Only'}
              </span>
            </div>

            {/* TAB SELECTORS - Visible only to admin role */}
            {role === 'admin' && (
              <div style={{ display: 'flex', gap: '8px', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '16px' }}>
                <button 
                  onClick={() => setActiveTab('registrations')} 
                  style={{
                    padding: '8px 16px', 
                    fontSize: '13px', 
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    backgroundColor: activeTab === 'registrations' ? 'var(--secondary)' : 'transparent',
                    color: activeTab === 'registrations' ? 'var(--primary)' : 'rgba(255,255,255,0.7)',
                    transition: '0.2s'
                  }}
                >
                  Registrations
                </button>
                <button 
                  onClick={() => setActiveTab('settings')} 
                  style={{
                    padding: '8px 16px', 
                    fontSize: '13px', 
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    backgroundColor: activeTab === 'settings' ? 'var(--secondary)' : 'transparent',
                    color: activeTab === 'settings' ? 'var(--primary)' : 'rgba(255,255,255,0.7)',
                    transition: '0.2s'
                  }}
                >
                  Settings
                </button>
              </div>
            )}
          </div>

          <button onClick={handleLogout} className="btn btn-light" style={{ padding: '8px 16px', fontSize: '13px', color: '#c92a3a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LogOut size={14} /> Log Out
          </button>

        </div>
      </header>

      {/* Main Container Content based on Active Tab */}
      <main className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        
        {activeTab === 'registrations' ? (
          <>
            {/* Stats Cards */}
            <div className="admin-stats">
              <div className="admin-stat-card">
                <span className="admin-stat-label">Total collections</span>
                <h3 className="admin-stat-val" style={{ color: '#2E7D32' }}>₹{totalCollections}</h3>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-label">Pickup materials</span>
                <h3 className="admin-stat-val">{countPickup}</h3>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-label">Parcel Shipments</span>
                <h3 className="admin-stat-val">{countDelivery}</h3>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-label">Pending shipments</span>
                <h3 className="admin-stat-val" style={{ color: countPendingShip > 0 ? '#EF6C00' : 'inherit' }}>
                  {countPendingShip}
                </h3>
              </div>
            </div>

            {/* Database Search & Actions Toolbar */}
            <div className="search-filter-bar">
              <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search student name, email, or mobile..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                />
              </div>

              <div className="filter-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                  <Filter size={14} /> Filters:
                </div>
                
                <select 
                  value={deliveryFilter} 
                  onChange={(e) => setDeliveryFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Delivery: All</option>
                  <option value="pickup">Self Pick Up</option>
                  <option value="delivery">Home Delivery</option>
                </select>

                <select 
                  value={shippingFilter} 
                  onChange={(e) => setShippingFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Shipping: All</option>
                  <option value="not_applicable">Not Applicable</option>
                  <option value="pending_shipment">Pending Shipment</option>
                  <option value="shipped">Shipped</option>
                </select>

                <button 
                  onClick={fetchRegistrations} 
                  className="btn btn-light" 
                  style={{ padding: '10px 14px' }} 
                  title="Refresh Data"
                  disabled={isLoadingData}
                >
                  <RefreshCw size={16} className={isLoadingData ? 'animate-spin' : ''} style={{ animation: isLoadingData ? 'spin 1s linear infinite' : 'none' }} />
                </button>

                <button 
                  onClick={handleExportCSV} 
                  className="btn btn-secondary" 
                  style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  disabled={filteredRegs.length === 0}
                >
                  <Download size={16} /> Export CSV
                </button>
              </div>
            </div>

            {/* Error logs */}
            {dataError && (
              <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <AlertCircle size={20} />
                <span>{dataError}</span>
              </div>
            )}

            {/* Table */}
            <div className="admin-table-container">
              {isLoadingData ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Loader2 className="animate-spin" size={36} style={{ margin: '0 auto 12px auto', animation: 'spin 1s linear infinite' }} />
                  <p>Loading registrations data...</p>
                </div>
              ) : filteredRegs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                  No matching registration records found.
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Student Info</th>
                      <th>Delivery Choice</th>
                      <th>Shipping Address</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Graphy LMS</th>
                      <th>Shipping</th>
                      {role === 'admin' && <th style={{ textAlign: 'center' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegs.map((reg) => (
                      <tr key={reg.id}>
                        <td>
                          <div style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                            {new Date(reg.created_at).toLocaleDateString()}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {new Date(reg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{reg.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{reg.email}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{reg.mobile}</div>
                        </td>

                        <td style={{ textTransform: 'capitalize', fontWeight: '500' }}>
                          {reg.delivery_type === 'delivery' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#1565C0' }}>
                              <Truck size={14} /> Parcel
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                              🏠 Pick Up
                            </span>
                          )}
                        </td>

                        <td>
                          {reg.delivery_type === 'delivery' ? (
                            <div style={{ maxWidth: '200px', fontSize: '12px', lineHeight: '1.4' }}>
                              <div>{reg.address}</div>
                              <div style={{ color: 'var(--text-muted)' }}>{reg.city}, {reg.state} - {reg.pincode}</div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>N/A (Self pickup)</span>
                          )}
                        </td>

                        <td style={{ fontWeight: '700' }}>₹{reg.amount_paid}</td>

                        <td>
                          <span className={`badge-status badge-status-${reg.payment_status}`}>
                            {reg.payment_status}
                          </span>
                          {reg.razorpay_payment_id && (
                            <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                              {reg.razorpay_payment_id}
                            </div>
                          )}
                        </td>

                        <td>
                          {reg.graphy_status === 'success' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2E7D32', fontSize: '12px', fontWeight: '600' }}>
                              <UserCheck size={14} /> Enrolled
                            </span>
                          ) : reg.graphy_status === 'failed' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#C62828', fontSize: '12px', fontWeight: '600' }}>
                              <AlertCircle size={14} /> Failed
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Pending</span>
                          )}
                        </td>

                        <td>
                          {reg.delivery_type === 'delivery' ? (
                            <div>
                              <span className={`badge-status badge-status-${reg.shipping_status}`}>
                                {reg.shipping_status === 'pending_shipment' ? 'Pending Ship' : reg.shipping_status}
                              </span>
                              {reg.tracking_id && (
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  {(() => {
                                    if (reg.tracking_id.startsWith('other:')) {
                                      const rest = reg.tracking_id.substring(6);
                                      if (rest.includes('|')) {
                                        const [cName, tNum] = rest.split('|');
                                        return (
                                          <span>
                                            <strong>{cName || 'Other'}</strong>: {tNum}
                                          </span>
                                        );
                                      }
                                      return (
                                        <span>
                                          <strong>Other</strong>: {rest}
                                        </span>
                                      );
                                    }
                                    if (reg.tracking_id.includes(':')) {
                                      const [courier, trackId] = reg.tracking_id.split(':');
                                      return (
                                        <span>
                                          <strong style={{ textTransform: 'uppercase' }}>{courier}</strong>: {trackId}
                                        </span>
                                      );
                                    }
                                    return <span>Track: {reg.tracking_id}</span>;
                                  })()}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Not Applicable</span>
                          )}
                        </td>

                        {role === 'admin' && (
                          <td>
                            <div className="admin-actions" style={{ justifyContent: 'center' }}>
                              {reg.delivery_type === 'delivery' && reg.payment_status === 'paid' && (
                                <button 
                                  onClick={() => openShippingModal(reg)} 
                                  className="action-btn edit" 
                                  title="Update Parcel Shipment Status"
                                >
                                  <Truck size={16} />
                                </button>
                              )}

                              {reg.payment_status === 'paid' && reg.graphy_status !== 'success' && (
                                <button 
                                  onClick={() => handleRetryGraphy(reg)} 
                                  className="action-btn retry" 
                                  title="Retry Graphy Student Enrollment"
                                  disabled={retryingId === reg.id}
                                >
                                  {retryingId === reg.id ? (
                                    <Loader2 className="animate-spin" size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                  ) : (
                                    <RefreshCw size={14} />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          /* SETTINGS TAB PANEL */
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card">
              
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '22px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                  <Key size={22} style={{ color: 'var(--secondary)' }} />
                  Change Access Passwords
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Update the passwords used to log in to this staff dashboard portal. Changes are saved directly to your Supabase settings table.
                </p>
              </div>

              {settingsSuccess && (
                <div style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px', fontWeight: '600' }}>
                  <ShieldCheck size={20} />
                  <span>{settingsSuccess}</span>
                </div>
              )}

              {settingsError && (
                <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px', fontWeight: '500' }}>
                  <AlertCircle size={20} />
                  <span>{settingsError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700' }}>Admin Password</label>
                  <input
                    type="password"
                    name="adminPassword"
                    value={passwordForm.adminPassword}
                    onChange={handlePasswordFormChange}
                    className="form-control"
                    placeholder="Enter new admin password"
                    disabled={isUpdatingSettings}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Grants full access to view, update shipping, and change passwords.
                  </span>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700' }}>Viewer (View-Only) Password</label>
                  <input
                    type="password"
                    name="viewerPassword"
                    value={passwordForm.viewerPassword}
                    onChange={handlePasswordFormChange}
                    className="form-control"
                    placeholder="Enter new viewer password"
                    disabled={isUpdatingSettings}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Grants read-only access to search and check the register. Cannot modify shipping status or change settings.
                  </span>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ alignSelf: 'flex-start', padding: '12px 28px', marginTop: '10px' }}
                  disabled={isUpdatingSettings}
                >
                  {isUpdatingSettings ? 'Saving Settings...' : 'Update Passwords'}
                </button>

              </form>

            </div>
          </div>
        )}

      </main>

      {/* Shipping Update Modal popup */}
      {shippingModalOpen && selectedReg && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ fontSize: '18px' }}>Shipment Updates</h2>
              <button className="modal-close" onClick={() => setShippingModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleShippingSubmit} className="modal-body">
              <div style={{ marginBottom: '16px', fontSize: '13px' }}>
                Updating parcel details for: <strong>{selectedReg.name}</strong>
              </div>

              <div className="form-group">
                <label className="form-label">Postage Status</label>
                <select
                  value={shippingForm.shippingStatus}
                  onChange={(e) => setShippingForm(prev => ({ ...prev, shippingStatus: e.target.value }))}
                  className="form-control"
                >
                  <option value="pending_shipment">Pending Shipment</option>
                  <option value="shipped">Shipped</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Courier Partner</label>
                <select
                  value={shippingForm.courierName}
                  onChange={(e) => setShippingForm(prev => ({ ...prev, courierName: e.target.value }))}
                  className="form-control"
                >
                  <option value="speedpost">Indian Post (Speed Post)</option>
                  <option value="dtdc">DTDC</option>
                  <option value="delhivery">Delhivery</option>
                  <option value="bluedart">Blue Dart</option>
                  <option value="amazon">Amazon Shipping</option>
                  <option value="other">Other / Custom Link</option>
                </select>
              </div>

              {shippingForm.courierName === 'other' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Courier Partner Name</label>
                    <input
                      type="text"
                      value={shippingForm.customCourierName || ''}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, customCourierName: e.target.value }))}
                      className="form-control"
                      placeholder="e.g. Shree Maruti Courier"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tracking Portal URL (Optional)</label>
                    <input
                      type="url"
                      value={shippingForm.customTrackingUrl || ''}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, customTrackingUrl: e.target.value }))}
                      className="form-control"
                      placeholder="e.g. https://www.shreemaruticourier.com"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Tracking ID / Reference Number</label>
                <input
                  type="text"
                  value={shippingForm.trackingNumber}
                  onChange={(e) => setShippingForm(prev => ({ ...prev, trackingNumber: e.target.value }))}
                  className="form-control"
                  placeholder="e.g. 738759347593"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  type="button" 
                  onClick={() => setShippingModalOpen(false)} 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '10px' }}
                  disabled={isUpdatingShipping}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '10px' }}
                  disabled={isUpdatingShipping}
                >
                  {isUpdatingShipping ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
