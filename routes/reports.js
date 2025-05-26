const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportsController');

router.post('/export', controller.exportReport);

module.exports = router;
