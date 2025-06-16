const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const uploadProfile = require('../middleware/uploadProfileMiddleware');

router.get('/', verifyToken, userController.getUsers);
router.get('/:id', verifyToken, userController.getUser);
router.post('/add', verifyToken, userController.addUserManagement);
router.put('/:id', verifyToken, userController.updateUserManagement);
router.post('/register', verifyToken, uploadProfile.single('photo'), userController.register);
router.delete('/:id', verifyToken, userController.deleteUser);
router.put('/profile/:id', verifyToken, userController.updateUser);
router.put('/profile/:id/photo', verifyToken, uploadProfile.single('photo'), userController.updateUserPhoto);

module.exports = router;
