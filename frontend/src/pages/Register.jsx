import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Textarea } from '../components/common';
import { validateName, validateEmail, validatePassword, validateAddress } from '../utils/validators';
import toast from 'react-hot-toast';

const checks = [
  { label: '8–16 characters', test: v => v.length >= 8 && v.length <= 16 },
  { label: 'One uppercase letter', test: v => /[A-Z]/.test(v) },
  { label: 'One special character', test: v => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const validate = () => {
    const e = {};
    const ne = validateName(form.name); if (ne) e.name = ne;
    const ee = validateEmail(form.email); if (ee) e.email = ee;
    const pe = validatePassword(form.password); if (pe) e.password = pe;
    const ae = validateAddress(form.address); if (ae) e.address = ae;
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/user/stores');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErrors({ email: msg });
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(er => ({ ...er, [k]: null })); };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-logo">⭐ RateStore</div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Join to start rating stores</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input label="Full Name" placeholder="At least 20 characters" value={form.name} onChange={set('name')} error={errors.name} hint="20–60 characters" />
          <Input label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} />
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                type={showPwd ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={form.password}
                onChange={set('password')}
                style={{ paddingRight: '44px' }}
              />
              <button type="button" onClick={() => setShowPwd(s => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1rem', cursor: 'pointer' }}>
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
            {form.password && (
              <div className="pwd-hints">
                {checks.map(c => (
                  <div key={c.label} className={`pwd-hint ${c.test(form.password) ? 'ok' : 'fail'}`}>
                    {c.test(form.password) ? '✓' : '○'} {c.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Address <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
            <textarea className={`form-input form-textarea ${errors.address ? 'input-error' : ''}`} placeholder="Your address" value={form.address} onChange={set('address')} rows={2} />
            {errors.address && <span className="form-error">{errors.address}</span>}
          </div>
          <Button type="submit" loading={loading} style={{ marginTop: 4 }}>Create Account</Button>
        </form>
        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
