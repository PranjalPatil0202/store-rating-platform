import React, { useEffect, useState, useCallback } from 'react';
import AppLayout from '../../components/common/AppLayout';
import { Button, Modal, Input, Select, LoadingSpinner, Pagination, EmptyState } from '../../components/common';
import { validateName, validateEmail, validateAddress } from '../../utils/validators';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const emptyForm = { name: '', email: '', address: '', owner_id: '' };

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('s.name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/stores', { params: { page, limit: 10, search, sortBy, sortDir } });
      setStores(data.data); setPagination(data.pagination);
    } catch { toast.error('Failed to load stores'); }
    finally { setLoading(false); }
  }, [page, search, sortBy, sortDir]);

  useEffect(() => { fetchStores(); }, [fetchStores]);
  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => {
    api.get('/admin/owners').then(r => setOwners(r.data.data)).catch(() => {});
  }, []);

  const openCreate = () => { setForm(emptyForm); setErrors({}); setModal('create'); };
  const openEdit = (s) => { setSelected(s); setForm({ name: s.name, email: s.email, address: s.address, owner_id: s.owner_id || '' }); setErrors({}); setModal('edit'); };
  const openDelete = (s) => { setSelected(s); setModal('delete'); };

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const validate = () => {
    const e = {};
    const ne = validateName(form.name); if (ne) e.name = ne;
    const ee = validateEmail(form.email); if (ee) e.email = ee;
    if (!form.address?.trim()) e.address = 'Address is required';
    else { const ae = validateAddress(form.address); if (ae) e.address = ae; }
    return e;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = { ...form, owner_id: form.owner_id || null };
      if (modal === 'edit') { await api.put(`/admin/stores/${selected.id}`, payload); toast.success('Store updated'); }
      else { await api.post('/admin/stores', payload); toast.success('Store created'); }
      setModal(null); fetchStores();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error saving store';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErrors({ email: msg });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/admin/stores/${selected.id}`);
      toast.success('Store deleted'); setModal(null); fetchStores();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    finally { setSaving(false); }
  };

  const SortTh = ({ col, label }) => (
    <th className={`sortable ${sortBy === col ? 'sort-active' : ''}`} onClick={() => handleSort(col)}>
      {label} <span className="sort-icon">{sortBy === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
    </th>
  );

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(er => ({ ...er, [k]: null })); };

  const renderStars = (avg) => {
    if (!avg) return <span style={{ color: 'var(--text-muted)' }}>No ratings</span>;
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: 'var(--star-active)', fontWeight: 700 }}>{Number(avg).toFixed(1)}</span>
        <span style={{ color: 'var(--star-active)' }}>★</span>
      </span>
    );
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Stores</h1>
        <p className="page-subtitle">{pagination.total} total stores</p>
      </div>
      <div className="page-body">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input className="form-input search-input" placeholder="Search name, email, address…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="toolbar-right">
            <Button onClick={openCreate}>+ Add Store</Button>
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? <LoadingSpinner text="Loading stores…" /> : stores.length === 0 ? (
            <EmptyState icon="🏪" title="No stores found" subtitle="Add your first store or try a different search" action={<Button onClick={openCreate}>Add Store</Button>} />
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <SortTh col="s.name" label="Store Name" />
                      <SortTh col="email" label="Email" />
                      <SortTh col="s.address" label="Address" />
                      <th>Owner</th>
                      <SortTh col="avg_rating" label="Rating" />
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map(s => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td>{s.email}</td>
                        <td style={{ maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.address}</td>
                        <td>{s.owner_name || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                        <td>{renderStars(s.avg_rating)} {s.rating_count > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({s.rating_count})</span>}</td>
                        <td>
                          <div className="actions">
                            <button className="action-btn edit" title="Edit" onClick={() => openEdit(s)}>✏</button>
                            <button className="action-btn delete" title="Delete" onClick={() => openDelete(s)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '12px 16px' }}>
                <Pagination page={pagination.page} totalPages={pagination.totalPages} onPage={setPage} />
              </div>
            </>
          )}
        </div>
      </div>

      <Modal isOpen={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'edit' ? 'Edit Store' : 'Add New Store'} size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Store Name" placeholder="Min. 20 characters" value={form.name} onChange={set('name')} error={errors.name} />
          <Input label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} />
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className={`form-input form-textarea ${errors.address ? 'input-error' : ''}`} rows={2} value={form.address} onChange={set('address')} placeholder="Store address (required)" />
            {errors.address && <span className="form-error">{errors.address}</span>}
          </div>
          <Select label="Store Owner (optional)" value={form.owner_id} onChange={set('owner_id')}>
            <option value="">No Owner Assigned</option>
            {owners.map(o => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
          </Select>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{modal === 'edit' ? 'Update' : 'Create'} Store</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modal === 'delete'} onClose={() => setModal(null)} title="Delete Store" size="sm">
        <p className="confirm-text">Delete <strong>{selected?.name}</strong>? All associated ratings will also be removed.</p>
        <div className="confirm-actions">
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>Delete</Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
