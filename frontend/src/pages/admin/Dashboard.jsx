import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/common/AppLayout';
import { LoadingSpinner } from '../../components/common';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setStats(r.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Platform overview and statistics</p>
      </div>
      <div className="page-body">
        {loading ? <LoadingSpinner text="Loading stats…" /> : (
          <>
            <div className="stats-grid">
              <div className="stat-card stat-purple">
                <div className="stat-icon purple">👥</div>
                <div>
                  <div className="stat-value">{stats?.totalUsers ?? 0}</div>
                  <div className="stat-label">Total Users</div>
                </div>
              </div>
              <div className="stat-card stat-pink">
                <div className="stat-icon pink">🏪</div>
                <div>
                  <div className="stat-value">{stats?.totalStores ?? 0}</div>
                  <div className="stat-label">Total Stores</div>
                </div>
              </div>
              <div className="stat-card stat-green">
                <div className="stat-icon green">⭐</div>
                <div>
                  <div className="stat-value">{stats?.totalRatings ?? 0}</div>
                  <div className="stat-label">Total Ratings</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 8 }}>
              <div className="card-header">
                <div>
                  <div className="card-title">Quick Actions</div>
                  <div className="card-subtitle">Manage your platform</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {[
                  { icon: '👤', label: 'Add User', to: '/admin/users?action=add', desc: 'Create a new user account' },
                  { icon: '🏪', label: 'Add Store', to: '/admin/stores?action=add', desc: 'Register a new store' },
                  { icon: '📋', label: 'View Users', to: '/admin/users', desc: 'Manage all users' },
                  { icon: '🗂', label: 'View Stores', to: '/admin/stores', desc: 'Manage all stores' },
                ].map(item => (
                  <a key={item.label} href={item.to} style={{ textDecoration: 'none' }}>
                    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', cursor: 'pointer', transition: 'var(--transition)' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}>
                      <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>{item.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{item.label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{item.desc}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
