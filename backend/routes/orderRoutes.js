const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../controllers/adminController');
const { checkAccess } = require('../middleware/checkAccess');

router.post('/', orderController.createOrder); // Public for customers
router.get('/', verifyToken, checkAccess, orderController.getAllOrders);
router.get('/:id', verifyToken, checkAccess, orderController.getOrderById);
router.put('/:id/status', verifyToken, checkAccess, orderController.updateOrderStatus);

module.exports = router;
