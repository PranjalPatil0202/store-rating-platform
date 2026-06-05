import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/common/AppLayout';
import { LoadingSpinner } from '../../components/common';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function OwnerStore() {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stores/my-store')
      .then(r => setStore(r.data.data))
      .catch(() => toast.error('Failed to load store info'))
      .finally(() => setLoading(false));
  }, []);

  const renderStars = (avg) => {
    if (!avg) return null;
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < Math.round(avg) ? 'var(--star-active)' : 'var(--star-inactive)', fontSize: '1.4rem' }}>★</span>
    ));
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">My Store</h1>
        <p className="page-subtitle">Your store overview and performance</p>
      </div>
      <div className="page-body">
        {loading ? <LoadingSpinner text="Loading store…" /> : !store ? (
          <div className="card">
            <p style={{ color: 'var(--text-muted)' }}>No store is assigned to your account. Please contact an administrator.</p>
          </div>
        ) : (
          <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Store Info Card */}
            <div className="card">
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 'var(--radius)', background: 'var(--accent-glow)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>🏪</div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 4 }}>{store.name}</h2>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>{store.email}</div>
                </div>
              </div>
              <div className="detail-grid">
                <div className="detail-item" style={{ gridColumn: '1/-1' }}>
                  <span className="detail-label">Address</span>
                  <span className="detail-value">📍 {store.address}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Listed Since</span>
                  <span className="detail-value">{new Date(store.created_at).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Ratings</span>
                  <span className="detail-value">{store.total_ratings || 0}</span>
                </div>
              </div>
            </div>

            {/* Rating Card */}
            <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Average Rating</div>
              {store.avg_rating ? (
                <>
                  <div style={{ fontSize: '4rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--star-active)', lineHeight: 1, marginBottom: 8 }}>
                    {Number(store.avg_rating).toFixed(1)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    {renderStars(store.avg_rating)}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Based on {store.total_ratings} rating{store.total_ratings !== 1 ? 's' : ''}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '3rem', marginBottom: 8 }}>🌟</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No ratings yet</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>Customers can rate your store once they visit</div>
                </>
              )}
            </div>

            {/* Quick Link */}
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>View Detailed Ratings</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 2 }}>See who rated your store and when</div>
              </div>
              <a href="/owner/ratings" style={{ background: 'var(--accent)', color: '#fff', padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
                View Ratings →
              </a>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
