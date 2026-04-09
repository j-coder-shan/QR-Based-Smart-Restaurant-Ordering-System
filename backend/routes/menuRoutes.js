const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { verifyToken } = require('../controllers/adminController');
const { checkAccess } = require('../middleware/checkAccess');
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

router.get('/', verifyToken, checkAccess, menuController.getMenu);
router.get('/categories', verifyToken, checkAccess, menuController.getCategories);
router.post('/categories', verifyToken, checkAccess, menuController.createCategory);
router.get('/:id', verifyToken, checkAccess, menuController.getMenuItem);
router.post('/', verifyToken, checkAccess, upload.single('image'), menuController.createMenuItem);
router.put('/:id', verifyToken, checkAccess, upload.single('image'), menuController.updateMenuItem);
router.delete('/categories/:category', verifyToken, checkAccess, menuController.deleteCategory);
router.delete('/:id', verifyToken, checkAccess, menuController.deleteMenuItem);

module.exports = router;
