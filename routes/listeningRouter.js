const express = require('express');
const {
  addListeningAnswer,
  getListeningAnswer
} = require('../controllers/listeningController');

const router = express.Router();
router.get('/getanswer/:monthId/:userId', getListeningAnswer);
router.post('/addanswer', addListeningAnswer);

module.exports = router;
