const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const nameRule = body('name')
  .trim()
  .isLength({ min: 20, max: 60 })
  .withMessage('Name must be between 20 and 60 characters');

const emailRule = body('email')
  .trim()
  .isEmail()
  .withMessage('Please provide a valid email address');

const passwordRule = body('password')
  .isLength({ min: 8, max: 16 })
  .withMessage('Password must be 8-16 characters')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[!@#$%^&*(),.?":{}|<>]/)
  .withMessage('Password must contain at least one special character');

const addressRule = body('address')
  .optional()
  .trim()
  .isLength({ max: 400 })
  .withMessage('Address must not exceed 400 characters');

const registerValidation = [nameRule, emailRule, passwordRule, addressRule, handleValidation];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  handleValidation,
];

const userCreateValidation = [
  nameRule,
  emailRule,
  passwordRule,
  addressRule,
  body('role').isIn(['admin', 'user', 'owner']).withMessage('Invalid role'),
  handleValidation,
];

const userUpdateValidation = [
  nameRule,
  emailRule,
  addressRule,
  body('role').isIn(['admin', 'user', 'owner']).withMessage('Invalid role'),
  handleValidation,
];

const storeValidation = [
  nameRule,
  emailRule,
  body('address').trim().notEmpty().withMessage('Address is required').isLength({ max: 400 }).withMessage('Address max 400 chars'),
  handleValidation,
];

const ratingValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  handleValidation,
];

const passwordUpdateValidation = [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword')
    .isLength({ min: 8, max: 16 }).withMessage('Password must be 8-16 characters')
    .matches(/[A-Z]/).withMessage('Must contain uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Must contain special character'),
  handleValidation,
];

module.exports = {
  registerValidation,
  loginValidation,
  userCreateValidation,
  userUpdateValidation,
  storeValidation,
  ratingValidation,
  passwordUpdateValidation,
};
