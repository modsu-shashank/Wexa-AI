import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, AlertCircle, Plus, Minus, Equal } from 'lucide-react';

export const StockAdjustModal = ({ isOpen, onClose, product, onAdjustStock }) => {
  const [type, setType] = useState('ADD');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setType('ADD');
    setAmount('');
    setReason('');
    setError('');
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const currentQty = product.quantityOnHand || 0;
  const numAmount = Math.max(0, parseInt(amount, 10) || 0);

  let newQty = currentQty;
  if (type === 'ADD') {
    newQty = currentQty + numAmount;
  } else if (type === 'REMOVE') {
    newQty = Math.max(0, currentQty - numAmount);
  } else if (type === 'SET') {
    newQty = numAmount;
  }

  const isRemoveTooLarge = type === 'REMOVE' && numAmount > currentQty;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (amount === '' || isNaN(numAmount)) {
      setError('Please specify a valid numeric amount.');
      return;
    }

    if (isRemoveTooLarge) {
      setError(`Cannot remove ${numAmount} units. Maximum available is ${currentQty}.`);
      return;
    }

    setLoading(true);
    try {
      await onAdjustStock(product._id, {
        type,
        amount: numAmount,
        reason: reason.trim() || `Warehouse stock ${type.toLowerCase()}`,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to adjust stock.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={18} color="#818cf8" />
            <h3 className="modal-title">Adjust Stock Level</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Product summary card */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>{product.name}</div>
                  <span className="product-sku" style={{ marginTop: '4px' }}>{product.sku}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Stock</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{currentQty} units</div>
                </div>
              </div>
            </div>

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

            {/* Type selector */}
            <div className="form-group">
              <label className="form-label">Adjustment Mode</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  className={`btn ${type === 'ADD' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setType('ADD')}
                >
                  <Plus size={15} />
                  <span>Receive (+)</span>
                </button>
                <button
                  type="button"
                  className={`btn ${type === 'REMOVE' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setType('REMOVE')}
                >
                  <Minus size={15} />
                  <span>Dispatch (-)</span>
                </button>
                <button
                  type="button"
                  className={`btn ${type === 'SET' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setType('SET')}
                >
                  <Equal size={15} />
                  <span>Audit Set (=)</span>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                {type === 'ADD'
                  ? 'Units to Add to Inventory'
                  : type === 'REMOVE'
                  ? 'Units to Remove from Inventory'
                  : 'New Exact Physical Unit Count'}
              </label>
              <input
                type="number"
                min="0"
                className="form-input"
                placeholder="Enter unit count..."
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Live calculation banner */}
            <div
              style={{
                background: 'rgba(79, 70, 229, 0.1)',
                border: '1px solid rgba(79, 70, 229, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: '#c7d2fe' }}>Resulting Stock on Hand:</span>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: isRemoveTooLarge ? '#f87171' : '#34d399',
                }}
              >
                {newQty} units
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Reason / Reference Note</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. PO #1084 intake, Damaged during transit, Physical count check"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="form-helper">This note will be logged in the immutable audit trail.</div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || isRemoveTooLarge || amount === ''}
            >
              {loading ? 'Updating...' : 'Confirm Stock Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

