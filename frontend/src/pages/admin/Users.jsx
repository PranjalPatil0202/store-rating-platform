import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import AppLayout from '../../components/common/AppLayout';
import { Button, Badge, Modal, Input, Select, LoadingSpinner, Pagination, EmptyState } from '../../components/common';
import { validateName, validateEmail, validatePassword, validateAddress } from '../../utils/validators';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ROLES = ['admin', 'user', 'owner'];
const emptyForm = { name: '', email: '', password: '', address: '', role: 'user' };

export default function AdminUsers() {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // 'create' | 'edit' | 'view' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search, sortBy, sortDir };
      if (roleFilter) params.role = roleFilter;
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, search, roleFilter, sortBy, sortDir]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [search, roleFilter]);

  const openCreate = () => { setForm(emptyForm); setErrors({}); setModal('create'); };
  const openEdit = (u) => { setSelected(u); setForm({ name: u.name, email: u.email, password: '', address: u.address || '', role: u.role }); setErrors({}); setModal('edit'); };
  const openView = async (u) => {
    try {
      const { data } = await api.get(`/admin/users/${u.id}`);
      setSelected(data.data); setModal('view');
    } catch { toast.error('Failed to load user details'); }
  };
  const openDelete = (u) => { setSelected(u); setModal('delete'); };

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const validate = (isEdit) => {
    const e = {};
    const ne = validateName(form.name); if (ne) e.name = ne;
    const ee = validateEmail(form.email); if (ee) e.email = ee;
    if (!isEdit || form.password) { const pe = validatePassword(form.password); if (pe) e.password = pe; }
    const ae = validateAddress(form.address); if (ae) e.address = ae;
    if (!form.role) e.role = 'Role required';
    return e;
  };

  const handleSave = async () => {
    const isEdit = modal === 'edit';
    const errs = validate(isEdit);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (isEdit) {
        const payload = { name: form.name, email: form.email, address: form.address, role: form.role };
        await api.put(`/admin/users/${selected.id}`, payload);
        toast.success('User updated');
      } else {
        await api.post('/admin/users', form);
        toast.success('User created');
      }
      setModal(null); fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error saving user';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErrors({ email: msg });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/admin/users/${selected.id}`);
      toast.success('User deleted');
      setModal(null); fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    finally { setSaving(false); }
  };

  const SortTh = ({ col, label }) => (
    <th className={`sortable ${sortBy === col ? 'sort-active' : ''}`} onClick={() => handleSort(col)}>
      {label} <span className="sort-icon">{sortBy === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
    </th>
  );

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(er => ({ ...er, [k]: null })); };

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <p className="page-subtitle">{pagination.total} total users</p>
      </div>
      <div className="page-body">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input className="form-input search-input" placeholder="Search name, email, address…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select style={{ width: 130 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </Select>
          </div>
          <div className="toolbar-right">
            <Button onClick={openCreate}>+ Add User</Button>
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? <LoadingSpinner text="Loading users…" /> : users.length === 0 ? (
            <EmptyState icon="👥" title="No users found" subtitle="Try adjusting your search or filters" />
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <SortTh col="name" label="Name" />
                      <SortTh col="email" label="Email" />
                      <SortTh col="address" label="Address" />
                      <SortTh col="role" label="Role" />
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td style={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.address || '—'}</td>
                        <td><Badge variant={u.role}>{u.role}</Badge></td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="actions">
                            <button className="action-btn view" title="View" onClick={() => openView(u)}>👁</button>
                            <button className="action-btn edit" title="Edit" onClick={() => openEdit(u)}>✏</button>
                            <button className="action-btn delete" title="Delete" onClick={() => openDelete(u)}>🗑</button>
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

      {/* Create/Edit Modal */}
      <Modal isOpen={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'edit' ? 'Edit User' : 'Add New User'} size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Full Name" placeholder="Min. 20 characters" value={form.name} onChange={set('name')} error={errors.name} />
          <Input label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} />
          {modal === 'create' && (
            <Input label="Password" type="password" placeholder="8-16 chars, uppercase + special" value={form.password} onChange={set('password')} error={errors.password} />
          )}
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className="form-input form-textarea" rows={2} value={form.address} onChange={set('address')} placeholder="Optional" />
            {errors.address && <span className="form-error">{errors.address}</span>}
          </div>
          <Select label="Role" value={form.role} onChange={set('role')} error={errors.role}>
            {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </Select>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{modal === 'edit' ? 'Update' : 'Create'} User</Button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={modal === 'view'} onClose={() => setModal(null)} title="User Details" size="md">
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="user-avatar" style={{ width: 52, height: 52, fontSize: '1.1rem' }}>
                {selected.name.trim().split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>{selected.name}</div>
                <Badge variant={selected.role}>{selected.role}</Badge>
              </div>
            </div>
            <div className="divider" />
            <div className="detail-grid">
              <div className="detail-item"><span className="detail-label">Email</span><span className="detail-value">{selected.email}</span></div>
              <div className="detail-item"><span className="detail-label">Joined</span><span className="detail-value">{new Date(selected.created_at).toLocaleDateString()}</span></div>
              <div className="detail-item" style={{ gridColumn: '1/-1' }}><span className="detail-label">Address</span><span className="detail-value">{selected.address || '—'}</span></div>
              {selected.avg_store_rating && (
                <div className="detail-item"><span className="detail-label">Store Avg Rating</span><span className="detail-value" style={{ color: 'var(--star-active)' }}>★ {selected.avg_store_rating}</span></div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="secondary" onClick={() => setModal(null)}>Close</Button>
              <Button onClick={() => { setModal(null); setTimeout(() => openEdit(selected), 100); }}>Edit User</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={modal === 'delete'} onClose={() => setModal(null)} title="Delete User" size="sm">
        <p className="confirm-text">Are you sure you want to delete <strong>{selected?.name}</strong>? This action cannot be undone.</p>
        <div className="confirm-actions">
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>Delete</Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
