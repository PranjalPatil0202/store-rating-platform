const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const admin = require('../controllers/adminController');
const { userCreateValidation, userUpdateValidation, storeValidation } = require('../validators');

router.use(authenticate, authorize('admin'));

router.get('/dashboard', admin.getDashboard);

router.get('/users', admin.getUsers);
router.get('/users/:id', admin.getUserById);
router.post('/users', userCreateValidation, admin.createUser);
router.put('/users/:id', userUpdateValidation, admin.updateUser);
router.delete('/users/:id', admin.deleteUser);

router.get('/stores', admin.getStores);
router.post('/stores', storeValidation, admin.createStore);
router.put('/stores/:id', storeValidation, admin.updateStore);
router.delete('/stores/:id', admin.deleteStore);
router.get('/owners', admin.getOwners);

module.exports = router;
