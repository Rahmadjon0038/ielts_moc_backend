const express = require('express');
const router = express.Router()
const uploadAudio = require('../middleware/uploadAudio');
const { addAudioTask, getAudioTasks } = require('../controllers/audiController');
router.post('/add', uploadAudio.single('audio'), addAudioTask);
router.get('/get/:monthId', getAudioTasks);

module.exports = router;
