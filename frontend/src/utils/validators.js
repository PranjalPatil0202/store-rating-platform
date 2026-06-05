export const validateName = (val) => {
  if (!val?.trim()) return 'Name is required';
  if (val.trim().length < 20) return 'Name must be at least 20 characters';
  if (val.trim().length > 60) return 'Name must not exceed 60 characters';
  return null;
};

export const validateEmail = (val) => {
  if (!val?.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Enter a valid email address';
  return null;
};

export const validatePassword = (val) => {
  if (!val) return 'Password is required';
  if (val.length < 8 || val.length > 16) return 'Password must be 8-16 characters';
  if (!/[A-Z]/.test(val)) return 'Must include at least one uppercase letter';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(val)) return 'Must include at least one special character';
  return null;
};

export const validateAddress = (val) => {
  if (val && val.trim().length > 400) return 'Address must not exceed 400 characters';
  return null;
};
