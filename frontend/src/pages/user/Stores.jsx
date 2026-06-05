import React, { useEffect, useState, useCallback } from 'react';
import AppLayout from '../../components/common/AppLayout';
import { Button, StarRating, Modal, LoadingSpinner, Pagination, EmptyState } from '../../components/common';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rateModal, setRateModal] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/stores', { params: { page, limit: 12, search } });
      setStores(data.data); setPagination(data.pagination);
    } catch { toast.error('Failed to load stores'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchStores(); }, [fetchStores]);
  useEffect(() => { setPage(1); }, [search]);

  const openRating = (store) => {
    setRateModal(store);
    setRatingValue(store.user_rating || 0);
  };

  const submitRating = async () => {
    if (!ratingValue) { toast.error('Please select a rating'); return; }
    setRatingLoading(true);
    try {
      await api.post(`/stores/${rateModal.id}/rate`, { rating: ratingValue });
      toast.success(rateModal.user_rating ? 'Rating updated!' : 'Rating submitted!');
      setRateModal(null);
      fetchStores();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit rating'); }
    finally { setRatingLoading(false); }
  };

  const renderAvgRating = (avg, count) => {
    if (!avg) return <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No ratings yet</span>;
    return (
      <div className="avg-rating">
        <span className="avg-score">{Number(avg).toFixed(1)}</span>
        <span className="avg-star">★</span>
        <span className="rating-count">({count})</span>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Browse Stores</h1>
        <p className="page-subtitle">{pagination.total} stores available</p>
      </div>
      <div className="page-body">
        <div className="toolbar" style={{ marginBottom: 20 }}>
          <div className="search-wrap" style={{ maxWidth: 400, flex: 1 }}>
            <span className="search-icon">🔍</span>
            <input className="form-input search-input" placeholder="Search by name or address…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? <LoadingSpinner text="Loading stores…" /> : stores.length === 0 ? (
          <EmptyState icon="🏪" title="No stores found" subtitle="Try a different search term" />
        ) : (
          <>
            <div className="stores-grid">
              {stores.map(store => (
                <div key={store.id} className="store-card">
                  <div className="store-card-header">
                    <div>
                      <div className="store-name">{store.name}</div>
                      <div className="store-email">{store.email}</div>
                    </div>
                    {store.user_rating && (
                      <div style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)', borderRadius: 8, padding: '4px 10px', fontSize: '0.75rem', color: 'var(--accent)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        Your: {store.user_rating}★
                      </div>
                    )}
                  </div>
                  <div className="store-address">
                    <span>📍</span>
                    <span>{store.address}</span>
                  </div>
                  <div className="store-rating-row">
                    {renderAvgRating(store.avg_rating, store.rating_count)}
                    <Button size="sm" variant={store.user_rating ? 'outline' : 'primary'} onClick={() => openRating(store)}>
                      {store.user_rating ? '✏ Update Rating' : '⭐ Rate Store'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onPage={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={!!rateModal} onClose={() => setRateModal(null)} title="Rate This Store" size="sm">
        {rateModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{rateModal.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>📍 {rateModal.address}</div>
            </div>
            <div className="divider" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '12px 0' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 4 }}>
                {rateModal.user_rating ? `Your current rating: ${rateModal.user_rating} star${rateModal.user_rating > 1 ? 's' : ''}` : 'Select your rating:'}
              </p>
              <StarRating value={ratingValue} onChange={setRatingValue} />
              {ratingValue > 0 && (
                <span style={{ color: 'var(--star-active)', fontWeight: 700, fontSize: '1rem' }}>
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][ratingValue]} ({ratingValue}/5)
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setRateModal(null)}>Cancel</Button>
              <Button onClick={submitRating} loading={ratingLoading} disabled={!ratingValue}>
                {rateModal.user_rating ? 'Update Rating' : 'Submit Rating'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
