const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/bill/:sessionId', paymentController.getBillSummary);
router.get('/requests', paymentController.getBillRequests);
router.post('/request-bill', paymentController.requestBill);
router.post('/process', paymentController.processPayment);

module.exports = router;
