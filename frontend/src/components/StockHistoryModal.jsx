import React, { useEffect, useState } from 'react';
import { X, History, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export const StockHistoryModal = ({ isOpen, onClose, product }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      setLoading(true);
      api
        .getProductById(product._id)
        .then((res) => {
          setHistory(res.stockHistory || []);
        })
        .catch((err) => {
          console.error('Failed to fetch history:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="#818cf8" />
            <div>
              <h3 className="modal-title">Inventory Audit Trail</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {product.name} ({product.sku})
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              Loading audit transactions...
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No recorded stock history found for this SKU.
            </div>
          ) : (
            <div>
              {history.map((log) => {
                const isPositive = log.quantityDelta > 0;
                return (
                  <div
                    key={log._id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            background:
                              log.action === 'INITIAL'
                                ? 'rgba(14, 165, 233, 0.2)'
                                : isPositive
                                ? 'var(--success-bg)'
                                : 'var(--danger-bg)',
                            color:
                              log.action === 'INITIAL'
                                ? '#38bdf8'
                                : isPositive
                                ? '#34d399'
                                : '#f87171',
                          }}
                        >
                          {log.action}
                        </span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{log.reason}</span>
                      </div>
                      <span
                        style={{
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          fontSize: '1rem',
                          color: isPositive ? '#34d399' : '#f87171',
                        }}
                      >
                        {isPositive ? `+${log.quantityDelta}` : log.quantityDelta}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.775rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Count changed:</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                          {log.previousQuantity}
                        </span>
                        <ArrowRight size={12} />
                        <span style={{ color: '#34d399', fontWeight: 700 }}>{log.newQuantity}</span>
                      </div>
                      <div>
                        {log.performedBy} • {new Date(log.createdAt).toLocaleString()}
                      </div>
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

