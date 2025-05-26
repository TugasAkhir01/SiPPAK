const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', verifyToken, userController.getUsers);
router.get('/:id', verifyToken, userController.getUser);
router.put('/:id', verifyToken, userController.updateUserManagement);
router.post('/add', verifyToken, upload.single('photo'), userController.register);
router.delete('/:id', verifyToken, userController.deleteUser);
router.put('/profile/:id', verifyToken, userController.updateUser);

module.exports = router;
