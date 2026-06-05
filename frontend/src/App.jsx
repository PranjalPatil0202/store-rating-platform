import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import './styles/global.css';
import './styles/components.css';
import './styles/layout.css';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminStores from './pages/admin/Stores';
import UserStores from './pages/user/Stores';
import UserSettings from './pages/user/Settings';
import OwnerStore from './pages/owner/Store';
import OwnerRatings from './pages/owner/Ratings';
import OwnerSettings from './pages/owner/Settings';

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role === 'admin' ? 'admin/dashboard' : user.role === 'owner' ? 'owner/store' : 'user/stores'}`} replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'owner') return <Navigate to="/owner/store" replace />;
    return <Navigate to="/user/stores" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>} />
      <Route path="/admin/stores" element={<PrivateRoute roles={['admin']}><AdminStores /></PrivateRoute>} />

      {/* User */}
      <Route path="/user/stores" element={<PrivateRoute roles={['user']}><UserStores /></PrivateRoute>} />
      <Route path="/user/settings" element={<PrivateRoute roles={['user']}><UserSettings /></PrivateRoute>} />

      {/* Owner */}
      <Route path="/owner/store" element={<PrivateRoute roles={['owner']}><OwnerStore /></PrivateRoute>} />
      <Route path="/owner/ratings" element={<PrivateRoute roles={['owner']}><OwnerRatings /></PrivateRoute>} />
      <Route path="/owner/settings" element={<PrivateRoute roles={['owner']}><OwnerSettings /></PrivateRoute>} />

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a1d27', color: '#f0f1f6', border: '1px solid #242736', fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem' },
            success: { iconTheme: { primary: '#43e97b', secondary: '#1a1d27' } },
            error: { iconTheme: { primary: '#ff4d6d', secondary: '#1a1d27' } },
            duration: 3500,
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
