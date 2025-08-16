const express = require('express');
const router = express.Router();
const uploadAudio = require('../middleware/uploadAudio');
const { addAudioTask, getAudioTasks, deleteAudioTasksByMonth } = require('../controllers/audiController');

router.post('/add', uploadAudio.single('audio'), addAudioTask);
router.get('/get/:monthId', getAudioTasks);

// monthId bo'yicha barcha audio fayllarni o'chirish
router.delete('/delete/:monthId', deleteAudioTasksByMonth);

module.exports = router;
