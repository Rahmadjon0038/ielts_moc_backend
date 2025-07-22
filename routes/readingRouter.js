const express = require('express');
const { getQuestionReading, addQuestionReading } = require('../controllers/readingController');
const router = express.Router();

router.get('/get/:monthId', getQuestionReading);
router.post('/add', addQuestionReading);


module.exports = router;
