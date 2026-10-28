import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthView } from './components/AuthView';
import { DashboardOverview } from './components/DashboardOverview';
import { ProductTable } from './components/ProductTable';
import { ProductModal } from './components/ProductModal';
import { StockAdjustModal } from './components/StockAdjustModal';
import { StockHistoryModal } from './components/StockHistoryModal';
import { OrgSettingsModal } from './components/OrgSettingsModal';
import { api } from './services/api';
import { History, Download, RefreshCw, CheckCircle2 } from 'lucide-react';

function MainApp() {
  const { isAuthenticated, loading: authLoading, organization } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dashboard Stats
  const [dashboardData, setDashboardData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Products Table State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [summary, setSummary] = useState(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [historyProduct, setHistoryProduct] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  // Fetch Dashboard Stats
  const loadDashboardStats = useCallback(async () => {
    if (!isAuthenticated) return;
    setStatsLoading(true);
    try {
      const data = await api.getDashboardStats();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch Products
  const loadProducts = useCallback(async () => {
    if (!isAuthenticated) return;
    setProductsLoading(true);
    try {
      const data = await api.getProducts({
        search: searchTerm,
        status: statusFilter,
        sortBy,
        sortOrder,
      });
      setProducts(data.products || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setProductsLoading(false);
    }
  }, [isAuthenticated, searchTerm, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardStats();
      loadProducts();
    }
  }, [isAuthenticated, loadDashboardStats, loadProducts]);

  // Refresh data after any mutation
  const refreshAll = () => {
    loadDashboardStats();
    loadProducts();
  };

  // Create Product
  const handleCreateProduct = async (productData) => {
    try {
      const res = await api.createProduct(productData);
      showToast(`Product "${res.product.name}" created successfully!`);
      refreshAll();
    } catch (err) {
      alert(err.message || 'Failed to create product');
    }
  };

  // Edit Product
  const handleUpdateProduct = async (productData) => {
    if (!editingProduct) return;
    try {
      const res = await api.updateProduct(editingProduct._id, productData);
      showToast(`Product "${res.product.name}" updated successfully!`);
      setEditingProduct(null);
      refreshAll();
    } catch (err) {
      alert(err.message || 'Failed to update product');
    }
  };

  // Adjust Stock
  const handleAdjustStock = async (productId, adjustment) => {
    try {
      const res = await api.adjustStock(productId, adjustment);
      showToast(`Stock updated! New count: ${res.product.quantityOnHand} units.`);
      setAdjustingProduct(null);
      refreshAll();
    } catch (err) {
      alert(err.message || 'Failed to adjust stock');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete product "${product.name}" (SKU: ${product.sku})? This will also remove its stock history.`
    );
    if (!confirmed) return;

    try {
      await api.deleteProduct(product._id);
      showToast(`Product "${product.name}" deleted.`);
      refreshAll();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  // Export CSV Functionality
  const handleExportCsv = async () => {
    try {
      const data = await api.getProducts({ limit: 1000 });
      const items = data.products || [];
      if (items.length === 0) {
        alert('No products available to export.');
        return;
      }

      const headers = ['SKU', 'Product Name', 'Quantity On Hand', 'Min Threshold', 'Cost Price', 'Selling Price', 'Valuation', 'Status', 'Last Updated By'];
      const rows = items.map((p) => [
        `"${p.sku}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        p.quantityOnHand,
        p.effectiveThreshold,
        p.costPrice,
        p.sellingPrice,
        (p.quantityOnHand * p.costPrice).toFixed(2),
        p.status,
        `"${p.lastUpdatedBy || 'System'}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `StockFlow_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Inventory CSV exported successfully!');
    } catch (err) {
      console.error('Failed to export CSV:', err);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-main)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading StockFlow...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Floating Success Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 999,
            background: '#10b981',
            color: '#064e3b',
            fontWeight: 700,
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'slideUp 0.2s ease',
          }}
        >
          <CheckCircle2 size={18} color="#064e3b" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            stats={dashboardData?.stats}
            lowStockAlerts={dashboardData?.lowStockAlerts}
            topValueProducts={dashboardData?.topValueProducts}
            recentActivity={dashboardData?.recentActivity}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenAdjustModal={(prod) => setAdjustingProduct(prod)}
            onNavigateToLowStock={() => {
              setStatusFilter('low');
              setActiveTab('inventory');
            }}
            onExportCsv={handleExportCsv}
          />
        )}

        {activeTab === 'inventory' && (
          <ProductTable
            products={products}
            loading={productsLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            summary={summary}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenEditModal={(prod) => setEditingProduct(prod)}
            onOpenAdjustModal={(prod) => setAdjustingProduct(prod)}
            onOpenHistoryModal={(prod) => setHistoryProduct(prod)}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {activeTab === 'activity' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">Warehouse Inventory Audit Trail</h2>
                <p className="section-desc">
                  Chronological record of all stock adjustments, receipts, dispatches, and initial intakes
                </p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={refreshAll}>
                <RefreshCw size={14} />
                <span>Refresh Activity</span>
              </button>
            </div>

            <div className="table-card" style={{ padding: '24px' }}>
              {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
                <div>
                  {dashboardData.recentActivity.map((log) => {
                    const isPositive = log.quantityDelta > 0;
                    return (
                      <div key={log._id} className="timeline-item">
                        <div
                          className="timeline-dot"
                          style={{
                            background:
                              log.action === 'INITIAL'
                                ? '#38bdf8'
                                : isPositive
                                ? '#10b981'
                                : '#ef4444',
                          }}
                        ></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <div>
                              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{log.productName}</span>
                              <span className="product-sku" style={{ marginLeft: '8px' }}>
                                {log.sku}
                              </span>
                            </div>
                            <span
                              style={{
                                fontWeight: 800,
                                fontFamily: 'var(--font-mono)',
                                color: isPositive ? '#34d399' : '#f87171',
                                fontSize: '1.05rem',
                              }}
                            >
                              {isPositive ? `+${log.quantityDelta}` : log.quantityDelta}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.825rem', color: '#cbd5e1', marginTop: '4px' }}>
                            Reason: {log.reason || log.action}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Previous count: {log.previousQuantity} → New count: {log.newQuantity} units • Recorded on{' '}
                            {new Date(log.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <History size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
                  <p>No recorded activity transactions.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Add Product Modal */}
      <ProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateProduct}
        orgDefaultThreshold={organization?.defaultLowStockThreshold ?? 5}
      />

      {/* Edit Product Modal */}
      <ProductModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSubmit={handleUpdateProduct}
        initialData={editingProduct}
        orgDefaultThreshold={organization?.defaultLowStockThreshold ?? 5}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustModal
        isOpen={!!adjustingProduct}
        onClose={() => setAdjustingProduct(null)}
        product={adjustingProduct}
        onAdjustStock={handleAdjustStock}
      />

      {/* Stock History Modal */}
      <StockHistoryModal
        isOpen={!!historyProduct}
        onClose={() => setHistoryProduct(null)}
        product={historyProduct}
      />

      {/* Organization Settings Modal */}
      <OrgSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsUpdated={refreshAll}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
