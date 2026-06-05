import React, { useEffect, useState, useCallback } from 'react';
import AppLayout from '../../components/common/AppLayout';
import { LoadingSpinner, Pagination, EmptyState } from '../../components/common';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function OwnerRatings() {
  const [ratings, setRatings] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchRatings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/stores/my-store/ratings', { params: { page, limit: 10 } });
      setRatings(data.data); setPagination(data.pagination);
    } catch { toast.error('Failed to load ratings'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchRatings(); }, [fetchRatings]);

  const renderStars = (n) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < n ? 'var(--star-active)' : 'var(--star-inactive)', fontSize: '1rem' }}>★</span>
    ));

  const getInitials = (name) => name?.trim().split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Store Ratings</h1>
        <p className="page-subtitle">{pagination.total} customer ratings</p>
      </div>
      <div className="page-body">
        <div className="card" style={{ padding: 0 }}>
          {loading ? <LoadingSpinner text="Loading ratings…" /> : ratings.length === 0 ? (
            <EmptyState icon="⭐" title="No ratings yet" subtitle="Customers will appear here once they rate your store" />
          ) : (
            <>
              <div style={{ padding: '0 0 0 0' }}>
                {ratings.map((r, i) => (
                  <div key={r.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 20px',
                    borderBottom: i < ratings.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.15s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="user-avatar" style={{ width: 40, height: 40, flexShrink: 0 }}>
                      {getInitials(r.user_name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{r.user_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.user_email}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <div style={{ display: 'flex' }}>{renderStars(r.rating)}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(r.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{
                      minWidth: 36, height: 36, borderRadius: 8,
                      background: r.rating >= 4 ? 'rgba(67,233,123,0.1)' : r.rating >= 3 ? 'rgba(255,169,77,0.1)' : 'rgba(255,77,109,0.1)',
                      color: r.rating >= 4 ? 'var(--accent3)' : r.rating >= 3 ? 'var(--warning)' : 'var(--danger)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: '1rem',
                      flexShrink: 0
                    }}>
                      {r.rating}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                <Pagination page={pagination.page} totalPages={pagination.totalPages} onPage={setPage} />
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
