import React, { useState } from 'react';
import AppLayout from '../../components/common/AppLayout';
import { Button, Input } from '../../components/common';
import { validatePassword } from '../../utils/validators';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const checks = [
  { label: '8–16 characters', test: v => v.length >= 8 && v.length <= 16 },
  { label: 'One uppercase letter', test: v => /[A-Z]/.test(v) },
  { label: 'One special character', test: v => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

export default function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(er => ({ ...er, [k]: null })); };

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Current password is required';
    const pe = validatePassword(form.newPassword); if (pe) e.newPassword = pe;
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await api.put('/auth/password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password updated successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password';
      toast.error(msg);
      if (msg.toLowerCase().includes('current')) setErrors({ currentPassword: msg });
    } finally { setLoading(false); }
  };

  const PwdField = ({ label, k, show, setShow }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          className={`form-input ${errors[k] ? 'input-error' : ''}`}
          type={show ? 'text' : 'password'}
          value={form[k]}
          onChange={set(k)}
          style={{ paddingRight: 44 }}
          placeholder="••••••••"
        />
        <button type="button" onClick={() => setShow(s => !s)}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>
          {show ? '🙈' : '👁'}
        </button>
      </div>
      {errors[k] && <span className="form-error">{errors[k]}</span>}
    </div>
  );

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account preferences</p>
      </div>
      <div className="page-body">
        <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Profile card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Profile Information</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div className="user-avatar" style={{ width: 56, height: 56, fontSize: '1.2rem' }}>
                {user?.name?.trim().split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>{user?.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.email}</div>
              </div>
            </div>
            <div className="detail-grid">
              <div className="detail-item"><span className="detail-label">Role</span><span className="detail-value" style={{ textTransform: 'capitalize' }}>{user?.role}</span></div>
              <div className="detail-item" style={{ gridColumn: '1/-1' }}><span className="detail-label">Address</span><span className="detail-value">{user?.address || 'Not set'}</span></div>
            </div>
          </div>

          {/* Change password */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Change Password</div>
                <div className="card-subtitle">Keep your account secure</div>
              </div>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <PwdField label="Current Password" k="currentPassword" show={showCurrent} setShow={setShowCurrent} />
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className={`form-input ${errors.newPassword ? 'input-error' : ''}`}
                    type={showNew ? 'text' : 'password'}
                    value={form.newPassword}
                    onChange={set('newPassword')}
                    style={{ paddingRight: 44 }}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowNew(s => !s)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>
                    {showNew ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.newPassword && <span className="form-error">{errors.newPassword}</span>}
                {form.newPassword && (
                  <div className="pwd-hints">
                    {checks.map(c => (
                      <div key={c.label} className={`pwd-hint ${c.test(form.newPassword) ? 'ok' : 'fail'}`}>
                        {c.test(form.newPassword) ? '✓' : '○'} {c.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                  type="password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
              </div>
              <div style={{ marginTop: 4 }}>
                <Button type="submit" loading={loading}>Update Password</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
