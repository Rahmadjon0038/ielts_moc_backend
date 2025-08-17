const express = require('express');
const {
  addListeningAnswer,
  getListeningAnswer
} = require('../controllers/listeningController');
const { createOrUpdateListeningTest, getListeningTest } = require('../controllers/listeningTaskContoller');

const router = express.Router();
router.get('/getanswer/:monthId/:userId', getListeningAnswer);
router.post('/addanswer', addListeningAnswer);

// POST - Yangi task qo‘shish (eski o‘chadi)
router.post('/add/', createOrUpdateListeningTest);

// GET - month_id bo‘yicha tasklarni olish
router.get('/get/:monthId', getListeningTest);

module.exports = router;
