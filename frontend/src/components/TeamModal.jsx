import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, Shield, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export const TeamModal = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.listUsers();
      setUsers(res.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setError('');
      setSuccess('');
      setNewEmail('');
      setNewPassword('');
      setNewName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setInviting(true);

    try {
      const res = await api.inviteUser({
        email: newEmail.trim(),
        password: newPassword,
        name: newName.trim(),
      });
      setSuccess(res.message || 'Staff member invited successfully!');
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to invite staff user');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#818cf8" />
            <div>
              <h3 className="modal-title">Team & User Roles</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Manage organization access, Admin and Staff roles
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div
              style={{
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                color: '#fca5a5',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              style={{
                background: 'var(--success-bg)',
                border: '1px solid var(--success-border)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                color: '#34d399',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          {/* Invite Staff Form */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              marginBottom: '24px',
            }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserPlus size={16} color="#38bdf8" />
              <span>Invite New Staff Member</span>
            </h4>
            <form onSubmit={handleInvite}>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Jordan Lee"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label">Work Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="jordan@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label">Temporary Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label">Assigned Role</label>
                  <input
                    type="text"
                    className="form-input"
                    value="Staff (Inventory & Adjustments)"
                    disabled
                    style={{ opacity: 0.7 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={inviting}>
                  <UserPlus size={14} />
                  <span>{inviting ? 'Inviting...' : 'Add Staff Account'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Users Table */}
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>
            Current Organization Members ({users.length})
          </h4>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Loading members...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {users.map((u) => {
                const isUAdmin = u.role === 'admin';
                return (
                  <div
                    key={u._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: isUAdmin
                            ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.4), rgba(168, 85, 247, 0.4))'
                            : 'rgba(14, 165, 233, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isUAdmin ? '#c084fc' : '#38bdf8',
                        }}
                      >
                        {isUAdmin ? <Shield size={18} /> : <User size={18} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {u.name || (isUAdmin ? 'Primary Administrator' : 'Staff Member')}
                        </div>
                        <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>

                    <div>
                      <span
                        className="role-badge"
                        style={{
                          background: isUAdmin ? 'rgba(168, 85, 247, 0.15)' : 'rgba(14, 165, 233, 0.15)',
                          color: isUAdmin ? '#c084fc' : '#38bdf8',
                          border: isUAdmin
                            ? '1px solid rgba(168, 85, 247, 0.3)'
                            : '1px solid rgba(14, 165, 233, 0.3)',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {isUAdmin ? <Shield size={12} /> : <User size={12} />}
                        <span>{isUAdmin ? 'Admin' : 'Staff'}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

