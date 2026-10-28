import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Boxes,
  Sparkles,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Building2,
  Mail,
  User,
  PackageCheck,
  TrendingUp,
  BellRing,
} from 'lucide-react';

export const AuthView = () => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'register') {
        if (!organizationName.trim()) {
          throw new Error('Store or company name is required.');
        }
        await register(organizationName, email, password, name);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setEmail('demo@stockflow.io');
    setPassword('password123');
    setActiveTab('signin');
    setError('');
    setLoading(true);
    try {
      await login('demo@stockflow.io', 'password123');
    } catch (err) {
      setError(err.message || 'Failed to load demo workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Dynamic ambient background glow */}
      <div className="ambient-glow ambient-glow-1"></div>
      <div className="ambient-glow ambient-glow-2"></div>

      <div className="auth-shell-simple">
        {/* Left Value Showcase */}
        <div className="auth-showcase">
          <div className="brand-logo-large">
            <div className="brand-icon-box-lg">
              <Boxes size={28} />
            </div>
            <span>StockFlow</span>
          </div>

          <h1 className="hero-heading">
            Simple, Powerful Inventory & Stock Tracking
          </h1>
          <p className="hero-subheading">
            Designed for sellers, creators, and warehouse teams to keep an organized list of products, track physical units on hand, and never run out of stock.
          </p>

          <div className="feature-highlight-grid">
            <div className="feature-pill">
              <PackageCheck size={18} color="#10b981" />
              <div>
                <strong>Real-Time Stock Counts</strong>
                <p>Track quantities on hand and receive alerts when items run low.</p>
              </div>
            </div>

            <div className="feature-pill">
              <TrendingUp size={18} color="#6366f1" />
              <div>
                <strong>Fast Stock Adjustments</strong>
                <p>Log received stock, dispatches, and physical inventory audits in seconds.</p>
              </div>
            </div>

            <div className="feature-pill">
              <BellRing size={18} color="#f59e0b" />
              <div>
                <strong>Low-Stock Protection</strong>
                <p>Automatic alerts before items go out of stock so you never miss a sale.</p>
              </div>
            </div>
          </div>

          {/* 1-Click Instant Demo Access */}
          <div className="demo-access-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c7d2fe' }}>
                Instant Preview
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>12 Sample SKUs Preloaded</span>
            </div>
            <button
              type="button"
              className="btn btn-demo-quick"
              onClick={handleDemoAccess}
              disabled={loading}
            >
              <Sparkles size={16} color="#fbbf24" />
              <span>Explore Demo Store (1-Click)</span>
            </button>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: '6px' }}>
              Or sign in with your own account on the right
            </div>
          </div>
        </div>

        {/* Right Auth Form */}
        <div className="auth-form-card">
          <div className="form-toggle-tabs">
            <button
              type="button"
              className={`form-toggle-btn ${activeTab === 'signin' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('signin');
                setError('');
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`form-toggle-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('register');
                setError('');
              }}
            >
              Create Account
            </button>
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '6px' }}>
            {activeTab === 'signin' ? 'Welcome Back' : 'Get Started with StockFlow'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '22px' }}>
            {activeTab === 'signin'
              ? 'Access your inventory dashboard and stock records.'
              : 'Create your private workspace to start tracking products.'}
          </p>

          {error && (
            <div className="error-alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {activeTab === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label">Store / Company Name *</label>
                  <div className="input-with-icon">
                    <Building2 size={16} className="input-icon" />
                    <input
                      type="text"
                      className="form-input with-left-icon"
                      placeholder="e.g. Apex Supplies, Oak & Iron Studio"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <div className="input-with-icon">
                    <User size={16} className="input-icon" />
                    <input
                      type="text"
                      className="form-input with-left-icon"
                      placeholder="e.g. Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className="form-input with-left-icon"
                  placeholder="seller@store.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  className="form-input with-left-icon"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              {activeTab === 'register' && (
                <div className="form-helper">At least 6 characters</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-submit"
              disabled={loading}
            >
              {loading ? (
                'Loading...'
              ) : (
                <>
                  <span>{activeTab === 'signin' ? 'Sign In' : 'Create Free Workspace'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-note">
            <CheckCircle2 size={14} color="#10b981" />
            <span>Secure workspace. All product & stock data is private to you.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
