const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');

router.get('/', tableController.getTables);
router.get('/:tableNumber', tableController.getTableByNumber);

module.exports = router;
