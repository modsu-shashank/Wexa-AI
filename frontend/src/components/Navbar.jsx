import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Boxes,
  LayoutDashboard,
  Package,
  History,
  Building2,
  LogOut,
  Settings,
  User,
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, onOpenSettings }) => {
  const { user, organization, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="nav-left">
        <div className="brand-logo">
          <div className="brand-icon-box">
            <Boxes size={22} />
          </div>
          <span>StockFlow</span>
        </div>

        {organization && (
          <div className="tenant-badge" title="Active Workspace">
            <Building2 size={14} />
            <span>{organization.name}</span>
          </div>
        )}

        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Package size={16} />
            <span>Inventory</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <History size={16} />
            <span>Audit Trail</span>
          </button>
        </nav>
      </div>

      <div className="nav-right">
        <div className="user-profile-badge" title={user?.email}>
          <User size={14} color="#94a3b8" />
          <span className="user-email-text">{user?.name || user?.email}</span>
        </div>

        <button
          className="btn btn-outline btn-sm"
          onClick={onOpenSettings}
          title="Store Settings & Low-Stock Alerts"
        >
          <Settings size={15} />
          <span>Settings</span>
        </button>

        <button
          className="btn btn-danger btn-sm"
          onClick={logout}
          title="Sign out of StockFlow"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
