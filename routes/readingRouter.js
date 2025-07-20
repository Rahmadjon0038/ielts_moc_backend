const express = require('express');
const { getReadingQuestions, addReadingPart } = require('../controllers/readingController');
const router = express.Router();

router.get('/get/:monthId', getReadingQuestions);
router.post('/add', addReadingPart);


module.exports = router;
