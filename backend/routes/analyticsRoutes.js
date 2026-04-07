const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken } = require('../controllers/adminController');

router.get('/summary', verifyToken, analyticsController.getSummary);
router.get('/revenue', verifyToken, analyticsController.getRevenueData);
router.get('/popular', verifyToken, analyticsController.getPopularItems);
router.get('/categories', verifyToken, analyticsController.getCategoryStats);

module.exports = router;
