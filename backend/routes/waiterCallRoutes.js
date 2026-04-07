const express = require('express');
const router = express.Router();
const waiterCallController = require('../controllers/waiterCallController');

router.post('/', waiterCallController.createWaiterCall);
router.get('/', waiterCallController.getAllWaiterCalls);
router.put('/:id/resolve', waiterCallController.resolveWaiterCall);

module.exports = router;
