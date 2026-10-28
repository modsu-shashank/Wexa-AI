import React from 'react';
import {
  Package,
  Layers,
  DollarSign,
  AlertTriangle,
  XCircle,
  Plus,
  ArrowUpRight,
  History,
  CheckCircle2,
  Download,
} from 'lucide-react';

export const DashboardOverview = ({
  stats,
  lowStockAlerts = [],
  topValueProducts = [],
  recentActivity = [],
  onOpenAddModal,
  onOpenAdjustModal,
  onNavigateToLowStock,
  onExportCsv,
}) => {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div>
      {/* Critical Alert if products are low or out of stock */}
      {stats && (stats.lowStockCount > 0 || stats.outOfStockCount > 0) && (
        <div className="alert-banner">
          <div className="alert-content">
            <div className="alert-icon-circle">
              <AlertTriangle size={20} color="#f59e0b" />
            </div>
            <div>
              <div className="alert-title">
                Attention: {stats.outOfStockCount} Out of Stock & {stats.lowStockCount} Low Stock Items
              </div>
              <div className="alert-desc">
                Inventory is below your alert threshold ({stats.orgDefaultThreshold} units default).
              </div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onNavigateToLowStock}>
            <span>View Items</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      )}

      {/* Main KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Products Tracked</span>
            <div className="stat-icon icon-purple">
              <Package size={20} />
            </div>
          </div>
          <div className="stat-value">{stats?.totalSkus ?? 0}</div>
          <div className="stat-subtitle">
            <span style={{ color: '#34d399', fontWeight: 600 }}>{stats?.healthyStockCount ?? 0} healthy</span> stock levels
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Units in Stock</span>
            <div className="stat-icon icon-blue">
              <Layers size={20} />
            </div>
          </div>
          <div className="stat-value">{stats?.totalUnits?.toLocaleString() ?? 0}</div>
          <div className="stat-subtitle">Total physical pieces on hand</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Inventory Valuation</span>
            <div className="stat-icon icon-green">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="stat-value">{formatCurrency(stats?.totalCostValuation)}</div>
          <div className="stat-subtitle">
            Retail: {formatCurrency(stats?.totalRetailValuation)} ({stats?.estimatedProfitMargin}% margin)
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Low Stock Alerts</span>
            <div className="stat-icon icon-amber">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: stats?.lowStockCount > 0 ? '#fbbf24' : 'inherit' }}>
            {stats?.lowStockCount ?? 0}
          </div>
          <div className="stat-subtitle">Below reorder threshold</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Out of Stock</span>
            <div className="stat-icon icon-rose">
              <XCircle size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: stats?.outOfStockCount > 0 ? '#f87171' : 'inherit' }}>
            {stats?.outOfStockCount ?? 0}
          </div>
          <div className="stat-subtitle">Zero units available</div>
        </div>
      </div>

      {/* Actions and Quick Views */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
        {/* Restock Queue */}
        <div className="table-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Priority Restock Queue</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Items that have reached zero or low stock
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={onOpenAddModal}>
              <Plus size={15} />
              <span>Add Product</span>
            </button>
          </div>

          {lowStockAlerts.length === 0 ? (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>All products are well-stocked!</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No items below alert thresholds.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product & SKU</th>
                    <th>Stock Level</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockAlerts.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="product-title" style={{ fontSize: '0.875rem' }}>{item.name}</div>
                        <span className="product-sku">{item.sku}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.quantityOnHand}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {' '}/ {item.effectiveThreshold} min
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${item.quantityOnHand <= 0 ? 'badge-out-stock' : 'badge-low-stock'}`}>
                          <span className="badge-dot"></span>
                          {item.quantityOnHand <= 0 ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onOpenAdjustModal(item)}
                          title="Restock units"
                        >
                          <Plus size={13} />
                          <span>Restock</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live Stock Activity */}
        <div className="table-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Recent Stock Activity</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Recent receipts, dispatches, and count updates
              </p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={onExportCsv}>
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>

          {recentActivity.length === 0 ? (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <History size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
              <p>No recorded stock transactions yet.</p>
            </div>
          ) : (
            <div style={{ maxHeight: '360px', overflowY: 'auto', paddingRight: '6px' }}>
              {recentActivity.map((log) => {
                const isPositive = log.quantityDelta > 0;
                return (
                  <div key={log._id} className="timeline-item">
                    <div
                      className="timeline-dot"
                      style={{
                        background: log.action === 'INITIAL' ? '#38bdf8' : isPositive ? '#10b981' : '#ef4444',
                      }}
                    ></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{log.productName}</span>
                        <span
                          style={{
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            color: isPositive ? '#34d399' : '#f87171',
                            fontSize: '0.85rem',
                          }}
                        >
                          {isPositive ? `+${log.quantityDelta}` : log.quantityDelta}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                        <span>SKU: {log.sku}</span>
                        <span>•</span>
                        <span>{log.reason || log.action}</span>
                      </div>
                      <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '2px' }}>
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Count: {log.previousQuantity} → {log.newQuantity}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
