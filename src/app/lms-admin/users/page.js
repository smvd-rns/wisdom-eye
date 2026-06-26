'use client';

import { useState, useEffect } from 'react';
import {
  Users, Search, UserCheck, UserX, Shield,
  Loader2, AlertCircle, CheckCircle, Filter, RefreshCw
} from 'lucide-react';

const ROLES = [
  { value: 'superadmin', label: 'Super Admin', color: '#DC2626', bg: '#FEE2E2' },
  { value: 'admin',      label: 'Admin',       color: '#D97706', bg: '#FEF3C7' },
  { value: 'course_builder', label: 'Builder', color: '#2563EB', bg: '#DBEAFE' },
  { value: 'evaluator',  label: 'Evaluator',   color: '#7C3AED', bg: '#EDE9FE' },
  { value: 'student',    label: 'Student',     color: '#059669', bg: '#D1FAE5' },
];

const ROLE_ORDER = ['student', 'evaluator', 'course_builder', 'admin', 'superadmin'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load current user once on mount (uses sessionStorage cache from Navbar)
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const cached = sessionStorage.getItem('auth_me');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.authenticated) setCurrentUser(parsed.user);
          return;
        }
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.authenticated) setCurrentUser(meData.user);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadCurrentUser();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter !== 'All') params.set('role', roleFilter);
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        setError('Failed to load users list.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadUsers, 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    setError(''); setSuccess(''); setUpdatingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
        setSuccess('Role updated successfully.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update role.');
      }
    } catch {
      setError('Connection issue. Failed to update role.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    setError(''); setSuccess(''); setUpdatingId(userId);
    const nextStatus = !currentStatus;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, is_active: nextStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, is_active: nextStatus } : u));
        setSuccess(`User ${nextStatus ? 'activated' : 'deactivated'}.`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to toggle status.');
      }
    } catch {
      setError('Connection issue. Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const roleStats = ROLES.map(r => ({
    ...r,
    count: users.filter(u => u.role === r.value).length
  }));

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }} className="users-container">
      {/* Page Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }} className="users-header">
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
            User Management
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '3px' }}>
            {users.length} registered accounts · manage roles and access
          </p>
        </div>
        <button onClick={loadUsers} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #E5E7EB', background: '#fff', fontSize: '12px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Role Stats Pills */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }} className="users-stats">
        {roleStats.map(r => (
          <button
            key={r.value}
            onClick={() => setRoleFilter(roleFilter === r.value ? 'All' : r.value)}
            style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
              cursor: 'pointer', border: `1.5px solid ${r.color}30`,
              background: roleFilter === r.value ? r.bg : '#fff',
              color: r.color, transition: 'all 0.15s'
            }}
          >
            {r.label} · {r.count}
          </button>
        ))}
        {roleFilter !== 'All' && (
          <button onClick={() => setRoleFilter('All')} style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: '1.5px solid #E5E7EB', background: '#fff', color: '#6B7280' }}>
            ✕ Clear Filter
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', fontSize: '13px', marginBottom: '14px' }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}
      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', fontSize: '13px', marginBottom: '14px' }}>
          <CheckCircle size={15} /> {success}
        </div>
      )}

      {/* Table Card */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

        {/* Search Bar */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '360px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={13} style={{ color: '#6B7280' }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#4B5563' }}>Role:</span>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: '7px 10px', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontSize: '12px', background: '#fff', fontFamily: 'inherit', outline: 'none' }}>
              <option value="All">All Users</option>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Loader2 size={32} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#6B7280', fontSize: '13px', margin: 0 }}>Loading accounts directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: '#6B7280' }}>
            <Users size={44} style={{ color: '#D1D5DB', marginBottom: '12px' }} />
            <h3 style={{ margin: '0 0 4px', color: '#374151' }}>No accounts found</h3>
            <p style={{ margin: 0, fontSize: '13px' }}>Try clearing your search query or role filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <th style={TH}>NAME</th>
                  <th style={TH}>EMAIL</th>
                  <th style={TH}>PHONE</th>
                  <th style={TH}>JOINED</th>
                  <th style={TH}>ROLE</th>
                  <th style={TH}>STATUS</th>
                  <th style={{ ...TH, textAlign: 'center', width: '110px' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const isSelf = u.user_id === currentUser?.user_id;
                  const isHigherRole = ROLE_ORDER.indexOf(u.role) > ROLE_ORDER.indexOf(currentUser?.role || 'student');
                  const canEdit = !isSelf && !isHigherRole;
                  const dateStr = u.created_at
                    ? new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—';
                  const roleConfig = ROLES.find(r => r.value === u.role) || { label: u.role, color: '#6B7280', bg: '#F3F4F6' };

                  return (
                    <tr key={u.user_id} style={{ borderBottom: '1px solid #F3F4F6' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                      {/* Name */}
                      <td style={TD}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isSelf ? '#FF9F1C' : '#E5E7EB', color: isSelf ? '#fff' : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', flexShrink: 0 }}>
                            {u.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: '#111827', fontSize: '13px', whiteSpace: 'nowrap' }}>
                              {u.name}
                              {isSelf && <span style={{ marginLeft: '6px', background: '#DBEAFE', color: '#1D4ED8', fontSize: '9px', fontWeight: '800', padding: '2px 5px', borderRadius: '4px' }}>YOU</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ ...TD, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span title={u.email}>{u.email}</span>
                      </td>

                      {/* Phone */}
                      <td style={{ ...TD, whiteSpace: 'nowrap' }}>{u.phone || '—'}</td>

                      {/* Joined */}
                      <td style={{ ...TD, whiteSpace: 'nowrap' }}>{dateStr}</td>

                      {/* Role */}
                      <td style={TD}>
                        {!canEdit ? (
                          <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 9px', borderRadius: '6px', background: roleConfig.bg, color: roleConfig.color, whiteSpace: 'nowrap' }}>
                            {roleConfig.label}
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            disabled={updatingId === u.user_id}
                            onChange={e => handleRoleChange(u.user_id, e.target.value)}
                            style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', border: `1.5px solid ${roleConfig.color}40`, background: roleConfig.bg, color: roleConfig.color, outline: 'none', fontFamily: 'inherit' }}
                          >
                            {ROLES.filter(r => ROLE_ORDER.indexOf(r.value) <= ROLE_ORDER.indexOf(currentUser?.role || 'student')).map(r => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* Status */}
                      <td style={TD}>
                        <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 9px', borderRadius: '6px', background: u.is_active ? '#D1FAE5' : '#FEE2E2', color: u.is_active ? '#065F46' : '#991B1B', whiteSpace: 'nowrap' }}>
                          {u.is_active ? '● Active' : '○ Inactive'}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ ...TD, textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {isSelf || isHigherRole ? (
                          <span style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'italic' }}>Locked</span>
                        ) : updatingId === u.user_id ? (
                          <Loader2 size={14} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <button
                            onClick={() => handleStatusToggle(u.user_id, u.is_active)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              padding: '5px 11px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                              cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s',
                              border: `1px solid ${u.is_active ? '#FCA5A5' : '#6EE7B7'}`,
                              background: u.is_active ? '#FEF2F2' : '#ECFDF5',
                              color: u.is_active ? '#DC2626' : '#059669',
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                          >
                            {u.is_active ? <><UserX size={11} /> Deactivate</> : <><UserCheck size={11} /> Activate</>}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && users.length > 0 && (
          <div style={{ padding: '10px 20px', borderTop: '1px solid #F3F4F6', fontSize: '12px', color: '#9CA3AF', textAlign: 'right' }}>
            Showing {users.length} user{users.length !== 1 ? 's' : ''}
            {roleFilter !== 'All' && ` · filtered by ${ROLES.find(r => r.value === roleFilter)?.label || roleFilter}`}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@700;800&display=swap');

        @media (max-width: 768px) {
          .users-container {
            padding: 16px !important;
          }
          .users-container th,
          .users-container td {
            padding: 8px 10px !important;
          }
          .users-header {
            margin-bottom: 16px !important;
          }
          .users-stats {
            gap: 6px !important;
            margin-bottom: 16px !important;
          }
          .users-stats button {
            padding: 5px 10px !important;
            font-size: 11px !important;
          }
        }
      `}</style>
    </div>
  );
}

const TH = {
  padding: '10px 14px',
  fontSize: '11px',
  fontWeight: '700',
  color: '#6B7280',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
  textAlign: 'left',
};

const TD = {
  padding: '11px 14px',
  fontSize: '13px',
  color: '#4B5563',
  verticalAlign: 'middle',
};
