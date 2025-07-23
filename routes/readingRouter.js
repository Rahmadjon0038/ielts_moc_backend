const express = require('express');
const { getQuestionReading, addQuestionReading } = require('../controllers/readingController');
const { submitReadingAnswers, getReadingAnswers } = require('../controllers/readingAnswerController');
const router = express.Router();

router.get('/get/:monthId', getQuestionReading);
router.get('/answers', getReadingAnswers);
router.post('/sumbit',submitReadingAnswers)
router.post('/add', addQuestionReading);





module.exports = router;
