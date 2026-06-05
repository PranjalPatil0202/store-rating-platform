const router = require('express').Router();
const { register, login, getProfile, updatePassword } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');
const { registerValidation, loginValidation, passwordUpdateValidation } = require('../validators');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', authenticate, getProfile);
router.put('/password', authenticate, passwordUpdateValidation, updatePassword);

module.exports = router;
