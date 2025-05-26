const express = require('express');
const router = express.Router();
const controller = require('../controllers/violationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/violations', verifyToken, controller.getAll);
router.post('/violations', verifyToken, controller.create);
router.get('/violations/:id', verifyToken, controller.getById);
router.put('/violations/:id', verifyToken, controller.update);
router.delete('/violations/:id', verifyToken, controller.delete);
router.get('/violations/student/:nim', verifyToken, controller.getByNIM);

module.exports = router;
