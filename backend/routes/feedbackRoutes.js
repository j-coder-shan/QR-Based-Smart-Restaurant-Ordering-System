const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

const { verifyToken } = require('../controllers/adminController');

router.post('/', feedbackController.submitFeedback);
router.get('/menu/:menuItemId', feedbackController.getMenuItemFeedback);
router.get('/', verifyToken, feedbackController.getAllFeedback);

module.exports = router;
