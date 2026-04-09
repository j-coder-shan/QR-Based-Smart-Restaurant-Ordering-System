const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { verifyToken, isSuperAdmin } = require('../middlewares/authMiddleware');

// Public
router.post('/login', superAdminController.login);

// Protected
router.use(verifyToken);
router.use(isSuperAdmin);

router.get('/analytics', superAdminController.getAnalytics);
router.get('/keys', superAdminController.getAllKeys);
router.post('/keys', superAdminController.generateKeys);
router.get('/restaurants', superAdminController.getAllRestaurants);
router.get('/restaurants/:id', superAdminController.getRestaurantDetails);
router.put('/restaurants/:id/status', superAdminController.updateStatus);
router.put('/restaurants/:id/extend-trial', superAdminController.extendTrial);

module.exports = router;
