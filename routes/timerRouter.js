const express = require('express');
const { startSection, fetchStartTime } = require('../controllers/timerController');

const router = express.Router();

// POST /api/section-time/start
// body: { userId, section }
router.post('/start', startSection);

// GET /api/section-time/:userId/:section/:monthNumber
// monthNumber — bu shunchaki raqam: 1, 2, ..., 12
router.get('/:userId/:section/:monthId', fetchStartTime);

module.exports = router;
