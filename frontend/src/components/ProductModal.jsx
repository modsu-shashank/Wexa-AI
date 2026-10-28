import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

export const ProductModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  orgDefaultThreshold = 5,
}) => {
  const isEdit = !!initialData;
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [quantityOnHand, setQuantityOnHand] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSku(initialData.sku || '');
      setDescription(initialData.description || '');
      setCostPrice(initialData.costPrice || 0);
      setSellingPrice(initialData.sellingPrice || 0);
      setLowStockThreshold(
        initialData.lowStockThreshold !== null && initialData.lowStockThreshold !== undefined
          ? initialData.lowStockThreshold
          : ''
      );
    } else {
      setName('');
      setSku('');
      setDescription('');
      setQuantityOnHand(0);
      setCostPrice(0);
      setSellingPrice(0);
      setLowStockThreshold('');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!sku.trim()) {
      setError('SKU is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        description: description.trim(),
        costPrice: Number(costPrice) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        lowStockThreshold: lowStockThreshold !== '' ? Number(lowStockThreshold) : null,
      };

      if (!isEdit) {
        payload.quantityOnHand = Number(quantityOnHand) || 0;
      }

      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Product SKU' : 'Create New Inventory SKU'}</h3>
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

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">SKU (Stock Keeping Unit) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. BCS-2000-HD"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  required
                />
                <div className="form-helper">Unique identifier per organization</div>
              </div>

              {!isEdit ? (
                <div className="form-group">
                  <label className="form-label">Initial Quantity on Hand</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    placeholder="0"
                    value={quantityOnHand}
                    onChange={(e) => setQuantityOnHand(e.target.value)}
                  />
                  <div className="form-helper">Physical units currently in stock</div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Current Stock</label>
                  <input
                    type="text"
                    className="form-input"
                    disabled
                    value={`${initialData.quantityOnHand} units (Use Adjust Stock for counts)`}
                    style={{ opacity: 0.6 }}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Industrial Barcode Scanner 2D"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Specifications, supplier details, model number..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Unit Cost Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="0.00"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                />
                <div className="form-helper">Acquisition or manufacturing cost</div>
              </div>

              <div className="form-group">
                <label className="form-label">Unit Selling Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="0.00"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                />
                <div className="form-helper">Retail or wholesale selling price</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Custom Low Stock Threshold</label>
              <input
                type="number"
                min="0"
                className="form-input"
                placeholder={`Leave blank to use organization default (${orgDefaultThreshold} units)`}
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
              />
              <div className="form-helper">
                Triggers an alert when quantity on hand falls to or below this number.
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

