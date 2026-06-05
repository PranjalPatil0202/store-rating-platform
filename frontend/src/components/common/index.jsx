import React from 'react';

export const Button = ({ children, variant = 'primary', size = 'md', loading, disabled, className = '', ...props }) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
    outline: 'btn-outline',
  };
  const sizes = { sm: 'btn-sm', md: '', lg: 'btn-lg' };
  return (
    <button
      className={`btn ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="btn-spinner" /> : null}
      {children}
    </button>
  );
};

export const Input = ({ label, error, hint, className = '', ...props }) => (
  <div className={`form-group ${className}`}>
    {label && <label className="form-label">{label}</label>}
    <input className={`form-input ${error ? 'input-error' : ''}`} {...props} />
    {error && <span className="form-error">{error}</span>}
    {hint && !error && <span className="form-hint">{hint}</span>}
  </div>
);

export const Select = ({ label, error, children, className = '', ...props }) => (
  <div className={`form-group ${className}`}>
    {label && <label className="form-label">{label}</label>}
    <select className={`form-input form-select ${error ? 'input-error' : ''}`} {...props}>
      {children}
    </select>
    {error && <span className="form-error">{error}</span>}
  </div>
);

export const Textarea = ({ label, error, className = '', ...props }) => (
  <div className={`form-group ${className}`}>
    {label && <label className="form-label">{label}</label>}
    <textarea className={`form-input form-textarea ${error ? 'input-error' : ''}`} {...props} />
    {error && <span className="form-error">{error}</span>}
  </div>
);

export const Badge = ({ children, variant = 'default' }) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal modal-${size}`}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export const StarRating = ({ value, onChange, readonly = false }) => {
  const [hovered, setHovered] = React.useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${(hovered || value) >= star ? 'star-active' : ''}`}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          disabled={readonly}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export const Pagination = ({ page, totalPages, onPage }) => {
  if (totalPages <= 1) return null;
  const pages = [];
  const delta = 2;
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) pages.push(i);
  return (
    <div className="pagination">
      <button className="pg-btn" onClick={() => onPage(page - 1)} disabled={page === 1}>‹</button>
      {pages[0] > 1 && <><button className="pg-btn" onClick={() => onPage(1)}>1</button>{pages[0] > 2 && <span className="pg-dots">…</span>}</>}
      {pages.map(p => (
        <button key={p} className={`pg-btn ${p === page ? 'pg-active' : ''}`} onClick={() => onPage(p)}>{p}</button>
      ))}
      {pages[pages.length - 1] < totalPages && <>{pages[pages.length - 1] < totalPages - 1 && <span className="pg-dots">…</span>}<button className="pg-btn" onClick={() => onPage(totalPages)}>{totalPages}</button></>}
      <button className="pg-btn" onClick={() => onPage(page + 1)} disabled={page === totalPages}>›</button>
    </div>
  );
};

export const LoadingSpinner = ({ size = 'md', text }) => (
  <div className={`loading-container loading-${size}`}>
    <div className="spinner" />
    {text && <p className="loading-text">{text}</p>}
  </div>
);

export const EmptyState = ({ icon = '📭', title, subtitle, action }) => (
  <div className="empty-state">
    <div className="empty-icon">{icon}</div>
    <h3 className="empty-title">{title}</h3>
    {subtitle && <p className="empty-subtitle">{subtitle}</p>}
    {action}
  </div>
);
