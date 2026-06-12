'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserCheck, 
  UserX, 
  Shield, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Filter
} from 'lucide-react';

const ROLES = [
  { value: 'superadmin', label: 'Super Admin', color: '#EF4444', bg: '#FEE2E2' },
  { value: 'admin', label: 'Admin', color: '#F59E0B', bg: '#FEF3C7' },
  { value: 'course_builder', label: 'Course Builder', color: '#3B82F6', bg: '#DBEAFE' },
  { value: 'evaluator', label: 'Evaluator', color: '#8B5CF6', bg: '#F3E8FF' },
  { value: 'student', label: 'Student', color: '#10B981', bg: '#D1FAE5' }
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load registered users and current user session
  const loadUsers = async () => {
    setLoading(true);
    try {
      // Get current logged-in user to prevent editing self
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData.user);
      }

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
    setError('');
    setSuccess('');
    setUpdatingId(userId);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role: newRole }),
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
        setSuccess('Role updated successfully.');
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
    setError('');
    setSuccess('');
    setUpdatingId(userId);

    const nextStatus = !currentStatus;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, is_active: nextStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, is_active: nextStatus } : u));
        setSuccess(`User account has been ${nextStatus ? 'activated' : 'deactivated'}.`);
      } else {
        setError(data.error || 'Failed to toggle status.');
      }
    } catch {
      setError('Connection issue. Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>User Management</h1>
          <p style={styles.subtitle}>View registered accounts, modify permission roles, and toggle access keys.</p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ ...styles.alert, ...styles.alertError }}>
          <AlertCircle size={16} /> <span>{error}</span>
        </div>
      )}
      {success && (
        <div style={{ ...styles.alert, ...styles.alertSuccess }}>
          <CheckCircle size={16} /> <span>{success}</span>
        </div>
      )}

      {/* Filters & Actions Bar */}
      <div style={styles.actionBar}>
        <div style={styles.searchWrap}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterWrap}>
          <Filter size={14} style={{ color: '#6B7280' }} />
          <span style={styles.filterLabel}>Role:</span>
          <select 
            value={roleFilter} 
            onChange={e => setRoleFilter(e.target.value)}
            style={styles.select}
          >
            <option value="All">All Users</option>
            <option value="superadmin">Super Admins</option>
            <option value="admin">Admins</option>
            <option value="course_builder">Course Builders</option>
            <option value="evaluator">Evaluators</option>
            <option value="student">Students</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.loadingBox}>
            <Loader2 size={32} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '12px', color: '#6B7280', fontSize: '14px' }}>Loading accounts directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div style={styles.emptyBox}>
            <Users size={48} style={{ color: '#D1D5DB', marginBottom: '12px' }} />
            <h3>No accounts found</h3>
            <p>Try clearing your search query or role filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email Address</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Joined At</th>
                  <th style={styles.th}>Role / Privileges</th>
                  <th style={styles.th}>Status</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const isSelf = u.user_id === currentUser?.user_id;
                  const dateStr = u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  }) : '—';

                  const roleConfig = ROLES.find(r => r.value === u.role) || { color: '#6B7280', bg: '#F3F4F6' };

                  return (
                    <tr key={u.user_id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: '700', color: '#111827' }}>
                          {u.name} {isSelf && <span style={styles.selfBadge}>You</span>}
                        </div>
                      </td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>{u.phone || '—'}</td>
                      <td style={styles.td}>{dateStr}</td>
                      
                      {/* Role selection dropdown */}
                      <td style={styles.td}>
                        {isSelf ? (
                          <span style={{ 
                            ...styles.roleBadge, 
                            background: roleConfig.bg, 
                            color: roleConfig.color 
                          }}>
                            {roleConfig.label}
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            disabled={updatingId === u.user_id}
                            onChange={e => handleRoleChange(u.user_id, e.target.value)}
                            style={{
                              ...styles.roleSelect,
                              color: roleConfig.color,
                              background: roleConfig.bg,
                              borderColor: roleConfig.color + '30'
                            }}
                          >
                            {ROLES.map(r => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* Active Status Badge */}
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: u.is_active ? '#D1FAE5' : '#FEE2E2',
                          color: u.is_active ? '#065F46' : '#981B1B'
                        }}>
                          {u.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      {/* Activate/Deactivate actions */}
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        {isSelf ? (
                          <span style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'italic' }}>Locked</span>
                        ) : (
                          <button
                            onClick={() => handleStatusToggle(u.user_id, u.is_active)}
                            disabled={updatingId === u.user_id}
                            style={{
                              ...styles.actionBtn,
                              color: u.is_active ? '#EF4444' : '#10B981',
                              background: u.is_active ? '#FEF2F2' : '#ECFDF5',
                              border: '1px solid',
                              borderColor: u.is_active ? '#FCA5A5' : '#6EE7B7'
                            }}
                          >
                            {updatingId === u.user_id ? (
                              <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : u.is_active ? (
                              <><UserX size={12} /> Deactivate</>
                            ) : (
                              <><UserCheck size={12} /> Activate</>
                            )}
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
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    animation: 'fadeIn 0.3s ease',
  },
  header: {
    marginBottom: '28px',
  },
  title: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '22px',
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: '13px',
    color: '#6B7280',
    marginTop: '2px',
  },
  actionBar: {
    background: '#fff',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
    border: '1px solid #E5E7EB',
    flexWrap: 'wrap',
    gap: '12px',
  },
  searchWrap: {
    position: 'relative',
    maxWidth: '320px',
    width: '100%',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9CA3AF',
  },
  searchInput: {
    width: '100%',
    padding: '9px 12px 9px 38px',
    border: '1.5px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  filterWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#4B5563',
  },
  select: {
    padding: '7px 12px',
    borderRadius: '8px',
    border: '1.5px solid #E5E7EB',
    fontSize: '13px',
    background: '#fff',
    fontFamily: 'inherit',
    outline: 'none',
  },
  tableCard: {
    background: '#fff',
    borderRadius: '14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    border: '1px solid #E5E7EB',
    overflow: 'hidden',
  },
  loadingBox: {
    padding: '60px 0',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyBox: {
    padding: '60px 24px',
    textAlign: 'center',
    color: '#6B7280',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    background: '#F9FAFB',
    borderBottom: '1px solid #E5E7EB',
  },
  th: {
    padding: '14px 20px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#4B5563',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #E5E7EB',
    transition: 'background-color 0.15s',
  },
  td: {
    padding: '14px 20px',
    fontSize: '13.5px',
    color: '#4B5563',
    verticalAlign: 'middle',
  },
  selfBadge: {
    background: '#E0F2FE',
    color: '#0369A1',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
    marginLeft: '6px',
  },
  roleBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '6px',
    display: 'inline-block',
  },
  roleSelect: {
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    border: '1px solid',
    outline: 'none',
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '6px',
    display: 'inline-block',
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'inherit',
    transition: 'transform 0.1s',
  },
  alert: {
    padding: '12px 18px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  alertError: {
    background: '#FEF2F2',
    color: '#DC2626',
    border: '1px solid #FCA5A5',
  },
  alertSuccess: {
    background: '#ECFDF5',
    color: '#059669',
    border: '1px solid #A7F3D0',
  },
};
