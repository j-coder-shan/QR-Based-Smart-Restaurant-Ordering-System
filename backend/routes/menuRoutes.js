const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { verifyToken } = require('../controllers/adminController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../public/images');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.get('/', menuController.getMenu);
router.get('/categories', menuController.getCategories);
router.post('/categories', verifyToken, menuController.createCategory);
router.get('/:id', menuController.getMenuItem);
router.post('/', verifyToken, upload.single('image'), menuController.createMenuItem);
router.put('/:id', verifyToken, upload.single('image'), menuController.updateMenuItem);
router.delete('/categories/:category', verifyToken, menuController.deleteCategory);
router.delete('/:id', verifyToken, menuController.deleteMenuItem);

module.exports = router;
