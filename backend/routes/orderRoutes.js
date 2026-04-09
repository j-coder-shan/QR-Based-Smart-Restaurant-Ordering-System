const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../controllers/adminController');
const { checkAccess } = require('../middleware/checkAccess');

router.post('/', orderController.createOrder); // Public for customers
router.get('/', verifyToken, checkAccess, orderController.getAllOrders);
router.get('/:id', (req, res, next) => {
    // Attempt token verification if provided, otherwise proceed for session check
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        return verifyToken(req, res, next);
    }
    next();
}, orderController.getOrderById);
router.put('/:id/status', verifyToken, checkAccess, orderController.updateOrderStatus);

module.exports = router;
