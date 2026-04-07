const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken } = require('../controllers/adminController');
const { checkAccess } = require('../middleware/checkAccess');

router.get('/summary', verifyToken, checkAccess, analyticsController.getSummary);
router.get('/revenue', verifyToken, checkAccess, analyticsController.getRevenueData);
router.get('/popular', verifyToken, checkAccess, analyticsController.getPopularItems);
router.get('/categories', verifyToken, checkAccess, analyticsController.getCategoryStats);
router.get('/daily-forecast', verifyToken, checkAccess, analyticsController.getDailyForecast);

module.exports = router;
