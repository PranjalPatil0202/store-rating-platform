const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getStores, submitRating } = require('../controllers/storeController');
const { getMyStore, getStoreRatings } = require('../controllers/ownerController');
const { ratingValidation } = require('../validators');

// Public store listing (auth optional for user_rating field)
router.get('/', authenticate, getStores);
router.post('/:id/rate', authenticate, authorize('user'), ratingValidation, submitRating);

// Owner routes
router.get('/my-store', authenticate, authorize('owner'), getMyStore);
router.get('/my-store/ratings', authenticate, authorize('owner'), getStoreRatings);

module.exports = router;
