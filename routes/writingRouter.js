const express = require('express');
const upload = require('../middleware/upload');
const {
    getWriting,
    setWriting,
    userPostWritingAnswer,
    getUserWritingAnswersByMonth,
    setUserRaiting,
    getUserRaiting,
    getAllRaitingsByMonth,
} = require('../controllers/writingController');

const router = express.Router();

router.post(
    '/:mock_id/writing/add',
    upload.fields([
        { name: 'task1Image', maxCount: 1 },
        { name: 'task2Image', maxCount: 1 },
    ]),
    setWriting
);

router.get('/:mock_id/writing/get', getWriting);
router.post('/writing/submit', userPostWritingAnswer);
router.get('/writing/answers/:monthId/:userId', getUserWritingAnswersByMonth);

// ---------------- user raitings ------------------
router.post('/writing/setraitings/:montId/:userid', setUserRaiting)
router.get('/writing/getraitings/:montId/:userid', getUserRaiting)

// ---------------- user all ------------------

router.get('/writing/getallraitings/:montId/:userid', getAllRaitingsByMonth)

module.exports = router;
