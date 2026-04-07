const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { verifyToken } = require('../controllers/adminController');
const { checkAccess } = require('../middleware/checkAccess');

// Admin and public table routes
router.get('/', verifyToken, checkAccess, tableController.getTables);
router.get('/:tableNumber', verifyToken, checkAccess, tableController.getTableByNumber);
router.post('/', verifyToken, checkAccess, tableController.createTable);
router.put('/:id/regenerate', verifyToken, checkAccess, tableController.regenerateQR);
router.delete('/:id', verifyToken, checkAccess, tableController.deleteTable);

module.exports = router;
