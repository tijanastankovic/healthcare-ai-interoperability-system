const express = require('express');
const router = express.Router();

const { analyzePatient } = require('../controllers/aiController');

router.post('/analyze', analyzePatient);

module.exports = router;