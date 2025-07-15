const expres = require('express');
const verifyToken = require('../middleware/auth');
const { getWriting, setWriting, userPostWritingAnswer, getUserWritingAnswersByMonth, } = require('../controllers/writingController');
const router = expres.Router();

// Mock uchun writinglarni olish
router.post('/:mock_id/writing/add', setWriting);
router.get('/:mock_id/writing/get', getWriting);

// user javoblari
router.post('/writing/submit', userPostWritingAnswer)

router.get('/writing/answers/:monthId/:userId', getUserWritingAnswersByMonth)




module.exports = router;