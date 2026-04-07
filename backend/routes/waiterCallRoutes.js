const express = require('express');
const router = express.Router();
const waiterCallController = require('../controllers/waiterCallController');
const { verifyToken } = require('../controllers/adminController');
const { checkAccess } = require('../middleware/checkAccess');

router.post('/', waiterCallController.createWaiterCall); // Public for customers
router.get('/', verifyToken, checkAccess, waiterCallController.getAllWaiterCalls);
router.put('/:id/resolve', verifyToken, checkAccess, waiterCallController.resolveWaiterCall);

module.exports = router;
