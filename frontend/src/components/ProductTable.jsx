import React from 'react';
import {
  Search,
  Plus,
  SlidersHorizontal,
  Edit2,
  Trash2,
  History,
  PackageOpen,
  ArrowUpDown,
} from 'lucide-react';

export const ProductTable = ({
  products = [],
  loading = false,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  summary,
  onOpenAddModal,
  onOpenEditModal,
  onOpenAdjustModal,
  onOpenHistoryModal,
  onDeleteProduct,
}) => {
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Product Catalog & Stock Levels</h2>
          <p className="section-desc">
            Keep track of all your products, monitor units on hand, and quickly log stock changes
          </p>
        </div>
        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="controls-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by SKU, product name, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <button
            className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <span>All ({summary?.totalSkus ?? products.length})</span>
          </button>
          <button
            className={`filter-chip ${statusFilter === 'low' ? 'active' : ''}`}
            onClick={() => setStatusFilter('low')}
          >
            <span style={{ color: '#fbbf24' }}>●</span>
            <span>Low Stock ({summary?.lowStockCount ?? 0})</span>
          </button>
          <button
            className={`filter-chip ${statusFilter === 'out' ? 'active' : ''}`}
            onClick={() => setStatusFilter('out')}
          >
            <span style={{ color: '#ef4444' }}>●</span>
            <span>Out of Stock ({summary?.outOfStockCount ?? 0})</span>
          </button>
          <button
            className={`filter-chip ${statusFilter === 'in' ? 'active' : ''}`}
            onClick={() => setStatusFilter('in')}
          >
            <span style={{ color: '#10b981' }}>●</span>
            <span>Healthy Stock ({summary?.inStockCount ?? 0})</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-card">
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>Loading your products...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <PackageOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              No products found
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search keywords or filter.'
                : 'Start tracking inventory by adding your first product.'}
            </p>
            <button className="btn btn-primary btn-sm" onClick={onOpenAddModal}>
              <Plus size={15} />
              <span>Add First Product</span>
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('sku')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>SKU</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>Product Name</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('quantityOnHand')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>Units in Stock</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('costPrice')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>Unit Pricing</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th>Stock Valuation</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const qty = product.quantityOnHand || 0;
                  const thr = product.effectiveThreshold || 5;
                  const cost = product.costPrice || 0;
                  const retail = product.sellingPrice || 0;
                  const valuation = qty * cost;
                  const margin = retail > 0 ? Math.round(((retail - cost) / retail) * 100) : 0;
                  const healthPct = Math.min(100, Math.round((qty / (thr * 2 || 10)) * 100));

                  return (
                    <tr key={product._id}>
                      <td>
                        <span className="product-sku">{product.sku}</span>
                      </td>
                      <td>
                        <div className="product-title">{product.name}</div>
                        {product.description && (
                          <div className="product-desc" title={product.description}>
                            {product.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>{qty} units</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            (alert at {thr})
                          </span>
                        </div>
                        <div className="stock-meter-bg">
                          <div
                            className={`stock-meter-fill ${
                              qty <= 0 ? 'fill-out' : qty <= thr ? 'fill-low' : 'fill-good'
                            }`}
                            style={{ width: `${Math.max(6, healthPct)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{formatCurrency(cost)} cost</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Sell: {formatCurrency(retail)} ({margin}% margin)
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{formatCurrency(valuation)}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            product.status === 'OUT_OF_STOCK'
                              ? 'badge-out-stock'
                              : product.status === 'LOW_STOCK'
                              ? 'badge-low-stock'
                              : 'badge-in-stock'
                          }`}
                        >
                          <span className="badge-dot"></span>
                          <span>
                            {product.status === 'OUT_OF_STOCK'
                              ? 'Out of Stock'
                              : product.status === 'LOW_STOCK'
                              ? 'Low Stock'
                              : 'In Stock'}
                          </span>
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="btn btn-secondary btn-icon"
                            onClick={() => onOpenAdjustModal(product)}
                            title="Adjust Stock Count (+ / - / =)"
                          >
                            <SlidersHorizontal size={14} />
                          </button>
                          <button
                            className="btn btn-outline btn-icon"
                            onClick={() => onOpenHistoryModal(product)}
                            title="Stock History & Adjustments"
                          >
                            <History size={14} />
                          </button>
                          <button
                            className="btn btn-outline btn-icon"
                            onClick={() => onOpenEditModal(product)}
                            title="Edit Product Details"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-icon"
                            onClick={() => onDeleteProduct(product)}
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
