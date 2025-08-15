const express = require('express');
const {
  addListeningAnswer,
  getListeningAnswer
} = require('../controllers/listeningController');
const { addTask, getTasksByMonth } = require('../controllers/listeningTaskContoller');

const router = express.Router();
router.get('/getanswer/:monthId/:userId', getListeningAnswer);
router.post('/addanswer', addListeningAnswer);

// POST - Yangi task qo‘shish (eski o‘chadi)
router.post('/add/', addTask);

// GET - month_id bo‘yicha tasklarni olish
router.get('/get/:month_id', getTasksByMonth);

module.exports = router;
