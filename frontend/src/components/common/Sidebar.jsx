import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navConfig = {
  admin: [
    { label: 'Dashboard', icon: '▦', to: '/admin/dashboard' },
    { label: 'Users', icon: '👥', to: '/admin/users' },
    { label: 'Stores', icon: '🏪', to: '/admin/stores' },
  ],
  user: [
    { label: 'Browse Stores', icon: '🏪', to: '/user/stores' },
    { label: 'Settings', icon: '⚙', to: '/user/settings' },
  ],
  owner: [
    { label: 'My Store', icon: '🏪', to: '/owner/store' },
    { label: 'Ratings', icon: '⭐', to: '/owner/ratings' },
    { label: 'Settings', icon: '⚙', to: '/owner/settings' },
  ],
};

const roleLabel = { admin: 'Administrator', user: 'User', owner: 'Store Owner' };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = navConfig[user?.role] || [];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.trim().split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?';

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{ display: 'none', position: 'fixed', top: 16, left: 16, zIndex: 200, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', fontSize: '1rem' }}
      >
        ☰
      </button>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-text">⭐ RateStore</div>
          <div className="sidebar-logo-sub">Rating Platform</div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">Menu</div>
          {links.map(({ label, icon, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name?.split(' ')[0]}</div>
              <div className="user-role">{roleLabel[user?.role]}</div>
            </div>
          </div>
          <button className="nav-link w-full" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            <span className="nav-icon">⏏</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
