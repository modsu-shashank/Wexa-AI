import React, { useState, useEffect } from 'react';
import { X, Building2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const OrgSettingsModal = ({ isOpen, onClose, onSettingsUpdated }) => {
  const { organization, updateOrganizationState } = useAuth();
  const [name, setName] = useState('');
  const [threshold, setThreshold] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (organization) {
      setName(organization.name || '');
      setThreshold(organization.defaultLowStockThreshold ?? 5);
    }
    setError('');
    setSuccess('');
  }, [organization, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.updateOrgSettings({
        name: name.trim(),
        defaultLowStockThreshold: Number(threshold) || 5,
      });
      updateOrganizationState(res.organization);
      setSuccess('Settings saved successfully!');
      if (onSettingsUpdated) onSettingsUpdated();
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Failed to update organization settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} color="#818cf8" />
            <h3 className="modal-title">Organization Workspace Settings</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  marginBottom: '18px',
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
                  marginBottom: '18px',
                  fontSize: '0.85rem',
                  color: '#34d399',
                }}
              >
                {success}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Organization Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="form-helper">The primary tenant organization name for all users.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Default Warehouse Low Stock Threshold</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                required
              />
              <div className="form-helper">
                Applied to all products that do not specify a product-specific threshold.
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                fontSize: '0.775rem',
                color: 'var(--text-muted)',
              }}
            >
              <div>Tenant ID: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{organization?.id || organization?._id}</span></div>
              <div style={{ marginTop: '4px' }}>Tenant isolation: SKUs and products are strictly scoped to this organization.</div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

