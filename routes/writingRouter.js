const expres = require('express');
const verifyToken = require('../middleware/auth');
const { getWriting, setWriting } = require('../controllers/writingController');
const router = expres.Router();

router.post('/:mock_id/writing/add', setWriting);

// Mock uchun writinglarni olish
router.get('/:mock_id/writing/get', getWriting);



module.exports = router;