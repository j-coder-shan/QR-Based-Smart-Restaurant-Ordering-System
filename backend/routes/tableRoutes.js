const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { verifyToken } = require('../controllers/adminController');

router.get('/', tableController.getTables);
router.get('/:tableNumber', tableController.getTableByNumber);
router.post('/', verifyToken, tableController.createTable);
router.put('/:id/regenerate', verifyToken, tableController.regenerateQR);
router.delete('/:id', verifyToken, tableController.deleteTable);

module.exports = router;
