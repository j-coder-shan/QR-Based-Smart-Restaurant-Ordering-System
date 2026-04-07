const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../controllers/adminController');
const { checkAccess } = require('../middleware/checkAccess');

router.get('/bill/:sessionId', paymentController.getBillSummary);
router.get('/requests', verifyToken, checkAccess, paymentController.getBillRequests);
router.post('/request-bill', paymentController.requestBill);
router.post('/process', verifyToken, checkAccess, paymentController.processPayment);

module.exports = router;
