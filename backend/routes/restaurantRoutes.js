const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Public
router.post('/register', restaurantController.register);
router.post('/verify-license', restaurantController.verifyLicense);

// Protected (Restaurant level)
router.use(verifyToken);
// Optional subscription check can be applied individually later
router.post('/activate-subscription', restaurantController.activateSubscription);

module.exports = router;
